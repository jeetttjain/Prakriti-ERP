const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    quotationId: { type: String, required: true, unique: true },
    customerCode: { type: String, required: true, index: true },
    opportunityId: { type: String },
    items: [
      {
        productCode: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    discountPct: { type: Number, default: 5 },
    taxAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["Draft", "Sent", "Approved", "Converted", "Rejected"], default: "Sent" },
    validUntil: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
