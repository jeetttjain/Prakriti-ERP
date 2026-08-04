const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const stockMovementSchema = new mongoose.Schema(
  {
    movementNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    movementType: {
      type: String,
      enum: [
        "Opening Stock",
        "Purchase",
        "Reservation",
        "Reservation Release",
        "Delivery",
        "Return",
        "Damage",
        "Manual Adjustment",
        "Stock Correction",
        "Inventory Audit",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceModule: {
      type: String,
      enum: [
        "Product",
        "Order",
        "Invoice",
        "Payment",
        "Inventory",
        "Manual",
        "Purchase",
      ],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceNumber: {
      type: String,
      default: "",
      trim: true,
    },
    movementReason: {
      type: String,
      default: "",
      trim: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.pre("validate", async function () {
  if (this.isNew && !this.movementNumber) {
    this.movementNumber = await generateCounter("movementNumber", "STM", 6);
  }
});

stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ productId: 1 });
stockMovementSchema.index({ movementType: 1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);
