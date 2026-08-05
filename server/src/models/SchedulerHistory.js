const mongoose = require("mongoose");

const schedulerHistorySchema = new mongoose.Schema(
  {
    scheduleId: { type: String, required: true },
    jobName: { type: String, required: true },
    cronExpression: { type: String },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number },
    result: { type: String, enum: ["SUCCESS", "FAILED", "SKIPPED"], default: "SUCCESS" },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    triggerSource: { type: String, default: "CRON" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchedulerHistory", schedulerHistorySchema);
