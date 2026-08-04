const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const inventorySchema = new mongoose.Schema(
  {
    inventoryCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      default: 0,
    },
    openingStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockUnit: {
      type: String,
      required: true,
      trim: true,
    },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out Of Stock"],
      default: "In Stock",
    },
    location: {
      type: String,
      default: "Main Warehouse",
      trim: true,
    },
    batchNumber: {
      type: String,
      default: "",
      trim: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    lastMovementDate: {
      type: Date,
      default: null,
    },
    lastStockAuditDate: {
      type: Date,
      default: null,
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
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.pre("validate", async function () {
  if (this.isNew && !this.inventoryCode) {
    this.inventoryCode = await generateCounter("inventoryCode", "INVSTK", 6);
  }
});

module.exports = mongoose.model("Inventory", inventorySchema);
