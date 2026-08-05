const thresholds = require("../../config/biThresholds");

const financialRules = [
  {
    ruleId: "FIN_OVERDUE_RECEIVABLES",
    name: "Credit Exposure & Overdue Payments Alert",
    category: "Finance",
    severity: "Critical",
    priority: "High",
    evaluate: (data) => {
      if (data.totalOverdue > 0) {
        return {
          triggered: true,
          totalOverdue: data.totalOverdue,
          overdueCount: data.overdueCount || 1,
        };
      }
      return { triggered: false };
    },
    generateRecommendation: (result) => ({
      recId: `REC-FIN-OVERDUE-${Date.now()}`,
      ruleId: "FIN_OVERDUE_RECEIVABLES",
      category: "Finance",
      severity: "Critical",
      priority: "High",
      title: `Outstanding payment dues of ₹${result.totalOverdue.toFixed(0)} exceed safe credit limit`,
      description: `${result.overdueCount} customer invoices are past due date with total unpaid balance of ₹${result.totalOverdue.toFixed(0)}.`,
      reason: "Delayed customer payment collections impacting working capital liquidity.",
      suggestedAction: "Pause new credit orders for overdue accounts and dispatch payment recovery reminders via WhatsApp.",
      estimatedImpact: `Recovers ₹${result.totalOverdue.toFixed(0)} cash flow and reduces bad debt provision.`,
      navigationTarget: { path: "/billing", label: "View Overdue Invoices" },
    }),
  },
];

module.exports = financialRules;
