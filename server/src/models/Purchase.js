const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const purchaseItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productCode: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  pendingQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    supplierSnapshot: {
      businessName: { type: String, required: true },
      personName: { type: String, required: true },
      mobile: { type: String, required: true },
      gst: { type: String, default: "" },
      address: { type: String, default: "" },
      paymentTerms: { type: String, default: "" },
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expectedDelivery: {
      type: Date,
      required: true,
    },
    purchaseStatus: {
      type: String,
      enum: ["Draft", "Ordered", "Received", "Cancelled"],
      default: "Draft",
    },
    purchaseType: {
      type: String,
      enum: ["Regular", "Emergency", "Return", "Direct Farm", "Internal Transfer"],
      default: "Regular",
    },
    purchaseItems: [purchaseItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    transport: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
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

purchaseSchema.pre("validate", async function () {
  if (this.isNew && !this.purchaseNumber) {
    this.purchaseNumber = await generateCounter("purchaseNumber", "PUR", 6);
  }
});

purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ supplierId: 1 });
purchaseSchema.index({ purchaseStatus: 1 });

module.exports = mongoose.model("Purchase", purchaseSchema);
