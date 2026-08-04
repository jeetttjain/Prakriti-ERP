/**
 * Mock WhatsApp messaging service provider interface.
 */
const sendWhatsApp = async (recipient, message) => {
  console.log(`[WhatsApp Provider] Transmitting message to recipient ${recipient}: ${message}`);
  return {
    success: true,
    messageId: `wa_msg_${Math.floor(100000 + Math.random() * 900000)}`,
  };
};

module.exports = { sendWhatsApp };
