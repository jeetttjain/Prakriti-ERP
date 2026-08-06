const mongoose = require("mongoose");

const systemModuleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    version: { type: String, default: "1.0.0" },
    status: { type: String, enum: ["Running", "Stopped", "Maintenance", "Paused", "Drain"], default: "Running" },
    group: { type: String, enum: ["Security", "Communication", "Data", "Finance", "SupplyChain", "Analytics", "Core"], default: "Core" },
    dependencies: [{ type: String }],
    owner: { type: String, default: "SYSTEM" },
    healthStatus: { type: String, enum: ["Healthy", "Degraded", "Critical"], default: "Healthy" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemModule", systemModuleSchema);
