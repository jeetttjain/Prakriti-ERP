const thresholds = require("../../config/biThresholds");

/**
 * Calculates overall Business Health Score (0-100) based on weighted operational dimensions.
 */
const calculateBusinessHealthScore = (metrics = {}) => {
  const weights = thresholds.healthWeights;

  // 1. Sales Sub-Score (0-100)
  const revenueGrowth = metrics.momRevenueGrowthPct || 0;
  let salesScore = 100;
  if (revenueGrowth < 0) salesScore = Math.max(50, 100 + revenueGrowth * 2);
  else salesScore = Math.min(100, 80 + revenueGrowth * 2);

  // 2. Inventory Sub-Score (0-100)
  const lowStockCount = metrics.lowStockCount || 0;
  const outOfStockCount = metrics.outOfStockCount || 0;
  let inventoryScore = Math.max(40, 100 - (lowStockCount * 5 + outOfStockCount * 15));

  // 3. Finance Sub-Score (0-100)
  const collectionEfficiency = metrics.collectionEfficiencyPct || 85;
  const overdueRatio = metrics.overdueRatioPct || 0;
  let financeScore = Math.max(30, Math.min(100, collectionEfficiency - overdueRatio));

  // 4. Customer Sub-Score (0-100)
  const repeatCustomerPct = metrics.repeatCustomerPct || 70;
  let customerScore = Math.min(100, Math.max(50, repeatCustomerPct + 20));

  // 5. Supplier Sub-Score (0-100)
  const supplierOnTimePct = metrics.supplierOnTimePct || 90;
  let supplierScore = Math.min(100, Math.max(40, supplierOnTimePct));

  // 6. Operations Sub-Score (0-100)
  const orderFulfillmentPct = metrics.orderFulfillmentPct || 95;
  let operationsScore = Math.min(100, Math.max(50, orderFulfillmentPct));

  // Weighted Sum Calculation
  const overallScore = Math.round(
    salesScore * weights.sales +
    inventoryScore * weights.inventory +
    financeScore * weights.finance +
    customerScore * weights.customers +
    supplierScore * weights.suppliers +
    operationsScore * weights.operations
  );

  const normalizedOverall = Math.max(0, Math.min(100, overallScore));

  return {
    overallScore: normalizedOverall,
    grade: normalizedOverall >= 85 ? "A+" : normalizedOverall >= 75 ? "A" : normalizedOverall >= 60 ? "B" : "C",
    subScores: {
      sales: Math.round(salesScore),
      inventory: Math.round(inventoryScore),
      finance: Math.round(financeScore),
      customers: Math.round(customerScore),
      suppliers: Math.round(supplierScore),
      operations: Math.round(operationsScore),
    },
  };
};

module.exports = {
  calculateBusinessHealthScore,
};
