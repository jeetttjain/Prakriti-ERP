/**
 * Mock SMS messaging service provider interface.
 */
const sendSMS = async (recipient, message) => {
  console.log(`[SMS Provider] Transmitting message to recipient ${recipient}: ${message}`);
  return {
    success: true,
    messageId: `sms_msg_${Math.floor(100000 + Math.random() * 900000)}`,
  };
};

module.exports = { sendSMS };
