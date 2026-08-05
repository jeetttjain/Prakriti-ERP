const mongoose = require("mongoose");

const communicationCampaignSchema = new mongoose.Schema(
  {
    campaignId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, default: "Marketing" },
    templateId: { type: String, required: true },
    targetAudienceFilter: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["Draft", "Pending Approval", "Approved", "Running", "Completed"], default: "Draft" },
    scheduledAt: { type: Date },
    totalRecipients: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationCampaign", communicationCampaignSchema);
