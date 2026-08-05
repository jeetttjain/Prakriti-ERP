const mongoose = require("mongoose");

const costCenterSchema = new mongoose.Schema(
  {
    centerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["CostCenter", "ProfitCenter"], default: "CostCenter" },
    department: { type: String },
    allocatedBudget: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CostCenter", costCenterSchema);
