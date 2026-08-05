const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");

const registerSupplierListeners = () => {
  eventSubscriber.subscribe(EVENTS.SUPPLIER_ADDED, (eventDoc) => {
    console.log(`[SupplierListener] Received ${EVENTS.SUPPLIER_ADDED}`);
  });
};

module.exports = registerSupplierListeners;
