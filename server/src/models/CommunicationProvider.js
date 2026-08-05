const mongoose = require("mongoose");

const communicationProviderSchema = new mongoose.Schema(
  {
    providerId: { type: String, required: true, unique: true },
    providerName: { type: String, required: true },
    channel: { type: String, enum: ["WhatsApp", "Email", "SMS", "Push", "In-App"], required: true },
    isDefault: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
    priorityRank: { type: Number, default: 1 },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationProvider", communicationProviderSchema);
