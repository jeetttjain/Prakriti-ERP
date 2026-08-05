const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    bankId: { type: String, required: true, unique: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String },
    branchName: { type: String },
    accountType: { type: String, enum: ["Savings", "Current", "Cash"], default: "Current" },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankAccount", bankAccountSchema);
