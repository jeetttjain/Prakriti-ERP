const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    followUpId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    type: { type: String, enum: ["Call", "Meeting", "WhatsApp", "Email"], default: "Call" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["Scheduled", "Completed", "Overdue"], default: "Scheduled" },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
