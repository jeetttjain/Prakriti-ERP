const mongoose = require("mongoose");

const inventoryAuditSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true },
    warehouseCode: { type: String, required: true },
    productCode: { type: String, required: true },
    expectedQty: { type: Number, required: true },
    countedQty: { type: Number, required: true },
    varianceQty: { type: Number, required: true },
    conductedBy: { type: String, default: "SYSTEM" },
    status: { type: String, enum: ["Pending", "Approved", "Adjusted"], default: "Approved" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryAudit", inventoryAuditSchema);
