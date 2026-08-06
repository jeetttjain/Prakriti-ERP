const mongoose = require("mongoose");

const stockTransferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true },
    sourceWarehouse: { type: String, required: true },
    destinationWarehouse: { type: String, required: true },
    items: [
      {
        productCode: { type: String, required: true },
        quantity: { type: Number, required: true },
        uom: { type: String, default: "Kg" },
      },
    ],
    status: { type: String, enum: ["Requested", "InTransit", "Completed", "Cancelled"], default: "InTransit" },
    dispatchedAt: { type: Date, default: Date.now },
    receivedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockTransfer", stockTransferSchema);
