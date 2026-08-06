const mongoose = require("mongoose");

const dispatchNoteSchema = new mongoose.Schema(
  {
    dispatchId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    customerName: { type: String, required: true },
    warehouseCode: { type: String, required: true },
    vehicleId: { type: String },
    driverName: { type: String },
    items: [
      {
        productCode: { type: String, required: true },
        quantity: { type: Number, required: true },
        uom: { type: String, default: "Kg" },
      },
    ],
    status: { type: String, enum: ["Packed", "Dispatched", "Delivered"], default: "Dispatched" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DispatchNote", dispatchNoteSchema);
