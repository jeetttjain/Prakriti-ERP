const SchedulerHistory = require("../../models/SchedulerHistory");
const { systemControlFlags } = require("../automation/systemControlFlags");

class SchedulerEngine {
  constructor() {
    this.schedules = new Map();
  }

  registerSchedule(scheduleId, jobName, cronExpression, handler) {
    this.schedules.set(scheduleId, {
      scheduleId,
      jobName,
      cronExpression,
      handler,
      status: "ACTIVE",
    });
  }

  async runSchedule(scheduleId) {
    if (!systemControlFlags.isSchedulerEnabled) return;

    const sched = this.schedules.get(scheduleId);
    if (!sched || sched.status === "PAUSED") return;

    const startTime = Date.now();
    try {
      if (typeof sched.handler === "function") {
        await sched.handler();
      }

      await SchedulerHistory.create({
        scheduleId: sched.scheduleId,
        jobName: sched.jobName,
        cronExpression: sched.cronExpression,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        result: "SUCCESS",
      });
    } catch (err) {
      await SchedulerHistory.create({
        scheduleId: sched.scheduleId,
        jobName: sched.jobName,
        cronExpression: sched.cronExpression,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        result: "FAILED",
        error: err.message,
      });
    }
  }

  pauseSchedule(scheduleId) {
    const sched = this.schedules.get(scheduleId);
    if (sched) sched.status = "PAUSED";
  }

  resumeSchedule(scheduleId) {
    const sched = this.schedules.get(scheduleId);
    if (sched) sched.status = "ACTIVE";
  }
}

module.exports = new SchedulerEngine();
