class TerritoryPerformanceEngine {
  async getTerritoryMetrics() {
    return [
      { territoryId: "TERR-NORTH-01", name: "Jaipur Central", salesTarget: 1500000, salesAchieved: 1250000, visitCompletionPct: 94.5, activeExecutiveCount: 4 },
      { territoryId: "TERR-WEST-02", name: "Surat Commercial Hub", salesTarget: 1800000, salesAchieved: 1620000, visitCompletionPct: 96.0, activeExecutiveCount: 5 },
    ];
  }
}

module.exports = new TerritoryPerformanceEngine();
