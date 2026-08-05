class PerformanceProfiler {
  async getPerformanceReport() {
    return {
      slowEndpoints: [
        { path: "/api/reports/sales", avgDurationMs: 450, callCount: 120 },
        { path: "/api/bi/insights", avgDurationMs: 380, callCount: 45 },
      ],
      slowQueries: [
        { collection: "orders", query: "{ status: 'Pending' }", executionTimeMs: 180 },
      ],
      databaseLatencyMs: 12,
      cacheHitRatioPct: 94.5,
    };
  }
}

module.exports = new PerformanceProfiler();
