const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    leaveId: { type: String, required: true, unique: true },
    companyCode: { type: String, default: "CMP-PRAKRITI-01" },
    employeeCode: { type: String, required: true, index: true },
    type: { type: String, enum: ["Casual", "Sick", "Earned", "Maternity", "Paternity"], default: "Casual" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    approvalLevel: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
