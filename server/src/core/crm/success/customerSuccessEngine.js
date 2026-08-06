const CustomerSuccess = require("../../../models/CustomerSuccess");

class CustomerSuccessEngine {
  async getSuccessHealth(customerCode) {
    let success = await CustomerSuccess.findOne({ customerCode });
    if (!success) {
      success = await CustomerSuccess.create({
        customerCode,
        onboardingProgressPct: 100,
        churnRisk: "Low",
        successScore: 94,
        growthOpportunity: "Expand into Cold-Pressed Mustard Oil 15L Tins",
      });
    }
    return success;
  }
}

module.exports = new CustomerSuccessEngine();
