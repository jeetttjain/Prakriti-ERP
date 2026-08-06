const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    recId: { type: String },
    ruleId: { type: String },
    status: { type: String, default: "Active" },
    category: { type: String },
    severity: { type: String },
    priority: { type: String },
    title: { type: String },
    description: { type: String },
    reason: { type: String },
    suggestedAction: { type: String },
    estimatedImpact: { type: Object },
    metricsSnapshot: { type: Object },
    aiConfidence: { type: Number },
    customerCode: { type: String },
    recommendedProducts: [
      {
        productCode: { type: String },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
