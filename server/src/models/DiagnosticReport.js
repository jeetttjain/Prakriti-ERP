const mongoose = require("mongoose");

const diagnosticReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    overallStatus: { type: String, enum: ["HEALTHY", "WARNING", "CRITICAL"], default: "HEALTHY" },
    checks: [
      {
        subsystem: { type: String, required: true },
        status: { type: String, enum: ["PASS", "FAIL", "WARN"], default: "PASS" },
        latencyMs: { type: Number },
        message: { type: String },
      },
    ],
    executedBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiagnosticReport", diagnosticReportSchema);
