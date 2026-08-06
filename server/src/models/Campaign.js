const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    campaignId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    channel: { type: String, enum: ["WhatsApp", "Email", "SMS"], default: "WhatsApp" },
    targetSegment: { type: String, default: "VIP" },
    budget: { type: Number, default: 50000 },
    revenueGenerated: { type: Number, default: 350000 },
    status: { type: String, enum: ["Planning", "Active", "Completed"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
