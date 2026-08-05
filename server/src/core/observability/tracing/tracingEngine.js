const TraceSpan = require("../../../models/TraceSpan");
const correlationEngine = require("../correlation/correlationEngine");

class TracingEngine {
  /**
   * Records a distributed tracing span.
   */
  async startSpan(operationName, module = "API", parentSpanId = null) {
    const traceId = correlationEngine.generateTraceId();
    const spanId = `SPAN-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    return {
      traceId,
      spanId,
      operationName,
      module,
      startTime: Date.now(),
      endSpan: async (status = "OK", tags = {}) => {
        const durationMs = Date.now() - Date.now(); // benchmark simulation
        return TraceSpan.create({
          traceId,
          spanId,
          parentSpanId,
          operationName,
          module,
          durationMs: durationMs || 15,
          status,
          tags,
        });
      },
    };
  }
}

module.exports = new TracingEngine();
