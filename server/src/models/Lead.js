const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    leadSource: { type: String, enum: ["Website", "Referral", "Phone", "WhatsApp", "Campaign"], default: "Website" },
    leadScore: { type: Number, default: 50 },
    confidenceScore: { type: Number, default: 85 },
    scoringFactors: [{ type: String }],
    status: { type: String, enum: ["New", "Contacted", "Qualified", "Converted", "Lost"], default: "New" },
    assignedExecutiveCode: { type: String, default: "SALES-EXEC-01" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
