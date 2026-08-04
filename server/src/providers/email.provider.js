/**
 * Mock Email messaging service provider interface.
 */
const sendEmail = async (recipient, message) => {
  console.log(`[Email Provider] Transmitting message to recipient ${recipient}: ${message}`);
  return {
    success: true,
    messageId: `email_msg_${Math.floor(100000 + Math.random() * 900000)}`,
  };
};

module.exports = { sendEmail };
