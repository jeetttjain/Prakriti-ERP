const SystemLog = require("../../../models/SystemLog");
const logMasker = require("./logMasker");
const correlationEngine = require("../correlation/correlationEngine");
const eventPublisher = require("../../events/eventPublisher");

class LoggerEngine {
  /**
   * Logs structured JSON entry with sensitivity masking and Event Bus publishing.
   */
  async log(level = "INFO", module = "System", message = "", metadata = {}, correlationId = null) {
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const maskedMeta = logMasker.mask(metadata);
    const corrId = correlationId || correlationEngine.generateCorrelationId();

    const logDoc = await SystemLog.create({
      logId,
      level,
      module,
      message,
      correlationId: corrId,
      metadata: maskedMeta,
    });

    // Emit LOG_CREATED event to Phase 7.3A Event Bus
    eventPublisher.publish("LOG_CREATED", { logId, level, module, message }, { producerModule: "EOP" }).catch(() => {});

    return logDoc;
  }
}

module.exports = new LoggerEngine();
