/**
 * Mock Push notification messaging service provider interface.
 */
const sendPush = async (recipient, message) => {
  console.log(`[Push Provider] Transmitting notification to recipient ${recipient}: ${message}`);
  return {
    success: true,
    messageId: `push_msg_${Math.floor(100000 + Math.random() * 900000)}`,
  };
};

module.exports = { sendPush };
