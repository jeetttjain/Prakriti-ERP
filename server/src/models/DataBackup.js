const mongoose = require("mongoose");

const dataBackupSchema = new mongoose.Schema(
  {
    backupId: { type: String, required: true, unique: true },
    backupName: { type: String, required: true },
    type: { type: String, enum: ["FULL", "INCREMENTAL", "MODULE"], default: "FULL" },
    scope: { type: String, default: "ENTIRE_ERP" },
    size: { type: Number, default: 0 },
    checksum: { type: String },
    storagePath: { type: String, required: true },
    isEncrypted: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    status: { type: String, enum: ["COMPLETED", "FAILED", "RUNNING"], default: "COMPLETED" },
    createdBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DataBackup", dataBackupSchema);
