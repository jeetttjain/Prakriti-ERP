const eventSubscriber = require("../events/eventSubscriber");
const { EVENTS } = require("../events/eventRegistry");

const registerSystemListeners = () => {
  eventSubscriber.subscribe(EVENTS.BACKUP_COMPLETED, (eventDoc) => {
    console.log(`[SystemListener] Received ${EVENTS.BACKUP_COMPLETED}`);
  });

  eventSubscriber.subscribe(EVENTS.SYSTEM_ERROR, (eventDoc) => {
    console.log(`[SystemListener] Received ${EVENTS.SYSTEM_ERROR}`);
  });
};

module.exports = registerSystemListeners;
