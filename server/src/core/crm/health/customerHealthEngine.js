const CustomerHealth = require("../../../models/CustomerHealth");

class CustomerHealthEngine {
  async getHealthScore(customerCode) {
    let health = await CustomerHealth.findOne({ customerCode });
    if (!health) {
      health = await CustomerHealth.create({
        customerCode,
        healthScore: 88,
        riskLevel: "Low",
        factors: ["Prompt Payment History", "Zero Critical Complaints"],
      });
    }
    return health;
  }
}

module.exports = new CustomerHealthEngine();
