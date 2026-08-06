const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
  {
    payrollRunId: { type: String, required: true, unique: true },
    companyCode: { type: String, default: "CMP-PRAKRITI-01" },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    employeeCount: { type: Number, default: 0 },
    totalGross: { type: Number, required: true },
    totalNet: { type: Number, required: true },
    status: { type: String, enum: ["Draft", "Completed", "Locked"], default: "Completed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayrollRun", payrollRunSchema);
