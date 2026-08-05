const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");
const automationEngine = require("../automation/automationEngine");

const registerInventoryListeners = () => {
  eventSubscriber.subscribe(EVENTS.LOW_STOCK, (eventDoc) => {
    console.log(`[InventoryListener] Received ${EVENTS.LOW_STOCK}`);
    automationEngine.processEventTrigger(EVENTS.LOW_STOCK, eventDoc.payload, { correlationId: eventDoc.correlationId });
  });

  eventSubscriber.subscribe(EVENTS.INVENTORY_UPDATED, (eventDoc) => {
    console.log(`[InventoryListener] Received ${EVENTS.INVENTORY_UPDATED}`);
  });
};

module.exports = registerInventoryListeners;
