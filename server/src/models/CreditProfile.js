const mongoose = require("mongoose");

const creditProfileSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    creditLimit: { type: Number, default: 200000 },
    currentOutstanding: { type: Number, default: 0 },
    riskScore: { type: Number, default: 15 }, // 0 (low risk) to 100 (high risk)
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditProfile", creditProfileSchema);
