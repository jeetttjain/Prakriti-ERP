const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
  {
    configKey: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, default: "Global" },
    version: { type: Number, default: 1 },
    updatedBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemConfig", systemConfigSchema);
