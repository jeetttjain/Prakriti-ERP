const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    notificationId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    module: { type: String, required: true },
    referenceId: { type: String },
    referenceNumber: { type: String },
    recipient: { type: String, required: true },
    channel: { type: String, enum: ["WhatsApp", "SMS", "Email", "Push", "In App"], required: true },
    status: { type: String, enum: ["Queued", "Processing", "Sent", "Delivered", "Read", "Failed", "Cancelled"], default: "Queued" },
    priority: { type: String, enum: ["Low", "Normal", "High"], default: "Normal" },
    message: { type: String, required: true },
    template: { type: String },
    retryCount: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    errorMessage: { type: String },
    isScheduled: { type: Boolean, default: false },
    scheduledFor: { type: Date },
    scheduleStatus: { type: String, enum: ["Pending", "Executed", "Cancelled"], default: "Pending" },
    notificationTimeline: [
      new mongoose.Schema(
        {
          status: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          provider: { type: String },
          remarks: { type: String },
        },
        { _id: false }
      ),
    ],
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
