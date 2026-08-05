const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userCode: { type: String, required: true },
    reason: { type: String, default: "Logout or Revocation" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
