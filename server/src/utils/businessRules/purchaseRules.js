const purchaseRules = [
  {
    ruleId: "PURCHASE_COST_OPTIMIZATION",
    name: "Procurement Cost Optimization Opportunity",
    category: "Purchase",
    severity: "Info",
    priority: "Medium",
    evaluate: (data) => {
      if (data.highCostCategory) {
        return { triggered: true, category: data.highCostCategory, estSavings: data.estSavings || 5000 };
      }
      return { triggered: false };
    },
    generateRecommendation: (result) => ({
      recId: `REC-PURCHASE-OPT-${Date.now()}`,
      ruleId: "PURCHASE_COST_OPTIMIZATION",
      category: "Purchase",
      severity: "Info",
      priority: "Medium",
      title: `Bulk Procurement Opportunity in ${result.category}`,
      description: `Combining weekly purchase orders for ${result.category} can qualify for volume supplier discounts.`,
      reason: "Fragmented small-lot purchases incurring higher unit transportation and handling rates.",
      suggestedAction: "Consolidate supplier purchase orders into bi-weekly bulk deliveries.",
      estimatedImpact: `Estimated monthly cost saving of ₹${result.estSavings}.`,
      navigationTarget: { path: "/purchases", label: "View Purchase Orders" },
    }),
  },
];

module.exports = purchaseRules;
