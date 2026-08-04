const AutomationRule = require("../models/AutomationRule");

/**
 * Centralized Background Timer Scheduler.
 * Manages periodic job evaluations, boot recovery, and pause/resume states.
 * @module services/scheduler.service
 */
class SchedulerService {
  constructor() {
    this.timer = null;
    this.isPaused = false;
    this.intervalMs = 60000; // 1 minute ticker interval
    this.lastCheckTime = null;
    this.runningCount = 0;
  }

  /**
   * Initializes background scheduler ticker loop on server startup.
   * Restores enabled rules and recovers interrupted execution states safely.
   */
  async startScheduler() {
    if (this.timer) return;

    this.isPaused = false;
    console.log("⚡ [SchedulerService] Automation Scheduler Started.");

    this.timer = setInterval(() => {
      if (!this.isPaused) {
        this.evaluateScheduledRules();
      }
    }, this.intervalMs);

    // Immediate initial check on boot
    this.evaluateScheduledRules();
  }

  /**
   * Evaluates scheduled automation rules needing execution.
   */
  async evaluateScheduledRules() {
    this.lastCheckTime = new Date();
    try {
      const now = new Date();
      const rules = await AutomationRule.find({
        isEnabled: true,
        scheduleInterval: { $ne: "EVENT_DRIVEN" },
        $or: [{ nextRun: { $lte: now } }, { nextRun: null }],
      }).lean();

      if (rules.length === 0) return;

      const automationService = require("./automation.service");

      for (const rule of rules) {
        // Enqueue scheduled execution
        await automationService.enqueueScheduledRule(rule);

        // Calculate next run date based on schedule interval
        const nextRunDate = new Date();
        if (rule.scheduleInterval === "DAILY") nextRunDate.setDate(nextRunDate.getDate() + 1);
        else if (rule.scheduleInterval === "WEEKLY") nextRunDate.setDate(nextRunDate.getDate() + 7);
        else if (rule.scheduleInterval === "MONTHLY") nextRunDate.setMonth(nextRunDate.getMonth() + 1);
        else nextRunDate.setHours(nextRunDate.getHours() + 1);

        await AutomationRule.updateOne(
          { _id: rule._id },
          { $set: { lastRun: now, nextRun: nextRunDate } }
        );
      }
    } catch (error) {
      console.error("[SchedulerService] Error evaluating scheduled rules:", error.message);
    }
  }

  /**
   * Pauses background scheduler ticker.
   */
  pause() {
    this.isPaused = true;
    console.log("⏸️ [SchedulerService] Scheduler Paused.");
    return { isPaused: true };
  }

  /**
   * Resumes background scheduler ticker.
   */
  resume() {
    this.isPaused = false;
    console.log("▶️ [SchedulerService] Scheduler Resumed.");
    this.evaluateScheduledRules();
    return { isPaused: false };
  }

  /**
   * Returns current Scheduler Status & Health stats.
   */
  getStatus() {
    return {
      status: this.isPaused ? "PAUSED" : "ACTIVE",
      isPaused: this.isPaused,
      intervalMs: this.intervalMs,
      lastCheckTime: this.lastCheckTime,
    };
  }
}

const schedulerService = new SchedulerService();

module.exports = schedulerService;
