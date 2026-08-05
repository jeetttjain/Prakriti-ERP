const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");
const automationEngine = require("../automation/automationEngine");

const registerOrderListeners = () => {
  eventSubscriber.subscribe(EVENTS.ORDER_CREATED, (eventDoc) => {
    console.log(`[OrderListener] Received ${EVENTS.ORDER_CREATED} (ID: ${eventDoc.eventId})`);
    automationEngine.processEventTrigger(EVENTS.ORDER_CREATED, eventDoc.payload, { correlationId: eventDoc.correlationId });
  });

  eventSubscriber.subscribe(EVENTS.ORDER_CANCELLED, (eventDoc) => {
    console.log(`[OrderListener] Received ${EVENTS.ORDER_CANCELLED}`);
  });
};

module.exports = registerOrderListeners;
