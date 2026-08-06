const mongoose = require("mongoose");

const campaignMemberSchema = new mongoose.Schema(
  {
    memberId: { type: String, required: true, unique: true },
    campaignId: { type: String, required: true, index: true },
    customerCode: { type: String, required: true, index: true },
    engagementStatus: { type: String, enum: ["Sent", "Delivered", "Opened", "Clicked", "Converted"], default: "Delivered" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampaignMember", campaignMemberSchema);
