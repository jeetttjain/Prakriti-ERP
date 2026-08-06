const mongoose = require("mongoose");

const inventoryStockSchema = new mongoose.Schema(
  {
    stockId: { type: String, required: true, unique: true },
    productCode: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    warehouseCode: { type: String, required: true, index: true },
    availableQty: { type: Number, default: 0 },
    reservedQty: { type: Number, default: 0 },
    transitQty: { type: Number, default: 0 },
    uom: { type: String, default: "Kg" },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    unitCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryStock", inventoryStockSchema);
