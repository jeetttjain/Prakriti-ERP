const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");

const registerCustomerListeners = () => {
  eventSubscriber.subscribe(EVENTS.CUSTOMER_REGISTERED, (eventDoc) => {
    console.log(`[CustomerListener] Received ${EVENTS.CUSTOMER_REGISTERED}`);
  });
};

module.exports = registerCustomerListeners;
