const mongoose = require("mongoose");

const featureFlagSchema = new mongoose.Schema(
  {
    flagId: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
    category: { type: String, default: "General" },
    targeting: {
      branches: [{ type: String }],
      roles: [{ type: String }],
      canaryPercentage: { type: Number, default: 100 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeatureFlag", featureFlagSchema);
