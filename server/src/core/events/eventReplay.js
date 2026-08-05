const EventLog = require("../../models/EventLog");
const eventSubscriber = require("./eventSubscriber");

class EventReplay {
  /**
   * Replays events based on filter criteria.
   */
  async replayEvents(filters = {}) {
    const query = {};

    if (filters.eventId) query.eventId = filters.eventId;
    if (filters.module) query.producerModule = filters.module;
    if (filters.eventName) query.eventName = filters.eventName;
    if (filters.correlationId) query.correlationId = filters.correlationId;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const events = await EventLog.find(query).sort({ timestamp: 1 });
    let replayedCount = 0;

    for (const eventDoc of events) {
      // Re-emit event through subscriber bus
      eventSubscriber.emitEvent(eventDoc);
      replayedCount++;
    }

    return {
      replayedCount,
      query,
      timestamp: new Date(),
    };
  }
}

module.exports = new EventReplay();
