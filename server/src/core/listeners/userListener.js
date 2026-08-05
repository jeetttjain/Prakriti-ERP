const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");

const registerUserListeners = () => {
  eventSubscriber.subscribe(EVENTS.USER_LOGIN, (eventDoc) => {
    console.log(`[UserListener] Received ${EVENTS.USER_LOGIN}`);
  });

  eventSubscriber.subscribe(EVENTS.USER_LOGOUT, (eventDoc) => {
    console.log(`[UserListener] Received ${EVENTS.USER_LOGOUT}`);
  });

  eventSubscriber.subscribe(EVENTS.ROLE_UPDATED, (eventDoc) => {
    console.log(`[UserListener] Received ${EVENTS.ROLE_UPDATED}`);
  });
};

module.exports = registerUserListeners;
