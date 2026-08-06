const mongoose = require("mongoose");

const customerContractSchema = new mongoose.Schema(
  {
    contractId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    title: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    contractValue: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Renewed", "Expired", "Terminated"], default: "Active" },
    edpResourceId: { type: String, default: "EDP-DOC-001" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerContract", customerContractSchema);
