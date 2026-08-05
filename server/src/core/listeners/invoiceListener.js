const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");
const automationEngine = require("../automation/automationEngine");

const registerInvoiceListeners = () => {
  eventSubscriber.subscribe(EVENTS.INVOICE_GENERATED, (eventDoc) => {
    console.log(`[InvoiceListener] Received ${EVENTS.INVOICE_GENERATED}`);
    automationEngine.processEventTrigger(EVENTS.INVOICE_GENERATED, eventDoc.payload, { correlationId: eventDoc.correlationId });
  });

  eventSubscriber.subscribe(EVENTS.PAYMENT_OVERDUE, (eventDoc) => {
    console.log(`[InvoiceListener] Received ${EVENTS.PAYMENT_OVERDUE}`);
    automationEngine.processEventTrigger(EVENTS.PAYMENT_OVERDUE, eventDoc.payload, { correlationId: eventDoc.correlationId });
  });
};

module.exports = registerInvoiceListeners;
