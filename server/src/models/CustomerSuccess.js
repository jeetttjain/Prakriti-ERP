const mongoose = require("mongoose");

const customerSuccessSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    onboardingProgressPct: { type: Number, default: 100 },
    churnRisk: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    successScore: { type: Number, default: 92 },
    growthOpportunity: { type: String, default: "Upsell Organic Spices Category" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerSuccess", customerSuccessSchema);
