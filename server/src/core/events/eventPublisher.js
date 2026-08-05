const crypto = require("crypto");
const EventLog = require("../../models/EventLog");
const eventSubscriber = require("./eventSubscriber");
const { systemControlFlags } = require("../automation/systemControlFlags");

class EventPublisher {
  /**
   * Generates a unique idempotency key for deduplication.
   */
  generateIdempotencyKey(eventName, payload = {}, producerModule = "UNKNOWN") {
    const entityId = payload._id || payload.id || payload.entityId || "none";
    const bucket = Math.floor(Date.now() / (60 * 1000)); // 1 min deduplication window
    return crypto
      .createHash("md5")
      .update(`${eventName}_${producerModule}_${entityId}_${bucket}`)
      .digest("hex");
  }

  /**
   * Publishes an event to the Event Bus.
   */
  async publish(eventName, payload = {}, metadata = {}) {
    if (!systemControlFlags.isEngineEnabled) {
      console.log(`[EventPublisher] Engine is disabled/paused. Skipping event ${eventName}.`);
      return null;
    }

    const producerModule = metadata.producerModule || "SYSTEM";
    const correlationId = metadata.correlationId || `CORR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const idempotencyKey = metadata.idempotencyKey || this.generateIdempotencyKey(eventName, payload, producerModule);

    // Idempotency Deduplication Check
    const existing = await EventLog.findOne({ idempotencyKey }).lean();
    if (existing) {
      console.log(`[EventPublisher] Duplicate event suppressed (Idempotency Key: ${idempotencyKey})`);
      return existing;
    }

    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const eventDoc = await EventLog.create({
      eventId,
      eventName,
      eventVersion: metadata.eventVersion || "1.0",
      schemaVersion: metadata.schemaVersion || "1.0",
      producerModule,
      consumerModules: metadata.consumerModules || [],
      payload,
      timestamp: new Date(),
      createdBy: metadata.createdBy || "SYSTEM",
      priority: metadata.priority || "NORMAL",
      correlationId,
      idempotencyKey,
      executionStatus: "PUBLISHED",
    });

    // Notify Subscribers asynchronously
    setImmediate(() => {
      eventSubscriber.emitEvent(eventDoc);
    });

    return eventDoc;
  }
}

module.exports = new EventPublisher();
