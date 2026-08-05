const mongoose = require("mongoose");

const observabilityPolicySchema = new mongoose.Schema(
  {
    policyId: { type: String, required: true, unique: true },
    logRetentionDays: { type: Number, default: 30 },
    metricsRetentionDays: { type: Number, default: 180 },
    tracesRetentionDays: { type: Number, default: 14 },
    alertsRetentionDays: { type: Number, default: 365 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ObservabilityPolicy", observabilityPolicySchema);
