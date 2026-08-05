const { systemControlFlags } = require("./systemControlFlags");
const jobQueue = require("../queue/jobQueue");

class AutomationEngine {
  /**
   * Triggers an automated job rule evaluation.
   */
  async processEventTrigger(eventName, payload = {}, metadata = {}) {
    if (!systemControlFlags.isEngineEnabled || systemControlFlags.isMaintenanceMode) {
      return null;
    }

    // Queue automated job
    const jobDoc = await jobQueue.enqueue({
      jobName: `AUTO_${eventName}`,
      payload,
      priority: metadata.priority || "NORMAL",
      correlationId: metadata.correlationId,
    });

    return jobDoc;
  }
}

module.exports = new AutomationEngine();
