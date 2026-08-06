const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branchCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    region: { type: String, required: true },
    address: { type: String },
    managerName: { type: String },
    contactPhone: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
