const mongoose = require("mongoose");

const identityDeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    userCode: { type: String, required: true, index: true },
    deviceName: { type: String, default: "Chrome / Windows" },
    browser: { type: String, default: "Chrome" },
    os: { type: String, default: "Windows" },
    ipAddress: { type: String, default: "127.0.0.1" },
    isTrusted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    riskScore: { type: Number, default: 10 }, // 0 to 100
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IdentityDevice", identityDeviceSchema);
