const mongoose = require("mongoose");

const salesForecastSchema = new mongoose.Schema(
  {
    forecastId: { type: String, required: true, unique: true },
    period: { type: String, default: "2026-Q3" },
    forecastRevenue: { type: Number, required: true },
    pipelineValue: { type: Number, required: true },
    winProbabilityPct: { type: Number, default: 75 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesForecast", salesForecastSchema);
