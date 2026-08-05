/**
 * Centralized, configurable thresholds and weightages for Business Intelligence rules.
 */
module.exports = {
  inventory: {
    lowStockDaysThreshold: 3, // Days of inventory remaining triggering warning
    criticalStockDaysThreshold: 1, // Days of inventory remaining triggering critical
    deadStockDaysThreshold: 30, // Idle days triggering dead stock detection
    slowMovingDaysThreshold: 14, // Idle days triggering slow moving detection
  },
  sales: {
    revenueDropPctWarning: 10, // Revenue drop % triggering warning
    revenueDropPctCritical: 25, // Revenue drop % triggering critical
  },
  customer: {
    inactivityDaysWarning: 21, // Customer inactivity days triggering warning
    inactivityDaysLost: 60, // Customer inactivity days triggering lost status
    creditLimitExceededPct: 100, // Credit limit utilization triggering credit risk
  },
  supplier: {
    delayToleranceHours: 24, // Delay tolerance before supplier warning
    lateDeliveryPctWarning: 20, // Late delivery % threshold
  },
  finance: {
    grossMarginPctMinimum: 15, // Minimum gross margin % target
    collectionEfficiencyPctMinimum: 75, // Minimum collection efficiency target
  },
  healthWeights: {
    sales: 0.25,
    inventory: 0.20,
    finance: 0.25,
    customers: 0.15,
    suppliers: 0.10,
    operations: 0.05,
  },
};
