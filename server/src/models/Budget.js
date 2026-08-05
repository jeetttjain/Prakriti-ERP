const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    budgetId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    fiscalYear: { type: String, required: true },
    allocatedAmount: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Exceeded", "Closed"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
