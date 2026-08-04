/**
 * Queue Adapter Abstraction Layer
 * Default Implementation: In-Memory Queue with concurrency control & Dead Letter Queue (FAILED_PERMANENT).
 * Prepared for future BullMQ / Redis / RabbitMQ / AWS SQS swap without refactoring.
 * @module services/queue.service
 */

class QueueAdapter {
  constructor() {
    this.pendingQueue = [];
    this.runningJobs = new Map();
    this.failedJobs = [];
    this.completedCount = 0;
    this.failedCount = 0;
    this.concurrencyLimit = 5;
    this.activeWorkers = 0;
  }

  /**
   * Enqueues an execution task.
   * @param {Object} job Task details: { id, handler, rule, payload }
   */
  async enqueue(job) {
    this.pendingQueue.push({
      ...job,
      enqueuedAt: new Date(),
    });
    this.processQueue();
  }

  /**
   * Queue processor worker loop.
   */
  async processQueue() {
    if (this.activeWorkers >= this.concurrencyLimit || this.pendingQueue.length === 0) {
      return;
    }

    const job = this.pendingQueue.shift();
    this.activeWorkers++;
    this.runningJobs.set(job.id, job);

    setImmediate(async () => {
      try {
        await job.handler(job);
        this.completedCount++;
      } catch (error) {
        this.failedCount++;
        this.failedJobs.push({ ...job, error: error.message, failedAt: new Date() });
      } finally {
        this.runningJobs.delete(job.id);
        this.activeWorkers--;
        this.processQueue();
      }
    });
  }

  /**
   * Returns Queue Health & Statistics.
   */
  getHealth() {
    return {
      adapter: "InMemoryQueueAdapter (BullMQ Ready)",
      runningJobs: this.activeWorkers,
      pendingJobs: this.pendingQueue.length,
      completedJobs: this.completedCount,
      failedJobs: this.failedCount,
      deadLetterQueueCount: this.failedJobs.length,
      concurrencyLimit: this.concurrencyLimit,
    };
  }
}

const queueAdapter = new QueueAdapter();

module.exports = {
  queueAdapter,
};
