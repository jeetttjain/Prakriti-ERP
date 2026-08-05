const mongoose = require("mongoose");

const alertRuleSchema = new mongoose.Schema(
  {
    ruleId: { type: String, required: true, unique: true },
    metricCategory: { type: String, required: true },
    threshold: { type: Number, required: true },
    comparison: { type: String, enum: [">", "<", ">=", "<=", "=="], default: ">" },
    severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL"], default: "WARNING" },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlertRule", alertRuleSchema);
