const mongoose = require("mongoose");

const procurementOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplierCode: { type: String, required: true },
    supplierName: { type: String, required: true },
    warehouseCode: { type: String, required: true },
    items: [
      {
        productCode: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    receivingStatus: { type: String, enum: ["Ordered", "Received", "QualityHold"], default: "Received" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProcurementOrder", procurementOrderSchema);
