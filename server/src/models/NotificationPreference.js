const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    enabledChannels: {
      WhatsApp: { type: Boolean, default: true },
      SMS: { type: Boolean, default: true },
      Email: { type: Boolean, default: true },
      Push: { type: Boolean, default: true },
      InApp: { type: Boolean, default: true },
    },
    quietHours: {
      startTime: { type: String },
      endTime: { type: String },
    },
    language: { type: String, default: "English" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationPreference", notificationPreferenceSchema);
