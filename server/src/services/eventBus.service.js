const EventEmitter = require("events");

/**
 * Centralized Decoupled Event Bus.
 * Business modules publish events after successful database commit.
 * Automation Engine subscribes asynchronously.
 * @module services/eventBus.service
 */
class SystemEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Publishes an event to the Event Bus asynchronously.
   * @param {string} eventName Event trigger identifier
   * @param {Object} payload Event data object
   */
  publish(eventName, payload = {}) {
    setImmediate(() => {
      try {
        const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        this.emit(eventName, {
          eventId,
          eventName,
          timestamp: new Date(),
          payload,
        });
      } catch (error) {
        console.error(`[EventBus] Error publishing ${eventName}:`, error.message);
      }
    });
  }
}

const eventBus = new SystemEventBus();

// Supported Platform Event Triggers
const EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  PURCHASE_CREATED: "PURCHASE_CREATED",
  PURCHASE_RECEIVED: "PURCHASE_RECEIVED",
  INVOICE_CREATED: "INVOICE_CREATED",
  INVOICE_PAID: "INVOICE_PAID",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  INVENTORY_LOW: "INVENTORY_LOW",
  INVENTORY_OUT_OF_STOCK: "INVENTORY_OUT_OF_STOCK",
  CUSTOMER_CREATED: "CUSTOMER_CREATED",
  SUPPLIER_CREATED: "SUPPLIER_CREATED",
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  EXPORT_COMPLETED: "EXPORT_COMPLETED",
  CUSTOMER_PORTAL_ORDER_CREATED: "CUSTOMER_PORTAL_ORDER_CREATED",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
};

module.exports = {
  eventBus,
  EVENTS,
};
