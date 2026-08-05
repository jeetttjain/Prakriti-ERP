const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    assetName: { type: String, required: true },
    category: { type: String, required: true },
    purchaseDate: { type: Date, default: Date.now },
    purchaseValue: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    depreciationRatePct: { type: Number, default: 10 },
    accumulatedDepreciation: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Disposed", "WrittenOff"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", assetSchema);
