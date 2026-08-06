const mongoose = require("mongoose");

const configVersionSchema = new mongoose.Schema(
  {
    versionId: { type: String, required: true, unique: true },
    configKey: { type: String, required: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    version: { type: Number, required: true },
    changedBy: { type: String, required: true },
    reason: { type: String, default: "Configuration update" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConfigVersion", configVersionSchema);
