const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    keyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true },
    userCode: { type: String, required: true },
    scopes: [{ type: String }],
    rateLimit: { type: Number, default: 1000 }, // requests per hour
    expiresAt: { type: Date },
    status: { type: String, enum: ["Active", "Revoked"], default: "Active" },
    lastUsedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiKey", apiKeySchema);
