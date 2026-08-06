const mongoose = require("mongoose");
const { normalizePhone } = require("../utils/phoneUtils");

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, set: normalizePhone, get: normalizePhone },
    leadSource: { type: String, enum: ["Website", "Referral", "Phone", "WhatsApp", "Campaign"], default: "Website" },
    leadScore: { type: Number, default: 50 },
    confidenceScore: { type: Number, default: 85 },
    scoringFactors: [{ type: String }],
    status: { type: String, enum: ["New", "Contacted", "Qualified", "Converted", "Lost"], default: "New" },
    assignedExecutiveCode: { type: String, default: "SALES-EXEC-01" },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

leadSchema.pre("save", function () {
  if (this.phone) this.phone = normalizePhone(this.phone);
});

module.exports = mongoose.model("Lead", leadSchema);
