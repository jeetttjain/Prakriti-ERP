const mongoose = require("mongoose");

const securityPolicySchema = new mongoose.Schema(
  {
    policyId: { type: String, required: true, unique: true },
    policyName: { type: String, required: true },
    minPasswordLength: { type: Number, default: 8 },
    requireSpecialChar: { type: Boolean, default: true },
    maxLoginAttempts: { type: Number, default: 5 },
    lockoutDurationMinutes: { type: Number, default: 15 },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    ipAllowlist: [{ type: String }],
    ipBlocklist: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecurityPolicy", securityPolicySchema);
