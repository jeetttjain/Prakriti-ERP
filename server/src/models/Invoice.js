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

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
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

const invoiceTimelineSchema = new mongoose.Schema(
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

const paymentSummarySchema = new mongoose.Schema(
  {
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    paymentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    invoiceSequence: {
      type: Number,
      default: 1,
      min: 1,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
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

    branchSnapshot: {
      type: branchSnapshotSchema,
      default: null,
    },

    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    invoiceStatus: {
      type: String,
      enum: ["Draft", "Issued", "Partially Paid", "Paid", "Cancelled"],
      default: "Draft",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    invoiceType: {
      type: String,
      enum: ["Sale", "Credit Note", "Debit Note", "Proforma", "Estimate"],
      default: "Sale",
    },

    invoiceSource: {
      type: String,
      enum: ["Order", "Manual", "API", "Automation"],
      default: "Order",
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    exchangeRate: {
      type: Number,
      default: 1,
      min: 0,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    pdfStatus: {
      type: String,
      enum: ["Not Generated", "Generated"],
      default: "Not Generated",
    },

    whatsappStatus: {
      type: String,
      enum: ["Pending", "Sent", "Delivered", "Failed"],
      default: "Pending",
    },

    whatsappRetryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    emailStatus: {
      type: String,
      enum: ["Pending", "Sent", "Failed"],
      default: "Pending",
    },

    emailRetryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    printCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    revisionNumber: {
      type: Number,
      default: 1,
      min: 1,
    },

    ledgerSynced: {
      type: Boolean,
      default: false,
    },

    paymentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    paymentSummary: {
      type: paymentSummarySchema,
      default: () => ({}),
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: String,
      default: null,
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

    taxAmount: {
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
      trim: true,
    },

    invoiceItems: [invoiceItemSchema],

    invoiceTimeline: [invoiceTimelineSchema],

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

// Concurrency-safe atomic invoice number generation
invoiceSchema.pre("validate", async function () {
  if (this.isNew && !this.invoiceNumber) {
    this.invoiceNumber = await generateCounter("invoiceNumber", "INV", 6);
  }
});

invoiceSchema.index({ invoiceDate: -1, isDeleted: 1 });
invoiceSchema.index({ customerId: 1, isDeleted: 1 });
invoiceSchema.index({ paymentStatus: 1, isDeleted: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
