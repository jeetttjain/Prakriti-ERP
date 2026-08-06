const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true },
    companyCode: { type: String, default: "CMP-PRAKRITI-01" },
    legalEntityId: { type: String, default: "LEGAL-INDIA-01" },
    branchCode: { type: String, default: "BR-HQ-01" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    departmentCode: { type: String, required: true },
    designationCode: { type: String, required: true },
    managerUserCode: { type: String },
    status: { type: String, enum: ["Probation", "Active", "Resigned", "Exited"], default: "Active" },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
