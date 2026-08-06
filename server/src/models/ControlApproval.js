const mongoose = require("mongoose");

const controlApprovalSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    requestedBy: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Executed"], default: "Approved" },
    approvedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ControlApproval", controlApprovalSchema);
