const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userCode: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { type: String, required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    lastLogin: { type: Date },
    profilePhoto: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date },
    passwordChangedAt: { type: Date, default: Date.now },
    mustChangePassword: { type: Boolean, default: false },
    dashboardPreferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
