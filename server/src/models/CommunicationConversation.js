const mongoose = require("mongoose");

const communicationConversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true },
    entityType: { type: String, enum: ["Order", "Invoice", "Payment", "Customer", "Supplier", "System"], default: "Customer" },
    entityId: { type: String, required: true },
    customerName: { type: String },
    customerContact: { type: String },
    status: { type: String, enum: ["Active", "Closed", "Archived"], default: "Active" },
    assignedTo: { type: String, default: "Support Team" },
    channelHistory: [{ type: String }],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunicationConversation", communicationConversationSchema);
