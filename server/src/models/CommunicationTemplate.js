const mongoose = require("mongoose");

const communicationTemplateSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ["Invoice", "Payment", "Order", "OTP", "Delivery", "Purchase", "Marketing", "Alerts"], required: true },
    channel: { type: String, enum: ["WhatsApp", "Email", "SMS", "Push", "In-App"], required: true },
    language: { type: String, default: "en" },
    subjectTemplate: { type: String },
    bodyTemplate: { type: String, required: true },
    variables: [{ type: String }],
    status: { type: String, enum: ["Draft", "Pending Approval", "Approved", "Rejected", "Published"], default: "Approved" },
    version: { type: Number, default: 1 },
    fallbackChannel: { type: String },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationTemplate", communicationTemplateSchema);
