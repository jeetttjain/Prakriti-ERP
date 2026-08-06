const mongoose = require("mongoose");

const expenseClaimSchema = new mongoose.Schema(
  {
    claimId: { type: String, required: true, unique: true },
    employeeCode: { type: String, required: true, index: true },
    category: { type: String, enum: ["Travel", "Fuel", "Food", "Hotel", "Medical"], default: "Travel" },
    amount: { type: Number, required: true },
    receiptUrl: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpenseClaim", expenseClaimSchema);
