const mongoose = require("mongoose");

const identitySessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userCode: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    deviceFingerprint: { type: String, required: true },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "Standard Browser" },
    status: { type: String, enum: ["Active", "Expired", "Revoked"], default: "Active" },
    lastActivityAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    tenantId: { type: String, default: "DEFAULT_TENANT" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdentitySession", identitySessionSchema);
