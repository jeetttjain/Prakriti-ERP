const loggerEngine = require("../logging/loggerEngine");
const metricsEngine = require("../metrics/metricsEngine");
const tracingEngine = require("../tracing/tracingEngine");
const healthEngine = require("../health/healthEngine");

class TelemetryPipeline {
  async log(level, module, message, metadata, correlationId) {
    return loggerEngine.log(level, module, message, metadata, correlationId);
  }

  async getMetrics() {
    return metricsEngine.collectMetrics();
  }

  async startSpan(opName, module, parentSpanId) {
    return tracingEngine.startSpan(opName, module, parentSpanId);
  }

  async getHealth() {
    return healthEngine.checkHealth();
  }
}

module.exports = new TelemetryPipeline();
