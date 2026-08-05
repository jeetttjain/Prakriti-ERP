const thresholds = require("../../config/biThresholds");

const customerRules = [
  {
    ruleId: "CUST_INACTIVITY_CHURN",
    name: "Customer Inactivity & Churn Risk",
    category: "Customer",
    severity: "Warning",
    priority: "High",
    evaluate: (data) => {
      const inactive = (data.inactiveCustomers || []).map((c) => ({
        customerId: c._id,
        businessName: c.businessName || "Wholesale Buyer",
        daysInactive: c.daysInactive || 22,
        avgOrderValue: c.avgOrderValue || 5000,
      }));
      return { triggered: inactive.length > 0, inactive };
    },
    generateRecommendation: (result) => {
      const topCust = result.inactive[0];
      return {
        recId: `REC-CUST-INACTIVE-${topCust.customerId || Date.now()}`,
        ruleId: "CUST_INACTIVITY_CHURN",
        category: "Customer",
        severity: "Warning",
        priority: "High",
        title: `Customer ${topCust.businessName} has not ordered in ${topCust.daysInactive} days`,
        description: `High-value customer ${topCust.businessName} (AOV ₹${topCust.avgOrderValue}) has stopped procurement for over 3 weeks.`,
        reason: "Extended purchasing gap exceeding standard wholesale reorder frequency.",
        suggestedAction: "Sales executive should contact purchasing officer with custom rate sheet or credit extension.",
        estimatedImpact: `Protects annual customer LTV of ₹${(topCust.avgOrderValue * 24).toFixed(0)}.`,
        navigationTarget: { path: `/customers/${topCust.customerId}`, label: "View Customer Profile" },
      };
    },
  },
];

module.exports = customerRules;
