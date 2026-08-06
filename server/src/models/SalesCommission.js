const mongoose = require("mongoose");

const salesCommissionSchema = new mongoose.Schema(
  {
    commissionId: { type: String, required: true, unique: true },
    executiveCode: { type: String, required: true, index: true },
    quotationId: { type: String },
    orderValue: { type: Number, required: true },
    commissionRatePct: { type: Number, default: 3.5 },
    commissionAmount: { type: Number, required: true },
    status: { type: String, enum: ["Calculated", "Approved", "Paid"], default: "Calculated" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesCommission", salesCommissionSchema);
