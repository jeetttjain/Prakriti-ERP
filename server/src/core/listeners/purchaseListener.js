const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");
const automationEngine = require("../automation/automationEngine");

const registerPurchaseListeners = () => {
  eventSubscriber.subscribe(EVENTS.PURCHASE_CREATED, (eventDoc) => {
    console.log(`[PurchaseListener] Received ${EVENTS.PURCHASE_CREATED}`);
  });

  eventSubscriber.subscribe(EVENTS.PURCHASE_APPROVED, (eventDoc) => {
    console.log(`[PurchaseListener] Received ${EVENTS.PURCHASE_APPROVED}`);
  });
};

module.exports = registerPurchaseListeners;
