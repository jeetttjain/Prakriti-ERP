const mongoose = require("mongoose");

const employeeAssetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    employeeCode: { type: String, required: true, index: true },
    assetType: { type: String, enum: ["Laptop", "Mobile", "SIM", "IDCard", "Vehicle"], default: "Laptop" },
    serialNumber: { type: String, required: true },
    assignedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Assigned", "Returned", "Lost"], default: "Assigned" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeAsset", employeeAssetSchema);
