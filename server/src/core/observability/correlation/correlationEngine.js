class CorrelationEngine {
  /**
   * Generates a new Correlation ID or Trace ID.
   */
  generateCorrelationId(prefix = "CORR") {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  generateTraceId() {
    return `TRACE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
}

module.exports = new CorrelationEngine();
