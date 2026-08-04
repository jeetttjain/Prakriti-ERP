const mongoose = require("mongoose");
const { generateCounter } = require("../services/counter.service");

const paymentTimelineSchema = new mongoose.Schema(
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

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    receiptStatus: {
      type: String,
      enum: ["Not Generated", "Generated", "Sent"],
      default: "Not Generated",
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
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

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    settlementDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Wallet"],
      required: true,
    },

    paymentSource: {
      type: String,
      enum: ["Admin", "Customer Portal", "API", "Automation", "Bank Import"],
      default: "Admin",
    },

    reconciliationStatus: {
      type: String,
      enum: ["Pending", "Matched", "Mismatch"],
      default: "Pending",
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    amountReceived: {
      type: Number,
      required: true,
      min: 0.01,
    },

    transactionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    netReceived: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Cancelled", "Refunded"],
      default: "Completed",
    },

    paymentType: {
      type: String,
      enum: ["Full Payment", "Partial Payment", "Advance", "Adjustment", "Refund"],
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    attachments: [
      {
        type: String,
        trim: true,
      },
    ],

    paymentTimeline: [paymentTimelineSchema],

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

// Concurrency-safe atomic double sequence generation
paymentSchema.pre("validate", async function () {
  if (this.isNew) {
    if (!this.paymentNumber) {
      this.paymentNumber = await generateCounter("paymentNumber", "PAY", 6);
    }
    if (!this.receiptNumber) {
      this.receiptNumber = await generateCounter("receiptNumber", "RCP", 6);
    }
  }
});

paymentSchema.index({ paymentDate: -1, isDeleted: 1 });
paymentSchema.index({ customerId: 1, isDeleted: 1 });
paymentSchema.index({ paymentStatus: 1, isDeleted: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
