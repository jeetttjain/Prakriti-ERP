const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");
const automationEngine = require("../automation/automationEngine");

const registerPaymentListeners = () => {
  eventSubscriber.subscribe(EVENTS.PAYMENT_RECEIVED, (eventDoc) => {
    console.log(`[PaymentListener] Received ${EVENTS.PAYMENT_RECEIVED}`);
    automationEngine.processEventTrigger(EVENTS.PAYMENT_RECEIVED, eventDoc.payload, { correlationId: eventDoc.correlationId });
  });

  eventSubscriber.subscribe(EVENTS.PAYMENT_FAILED, (eventDoc) => {
    console.log(`[PaymentListener] Received ${EVENTS.PAYMENT_FAILED}`);
  });
};

module.exports = registerPaymentListeners;
