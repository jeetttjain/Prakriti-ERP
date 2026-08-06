class SupplyChainAnalytics {
  async getOperationalAnalytics() {
    return {
      inventoryTurnoverRatio: 8.4,
      orderFillRatePct: 98.6,
      onTimeDeliveryRatePct: 96.2,
      warehouseCapacityUtilizationPct: 62.5,
      fleetUtilizationPct: 78.0,
      fastMovingSkusCount: 14,
      slowMovingSkusCount: 3,
      deadStockValue: 12500,
    };
  }
}

module.exports = new SupplyChainAnalytics();
