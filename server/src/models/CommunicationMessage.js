const mongoose = require("mongoose");

const communicationMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true, unique: true },
    conversationId: { type: String, required: true },
    channel: { type: String, enum: ["WhatsApp", "Email", "SMS", "Push", "In-App"], required: true },
    provider: { type: String, required: true },
    recipient: {
      type: { type: String, enum: ["Customer", "User", "Supplier", "Employee"], default: "Customer" },
      id: { type: String },
      address: { type: String, required: true }, // Phone number, email address, or FCM token
    },
    subject: { type: String },
    content: { type: String, required: true },
    templateId: { type: String },
    templateCategory: { type: String, default: "Transactional" },
    attachments: [
      {
        name: { type: String },
        type: { type: String },
        url: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Queued", "Sending", "Sent", "Delivered", "Read", "Failed", "Cancelled", "Expired", "Archived"],
      default: "Queued",
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    error: { type: String },
    correlationId: { type: String, required: true },
    createdBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationMessage", communicationMessageSchema);
