const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountCode: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },
    type: { type: String, enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"], required: true },
    category: { type: String, default: "General" },
    parentAccountCode: { type: String },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
