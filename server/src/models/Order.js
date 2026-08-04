const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const customerSnapshotSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const branchSnapshotSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productCode: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    displayNameSnapshot: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    purchasePriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    taxSnapshot: {
      type: Number,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const orderTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerSnapshot: {
      type: customerSnapshotSchema,
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    branchSnapshot: {
      type: branchSnapshotSchema,
      default: null,
    },

    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expectedDeliveryDate: {
      type: Date,
      required: true,
    },

    deliverySlot: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening"],
      default: "Morning",
    },

    orderStatus: {
      type: String,
      enum: ["Draft", "Confirmed", "Packed", "Out For Delivery", "Delivered", "Cancelled"],
      default: "Draft",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    deliveryStatus: {
      type: String,
      enum: ["Pending", "Packed", "Out For Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },

    invoiceStatus: {
      type: String,
      enum: ["Not Invoiced", "Partially Invoiced", "Fully Invoiced"],
      default: "Not Invoiced",
    },

    orderType: {
      type: String,
      enum: ["Manual", "Customer Portal", "WhatsApp", "AI Voice Call", "API"],
      default: "Manual",
    },

    orderSource: {
      type: String,
      enum: ["Admin", "Customer", "Automation", "AI", "Sales Executive"],
      default: "Admin",
    },

    assignedVehicle: {
      type: String,
      default: null,
      trim: true,
    },

    assignedDriver: {
      type: String,
      default: null,
      trim: true,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    customerNotes: {
      type: String,
      default: "",
      trim: true,
    },

    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },

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

    discountType: {
      type: String,
      enum: ["Flat", "Percentage"],
      default: "Flat",
    },

    transportCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    orderItems: [orderItemSchema],

    orderTimeline: [orderTimelineSchema],

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

// Concurrency-safe atomic order number generation
orderSchema.pre("validate", async function () {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = await generateCounter("orderNumber", "ORD", 6);
  }
});

orderSchema.index({ orderDate: -1, isDeleted: 1 });
orderSchema.index({ customerId: 1, isDeleted: 1 });
orderSchema.index({ orderStatus: 1, isDeleted: 1 });

module.exports = mongoose.model("Order", orderSchema);
