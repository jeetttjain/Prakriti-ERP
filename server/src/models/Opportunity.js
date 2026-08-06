const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    opportunityId: { type: String, required: true, unique: true },
    leadId: { type: String },
    customerCode: { type: String, required: true, index: true },
    title: { type: String, required: true },
    stage: { type: String, enum: ["Prospecting", "Proposal", "Negotiation", "ClosedWon", "ClosedLost"], default: "Proposal" },
    probabilityPct: { type: Number, default: 75 },
    expectedRevenue: { type: Number, required: true },
    expectedCloseDate: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
