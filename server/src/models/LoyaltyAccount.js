const mongoose = require("mongoose");

const loyaltyAccountSchema = new mongoose.Schema(
  {
    customerCode: { type: String, required: true, unique: true },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Gold" },
    pointsBalance: { type: Number, default: 1250 },
    totalRedeemed: { type: Number, default: 300 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
