const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    lastActivity: { type: Date, default: Date.now },
    refreshToken: { type: String },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    browser: { type: String },
    operatingSystem: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSession", userSessionSchema);
