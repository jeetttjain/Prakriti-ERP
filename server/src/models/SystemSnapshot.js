const mongoose = require("mongoose");

const systemSnapshotSchema = new mongoose.Schema(
  {
    snapshotId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    modules: [{ type: mongoose.Schema.Types.Mixed }],
    flags: [{ type: mongoose.Schema.Types.Mixed }],
    configs: [{ type: mongoose.Schema.Types.Mixed }],
    createdBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSnapshot", systemSnapshotSchema);
