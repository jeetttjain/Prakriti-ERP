const mongoose = require("mongoose");

const financialPeriodSchema = new mongoose.Schema(
  {
    periodId: { type: String, required: true, unique: true },
    fiscalYear: { type: String, required: true },
    month: { type: Number, required: true },
    status: { type: String, enum: ["Open", "SoftClosed", "HardClosed"], default: "Open" },
    closedBy: { type: String },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinancialPeriod", financialPeriodSchema);
