const mongoose = require("mongoose");

const automationJobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    jobName: { type: String, required: true },
    type: { type: String, enum: ["IMMEDIATE", "DELAYED", "SCHEDULED", "RECURRING", "BACKGROUND"], default: "IMMEDIATE" },
    priority: { type: String, enum: ["HIGH", "NORMAL", "LOW"], default: "NORMAL" },
    status: { type: String, enum: ["QUEUED", "RUNNING", "COMPLETED", "FAILED", "PAUSED", "CANCELLED", "DEAD"], default: "QUEUED" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    correlationId: { type: String, required: true },
    idempotencyKey: { type: String, required: true, index: true },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    error: { type: String },
    workerId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AutomationJob", automationJobSchema);
