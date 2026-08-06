const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true },
    basicSalary: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    pfDeduction: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    tdsDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);
