const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventName: { type: String, required: true },
    eventVersion: { type: String, default: "1.0" },
    schemaVersion: { type: String, default: "1.0" },
    producerModule: { type: String, required: true },
    consumerModules: [{ type: String }],
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
    createdBy: { type: String, default: "SYSTEM" },
    priority: { type: String, enum: ["HIGH", "NORMAL", "LOW"], default: "NORMAL" },
    retryCount: { type: Number, default: 0 },
    executionStatus: { type: String, enum: ["PUBLISHED", "PROCESSING", "COMPLETED", "FAILED", "DEAD"], default: "PUBLISHED" },
    correlationId: { type: String, required: true },
    idempotencyKey: { type: String, required: true, index: true },
    executionTime: { type: Number },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventLog", eventLogSchema);
