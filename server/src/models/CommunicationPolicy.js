const mongoose = require("mongoose");

const communicationPolicySchema = new mongoose.Schema(
  {
    policyId: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    primaryChannel: { type: String, enum: ["WhatsApp", "Email", "SMS", "Push", "In-App"], default: "WhatsApp" },
    fallbackChannel: { type: String, enum: ["WhatsApp", "Email", "SMS", "Push", "In-App"], default: "Email" },
    requireApproval: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationPolicy", communicationPolicySchema);
