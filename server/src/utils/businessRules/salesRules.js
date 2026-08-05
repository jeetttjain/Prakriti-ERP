const thresholds = require("../../config/biThresholds");

const salesRules = [
  {
    ruleId: "SALES_REVENUE_DROP",
    name: "Revenue Drop Alert",
    category: "Sales",
    severity: "Warning",
    priority: "High",
    evaluate: (data) => {
      if (data.prevWeekRevenue > 0 && data.currentWeekRevenue < data.prevWeekRevenue) {
        const dropPct = ((data.prevWeekRevenue - data.currentWeekRevenue) / data.prevWeekRevenue) * 100;
        if (dropPct >= thresholds.sales.revenueDropPctWarning) {
          return {
            triggered: true,
            dropPct: dropPct.toFixed(1),
            prevRevenue: data.prevWeekRevenue,
            currRevenue: data.currentWeekRevenue,
          };
        }
      }
      return { triggered: false };
    },
    generateRecommendation: (result) => ({
      recId: `REC-SALES-DROP-${Date.now()}`,
      ruleId: "SALES_REVENUE_DROP",
      category: "Sales",
      severity: result.dropPct > 20 ? "Critical" : "Warning",
      priority: "High",
      title: `Weekly Revenue Decreased by ${result.dropPct}%`,
      description: `Weekly sales revenue dropped to ₹${result.currRevenue} compared to ₹${result.prevRevenue} last week.`,
      reason: "Significant decline in customer sales volume or average order size over the past 7 days.",
      suggestedAction: "Launch promotional campaign on top selling produce items and re-engage inactive wholesale customers.",
      estimatedImpact: `Potential recovery of ₹${(result.prevRevenue - result.currRevenue).toFixed(0)} in weekly revenue.`,
      navigationTarget: { path: "/orders", label: "Inspect Orders" },
    }),
  },
  {
    ruleId: "SALES_PEAK_HOURS",
    name: "Peak Ordering Period Detection",
    category: "Sales",
    severity: "Info",
    priority: "Low",
    evaluate: (data) => {
      if (data.peakHour !== undefined) {
        return { triggered: true, peakHour: data.peakHour };
      }
      return { triggered: false };
    },
    generateRecommendation: (result) => ({
      recId: `REC-PEAK-HOUR-${Date.now()}`,
      ruleId: "SALES_PEAK_HOURS",
      category: "Sales",
      severity: "Info",
      priority: "Low",
      title: `Peak Wholesale Ordering Hour Identified (${result.peakHour}:00)`,
      description: `Highest volume of customer orders occurs around ${result.peakHour}:00 Hrs.`,
      reason: "Concentration of daily customer procurement orders during morning wholesale window.",
      suggestedAction: "Ensure adequate dispatch staff and inventory pickers are assigned prior to peak hour.",
      estimatedImpact: "Improves order fulfillment velocity and reduces customer dispatch latency by 25%.",
      navigationTarget: { path: "/orders", label: "View Order Schedule" },
    }),
  },
];

module.exports = salesRules;
