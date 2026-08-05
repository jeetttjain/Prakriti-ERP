const mongoose = require("mongoose");

const dataPolicySchema = new mongoose.Schema(
  {
    policyId: { type: String, required: true, unique: true },
    policyName: { type: String, required: true },
    targetModule: { type: String, default: "ALL" },
    hotRetentionDays: { type: Number, default: 90 },
    warmRetentionDays: { type: Number, default: 365 },
    coldRetentionDays: { type: Number, default: 1095 },
    autoPurge: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DataPolicy", dataPolicySchema);
