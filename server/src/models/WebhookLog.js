const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema(
  {
    webhookId: { type: String, required: true, unique: true },
    direction: { type: String, enum: ["INCOMING", "OUTGOING"], required: true },
    endpoint: { type: String, required: true },
    provider: { type: String, default: "Generic" },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    signature: { type: String },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["DELIVERED", "FAILED", "PENDING"], default: "PENDING" },
    statusCode: { type: Number },
    responseBody: { type: String },
    attemptCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
