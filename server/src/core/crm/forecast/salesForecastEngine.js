const SalesForecast = require("../../../models/SalesForecast");

class SalesForecastEngine {
  async getForecast() {
    let forecast = await SalesForecast.findOne({ period: "2026-Q3" });
    if (!forecast) {
      forecast = await SalesForecast.create({
        forecastId: "FCST-2026-Q3",
        period: "2026-Q3",
        forecastRevenue: 1250000,
        pipelineValue: 1800000,
        winProbabilityPct: 75,
      });
    }
    return forecast;
  }
}

module.exports = new SalesForecastEngine();
