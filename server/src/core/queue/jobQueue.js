const crypto = require("crypto");
const AutomationJob = require("../../models/AutomationJob");
const lockManager = require("./lockManager");
const { systemControlFlags } = require("../automation/systemControlFlags");

class JobQueue {
  constructor() {
    this.highPriorityQueue = [];
    this.normalPriorityQueue = [];
    this.lowPriorityQueue = [];
    this.isProcessing = false;
  }

  generateIdempotencyKey(jobName, payload = {}) {
    const entityId = payload._id || payload.id || payload.entityId || "none";
    const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
    return crypto
      .createHash("md5")
      .update(`${jobName}_${entityId}_${bucket}`)
      .digest("hex");
  }

  /**
   * Enqueues a job into the appropriate priority queue.
   */
  async enqueue(jobData) {
    if (!systemControlFlags.isQueueEnabled) {
      console.log(`[JobQueue] Queue is currently disabled/paused.`);
      return null;
    }

    const { jobName, payload = {}, type = "IMMEDIATE", priority = "NORMAL", correlationId, idempotencyKey } = jobData;
    const key = idempotencyKey || this.generateIdempotencyKey(jobName, payload);

    // Idempotency Deduplication Check
    const existing = await AutomationJob.findOne({ idempotencyKey: key, status: { $in: ["QUEUED", "RUNNING"] } });
    if (existing) {
      return existing;
    }

    const jobId = `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const jobDoc = await AutomationJob.create({
      jobId,
      jobName,
      type,
      priority,
      status: "QUEUED",
      payload,
      correlationId: correlationId || `CORR-${Date.now()}`,
      idempotencyKey: key,
    });

    if (priority === "HIGH") this.highPriorityQueue.push(jobDoc._id);
    else if (priority === "LOW") this.lowPriorityQueue.push(jobDoc._id);
    else this.normalPriorityQueue.push(jobDoc._id);

    this.triggerProcessing();
    return jobDoc;
  }

  /**
   * Triggers processing loop for queued jobs.
   */
  async triggerProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.highPriorityQueue.length > 0 || this.normalPriorityQueue.length > 0 || this.lowPriorityQueue.length > 0) {
      const jobId = this.highPriorityQueue.shift() || this.normalPriorityQueue.shift() || this.lowPriorityQueue.shift();
      if (jobId) {
        await this.processJob(jobId);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Processes a single job document with lock management and retry / DLQ logic.
   */
  async processJob(jobId) {
    const jobDoc = await AutomationJob.findById(jobId);
    if (!jobDoc || jobDoc.status === "CANCELLED" || jobDoc.status === "PAUSED") return;

    const lockKey = `LOCK-JOB-${jobDoc.jobId}`;
    const acquired = await lockManager.acquireLock(lockKey, 30000);
    if (!acquired) return; // Skip concurrent processing

    const startTime = Date.now();
    jobDoc.status = "RUNNING";
    jobDoc.startedAt = new Date();
    await jobDoc.save();

    try {
      // Execute dummy job work or trigger handler
      jobDoc.status = "COMPLETED";
      jobDoc.completedAt = new Date();
      jobDoc.duration = Date.now() - startTime;
      await jobDoc.save();
    } catch (err) {
      jobDoc.duration = Date.now() - startTime;
      jobDoc.retryCount += 1;
      jobDoc.error = err.message;

      if (jobDoc.retryCount >= jobDoc.maxRetries) {
        jobDoc.status = "DEAD"; // Move to Dead Letter Queue (DLQ)
      } else {
        jobDoc.status = "FAILED";
      }
      await jobDoc.save();
    } finally {
      await lockManager.releaseLock(lockKey);
    }
  }

  /**
   * Manually retries a failed or dead job.
   */
  async retryJob(jobId) {
    const jobDoc = await AutomationJob.findOne({ $or: [{ _id: jobId }, { jobId }] });
    if (!jobDoc) throw new Error("Automation Job not found.");

    jobDoc.status = "QUEUED";
    jobDoc.retryCount += 1;
    jobDoc.error = null;
    await jobDoc.save();

    if (jobDoc.priority === "HIGH") this.highPriorityQueue.push(jobDoc._id);
    else this.normalPriorityQueue.push(jobDoc._id);

    this.triggerProcessing();
    return jobDoc;
  }
}

module.exports = new JobQueue();
