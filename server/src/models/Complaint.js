const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    category: { type: String, enum: ["Quality", "DeliveryDelay", "Billing", "Packaging"], default: "Quality" },
    subject: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "High" },
    assignedTo: { type: String, default: "SUPPORT-EXEC-01" },
    status: { type: String, enum: ["Open", "Investigating", "Resolved"], default: "Open" },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
