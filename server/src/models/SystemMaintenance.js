const mongoose = require("mongoose");

const systemMaintenanceSchema = new mongoose.Schema(
  {
    maintenanceId: { type: String, required: true, unique: true },
    mode: { type: String, enum: ["Global", "Module", "Branch"], default: "Global" },
    target: { type: String, default: "ALL" },
    isReadonly: { type: Boolean, default: true },
    bannerMessage: { type: String, required: true },
    status: { type: String, enum: ["Active", "Completed"], default: "Active" },
    initiatedBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemMaintenance", systemMaintenanceSchema);
