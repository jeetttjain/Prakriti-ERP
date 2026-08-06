const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentCode: { type: String, required: true, unique: true },
    companyCode: { type: String, default: "CMP-PRAKRITI-01" },
    name: { type: String, required: true },
    headUserCode: { type: String },
    budgetAnnual: { type: Number, default: 5000000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
