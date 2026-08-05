const EventEmitter = require("events");

class EventSubscriber extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Emits an event object to registered module listeners.
   */
  emitEvent(eventDoc) {
    if (eventDoc && eventDoc.eventName) {
      this.emit(eventDoc.eventName, eventDoc);
      this.emit("*", eventDoc); // Wildcard listener for global audit logging
    }
  }

  /**
   * Subscribe to specific event name.
   */
  subscribe(eventName, handler) {
    this.on(eventName, handler);
  }

  /**
   * Unsubscribe from specific event name.
   */
  unsubscribe(eventName, handler) {
    this.off(eventName, handler);
  }
}

module.exports = new EventSubscriber();
