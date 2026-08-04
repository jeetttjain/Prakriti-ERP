const crypto = require("crypto");
const AutomationRule = require("../models/AutomationRule");
const AutomationExecution = require("../models/AutomationExecution");
const { eventBus, EVENTS } = require("./eventBus.service");
const { queueAdapter } = require("./queue.service");
const workflowService = require("./workflow.service");
const settingsService = require("./settings.service");
const auditLogService = require("./auditLog.service");
const { generateCounter } = require("./counter.service");

class AutomationService {
  constructor() {
    this.initEventListeners();
  }

  /**
   * Initializes subscriptions to Event Bus triggers.
   */
  initEventListeners() {
    Object.values(EVENTS).forEach((eventName) => {
      eventBus.on(eventName, (eventObj) => {
        this.handleEvent(eventObj);
      });
    });
  }

  /**
   * Evaluates if condition rules match event payload.
   * @param {Object} rule AutomationRule
   * @param {Object} payload Event data
   * @returns {boolean} True if all conditions pass
   */
  evaluateConditions(rule, payload = {}) {
    if (!rule.conditions || rule.conditions.length === 0) return true;

    return rule.conditions.every((cond) => {
      const val = cond.field.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), payload);
      const target = cond.value;

      switch (cond.operator) {
        case "EQUALS":
          return String(val) === String(target);
        case "NOT_EQUALS":
          return String(val) !== String(target);
        case "GREATER_THAN":
          return Number(val) > Number(target);
        case "LESS_THAN":
          return Number(val) < Number(target);
        case "CONTAINS":
          return String(val || "").toLowerCase().includes(String(target || "").toLowerCase());
        case "IN":
          return Array.isArray(target) && target.includes(val);
        case "NOT_IN":
          return Array.isArray(target) && !target.includes(val);
        default:
          return true;
      }
    });
  }

  /**
   * Computes idempotency hash to prevent duplicate executions within a 5-minute window.
   */
  generateExecutionHash(ruleId, trigger, entityId) {
    const timeBucket = Math.floor(Date.now() / (5 * 60 * 1000)); // 5 min window
    return crypto
      .createHash("md5")
      .update(`${ruleId}_${trigger}_${entityId || "none"}_${timeBucket}`)
      .digest("hex");
  }

  /**
   * Handles incoming published Event Bus event.
   */
  async handleEvent(eventObj) {
    try {
      const settings = await settingsService.getSettings();
      // Respect global Settings feature toggle
      if (settings.features?.automation === false) {
        return;
      }

      const { eventId, eventName, payload } = eventObj;
      const matchingRules = await AutomationRule.find({
        isEnabled: true,
        trigger: eventName,
      }).lean();

      for (const rule of matchingRules) {
        if (this.evaluateConditions(rule, payload)) {
          await this.enqueueExecution(rule, payload, eventId, "EVENT");
        }
      }
    } catch (error) {
      console.error("[AutomationService] Error handling event:", error.message);
    }
  }

  /**
   * Enqueues scheduled automation rule execution.
   */
  async enqueueScheduledRule(rule) {
    await this.enqueueExecution(rule, { scheduledAt: new Date() }, `SCHED-${Date.now()}`, "SCHEDULER");
  }

  /**
   * Enqueues job execution through Queue Adapter with Idempotency Guard.
   */
  async enqueueExecution(rule, payload = {}, eventId = "", triggeredBy = "EVENT") {
    const entityId = payload._id || payload.id || payload.entityId || "";
    const executionHash = this.generateExecutionHash(rule._id, rule.trigger, entityId);

    // Idempotency Deduplication Check
    const existing = await AutomationExecution.findOne({
      executionHash,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    }).lean();

    if (existing) {
      return; // Skip duplicate execution within window
    }

    const executionNumber = await generateCounter("executionNumber", "EXEC", 6);
    const executionDoc = await AutomationExecution.create({
      executionNumber,
      ruleId: rule._id,
      ruleName: rule.name,
      ruleVersion: rule.version || 1,
      trigger: rule.trigger,
      eventId,
      executionHash,
      status: "PENDING",
      triggeredBy,
    });

    // Push to Queue Adapter
    await queueAdapter.enqueue({
      id: executionDoc._id.toString(),
      handler: async () => {
        await this.executeJob(executionDoc._id, rule, payload);
      },
    });
  }

  /**
   * Executes Job Workflows with retry policy and Dead Letter Queue.
   */
  async executeJob(executionId, rule, payload) {
    const startTime = Date.now();
    await AutomationExecution.updateOne({ _id: executionId }, { $set: { status: "RUNNING" } });

    try {
      // Orchestrate workflow plugin actions
      const results = await workflowService.executeWorkflow(rule.actions || [], payload);

      const duration = Date.now() - startTime;
      const hasFailedAction = results.some((r) => r.status === "FAILED");
      const status = hasFailedAction ? "FAILED" : "SUCCESS";

      await AutomationExecution.updateOne(
        { _id: executionId },
        {
          $set: {
            status,
            duration,
            output: results,
            executionTime: new Date(),
          },
        }
      );

      // Audit Log for automation execution
      auditLogService.logEvent({
        module: "Automation",
        action: `Automation Execution ${status}`,
        actionType: "CREATE",
        description: `Executed Automation Rule ${rule.name} (${rule.ruleNumber})`,
        afterData: { ruleId: rule._id, status, duration },
      });

      // Update Rule statistics
      await AutomationRule.updateOne(
        { _id: rule._id },
        {
          $inc: { executionCount: 1, ...(hasFailedAction ? { failureCount: 1 } : {}) },
          $set: { lastRun: new Date() },
        }
      );
    } catch (err) {
      const duration = Date.now() - startTime;
      const execDoc = await AutomationExecution.findById(executionId);
      const newRetryCount = (execDoc?.retryCount || 0) + 1;
      const maxRetries = 3;

      // Move to Dead Letter Queue (FAILED_PERMANENT) if retries exceeded
      const finalStatus = newRetryCount >= maxRetries ? "FAILED_PERMANENT" : "FAILED";

      await AutomationExecution.updateOne(
        { _id: executionId },
        {
          $set: {
            status: finalStatus,
            error: err.message || "Execution exception",
            duration,
            retryCount: newRetryCount,
          },
        }
      );
    }
  }

  /**
   * Retries a failed execution job manually.
   */
  async retryExecution(executionId) {
    const execDoc = await AutomationExecution.findById(executionId);
    if (!execDoc) {
      throw new Error("Execution log record not found.");
    }

    const rule = await AutomationRule.findById(execDoc.ruleId).lean();
    if (!rule) {
      throw new Error("Associated Automation Rule no longer exists.");
    }

    await AutomationExecution.updateOne(
      { _id: executionId },
      { $set: { status: "PENDING", error: null }, $inc: { retryCount: 1 } }
    );

    await queueAdapter.enqueue({
      id: executionId.toString(),
      handler: async () => {
        await this.executeJob(executionId, rule, {});
      },
    });

    return { message: "Execution queued for retry." };
  }
}

const automationService = new AutomationService();

module.exports = automationService;
