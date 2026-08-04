const EventEmitter = require("events");

class AppEventEmitter extends EventEmitter {}
const eventEmitter = new AppEventEmitter();

/**
 * Emit an event to any listeners on the in-process event bus.
 * @param {string} eventName
 * @param {any} payload
 */
const emit = (eventName, payload) => {
  eventEmitter.emit(eventName, payload);
};

/**
 * Register a listener for an event on the in-process event bus.
 * @param {string} eventName
 * @param {function} handler
 */
const on = (eventName, handler) => {
  eventEmitter.on(eventName, handler);
};

module.exports = {
  emit,
  on,
  eventEmitter,
};
