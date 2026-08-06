const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    warehouseCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["Main", "Sub", "ColdStorage", "Transit"], default: "Main" },
    branchCode: { type: String, required: true },
    capacityUnits: { type: Number, default: 10000 },
    currentUnits: { type: Number, default: 0 },
    temperatureCelsius: { type: Number },
    status: { type: String, enum: ["Active", "Maintenance", "Full"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
