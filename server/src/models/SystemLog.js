const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema(
  {
    logId: { type: String, required: true, unique: true },
    level: { type: String, enum: ["INFO", "WARN", "ERROR", "DEBUG", "FATAL"], default: "INFO" },
    module: { type: String, required: true },
    message: { type: String, required: true },
    correlationId: { type: String, index: true },
    traceId: { type: String, index: true },
    spanId: { type: String },
    userCode: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemLog", systemLogSchema);
