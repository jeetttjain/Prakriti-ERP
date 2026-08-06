const mongoose = require("mongoose");

const customerActivitySchema = new mongoose.Schema(
  {
    activityId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    type: { type: String, enum: ["Call", "Email", "WhatsApp", "Visit", "Meeting", "Quotation", "Order", "Invoice", "Payment", "Complaint", "Note"], required: true },
    title: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    userCode: { type: String, default: "SALES-EXEC-01" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerActivity", customerActivitySchema);
