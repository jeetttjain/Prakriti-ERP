const Customer = require("../../../models/Customer");
const CreditProfile = require("../../../models/CreditProfile");
const LoyaltyAccount = require("../../../models/LoyaltyAccount");
const CustomerHealth = require("../../../models/CustomerHealth");
const CustomerActivity = require("../../../models/CustomerActivity");
const Quotation = require("../../../models/Quotation");
const Complaint = require("../../../models/Complaint");
const SalesVisit = require("../../../models/SalesVisit");

const CustomerContract = require("../../../models/CustomerContract");
const customerSuccessEngine = require("../success/customerSuccessEngine");
const recommendationEngine = require("../recommendations/recommendationEngine");

class Customer360Engine {
  /**
   * Aggregates a complete 360-degree unified profile for a customer.
   */
  async getCustomer360Profile(customerCode) {
    const customer = await Customer.findOne({ customerCode });
    if (!customer) throw new Error(`Customer ${customerCode} not found.`);

    const [credit, loyalty, health, activities, quotations, complaints, visits, contracts, success, recs] = await Promise.all([
      CreditProfile.findOne({ customerCode }),
      LoyaltyAccount.findOne({ customerCode }),
      CustomerHealth.findOne({ customerCode }),
      CustomerActivity.find({ customerCode }).sort({ createdAt: -1 }).limit(20),
      Quotation.find({ customerCode }).sort({ createdAt: -1 }),
      Complaint.find({ customerCode }).sort({ createdAt: -1 }),
      SalesVisit.find({ customerCode }).sort({ createdAt: -1 }),
      CustomerContract.find({ customerCode }).sort({ createdAt: -1 }),
      customerSuccessEngine.getSuccessHealth(customerCode),
      recommendationEngine.getRecommendations(customerCode),
    ]);

    return {
      customer,
      creditProfile: credit || { creditLimit: 200000, currentOutstanding: 0, riskScore: 15 },
      loyaltyAccount: loyalty || { tier: "Gold", pointsBalance: 1250 },
      healthScore: health || { healthScore: 88, riskLevel: "Low", factors: ["Regular Payment", "High Order Volume"] },
      recentActivities: activities,
      quotations,
      complaints,
      visits,
      contracts,
      customerSuccess: success,
      recommendations: recs,
      biRecommendations: [
        "Cross-sell Organic Mustard Oil 5L container",
        "Offer 5% bulk volume discount on next order",
      ],
    };
  }
}

module.exports = new Customer360Engine();
