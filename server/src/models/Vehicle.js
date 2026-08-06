const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true },
    type: { type: String, enum: ["RefrigeratedVan", "MiniTruck", "HeavyTruck"], default: "RefrigeratedVan" },
    driverName: { type: String },
    driverPhone: { type: String },
    capacityKg: { type: Number, default: 2000 },
    status: { type: String, enum: ["Available", "InTransit", "Maintenance"], default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
