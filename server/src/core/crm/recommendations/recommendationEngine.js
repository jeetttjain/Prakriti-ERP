const Recommendation = require("../../../models/Recommendation");

class RecommendationEngine {
  async getRecommendations(customerCode) {
    try {
      await Recommendation.collection.dropIndexes().catch(() => {});
    } catch (e) {}

    let rec = await Recommendation.findOne({ customerCode });
    if (!rec) {
      rec = await Recommendation.create({
        recId: `REC-${Date.now()}`,
        customerCode,
        recommendedProducts: [
          { productCode: "PROD-OIL-02", reason: "Cross-sell: Cold-Pressed Sesame Oil 1L" },
          { productCode: "PROD-SPICE-01", reason: "Upsell: Organic Turmeric Powder 500g" },
        ],
      });
    }
    return rec;
  }
}

module.exports = new RecommendationEngine();
