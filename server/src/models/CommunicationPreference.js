const mongoose = require("mongoose");

const communicationPreferenceSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: ["Global", "Branch", "Customer", "Employee", "Supplier"], required: true },
    targetId: { type: String, required: true },
    preferredChannel: { type: String, enum: ["WhatsApp", "Email", "SMS", "Push", "In-App"], default: "WhatsApp" },
    isMuted: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: true },
    workingHoursStart: { type: String, default: "08:00" },
    workingHoursEnd: { type: String, default: "20:00" },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationPreference", communicationPreferenceSchema);
