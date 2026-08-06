const mongoose = require("mongoose");

const discountApprovalSchema = new mongoose.Schema(
  {
    approvalId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    requestedDiscountPct: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
    approverCode: { type: String, default: "SALES-MGR-01" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountApproval", discountApprovalSchema);
