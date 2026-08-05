const thresholds = require("../../config/biThresholds");

const inventoryRules = [
  {
    ruleId: "INV_LOW_STOCK_DEPLETION",
    name: "Stock Depletion Warning",
    category: "Inventory",
    severity: "Warning",
    priority: "High",
    evaluate: (data) => {
      const itemsToReorder = (data.lowStockItems || []).map((item) => {
        const dailyBurnRate = item.dailyBurnRate || 5;
        const daysLeft = dailyBurnRate > 0 ? Math.floor(item.currentStock / dailyBurnRate) : 3;
        const recommendedQty = Math.max((item.reorderLevel || 20) * 2 - item.currentStock, 50);
        return {
          productName: item.productId?.productName || "Vegetable Produce",
          productId: item.productId?._id,
          currentStock: item.currentStock,
          unit: item.productId?.unit || "kg",
          daysLeft,
          recommendedQty,
        };
      });
      return { triggered: itemsToReorder.length > 0, items: itemsToReorder };
    },
    generateRecommendation: (result) => {
      const topItem = result.items[0];
      return {
        recId: `REC-STOCK-LOW-${topItem.productId || Date.now()}`,
        ruleId: "INV_LOW_STOCK_DEPLETION",
        category: "Inventory",
        severity: topItem.daysLeft <= 1 ? "Critical" : "Warning",
        priority: "High",
        title: `${topItem.productName} stock will finish in ${topItem.daysLeft} days`,
        description: `Current inventory of ${topItem.productName} is ${topItem.currentStock}${topItem.unit}. At current sales velocity, stock will be exhausted in ${topItem.daysLeft} days.`,
        reason: "Inventory current level fell below safety reorder threshold.",
        suggestedAction: `Issue purchase order for approx ${topItem.recommendedQty}${topItem.unit} immediately.`,
        estimatedImpact: `Prevents stockout and protects estimated revenue of ₹${(topItem.recommendedQty * 40).toFixed(0)}.`,
        navigationTarget: { path: "/purchases", label: "Create Purchase Order" },
      };
    },
  },
  {
    ruleId: "INV_DEAD_STOCK_DETECTION",
    name: "Dead Stock Clearance Alert",
    category: "Inventory",
    severity: "Warning",
    priority: "Medium",
    evaluate: (data) => {
      const deadItems = (data.deadStockItems || []).map((item) => ({
        productName: item.productId?.productName || "Stock Item",
        currentStock: item.currentStock,
        value: item.currentStock * (item.productId?.price || 50),
        idleDays: item.idleDays || 30,
      }));
      const totalDeadValue = deadItems.reduce((acc, i) => acc + i.value, 0);
      return { triggered: deadItems.length > 0, deadItems, totalDeadValue };
    },
    generateRecommendation: (result) => ({
      recId: `REC-DEAD-STOCK-${Date.now()}`,
      ruleId: "INV_DEAD_STOCK_DETECTION",
      category: "Inventory",
      severity: "Warning",
      priority: "Medium",
      title: `Dead stock worth ₹${result.totalDeadValue.toFixed(0)} is blocking inventory`,
      description: `${result.deadItems.length} product SKUs have had no movement for over ${thresholds.inventory.deadStockDaysThreshold} days.`,
      reason: "Capital tied up in non-moving produce or slow-decaying catalog items.",
      suggestedAction: "Discount price by 15-25% or bundle with fast-moving wholesale orders to clear warehouse space.",
      estimatedImpact: `Frees ₹${result.totalDeadValue.toFixed(0)} working capital and reduces warehouse holding costs.`,
      navigationTarget: { path: "/inventory", label: "View Dead Stock" },
    }),
  },
];

module.exports = inventoryRules;
