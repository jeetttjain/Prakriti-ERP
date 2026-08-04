const { syncInvoicePaymentStatus } = require("./invoiceSync.service");

/**
 * Orchestrates updates and syncs for an invoice when an associated payment is created, updated, or deleted.
 * @param {string} invoiceId
 */
const handlePaymentChange = async (invoiceId, session = null) => {
  if (!invoiceId) return;
  await syncInvoicePaymentStatus(invoiceId, session);
};

module.exports = {
  handlePaymentChange,
};
