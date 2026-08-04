/**
 * Dynamically appends an entry to a document's timeline array.
 * Works for Order, Invoice, Payment, and other timeline-enabled schemas.
 * @param {object} document The Mongoose document instance
 * @param {string} timelineField The field name of the timeline array (e.g., 'orderTimeline')
 * @param {string} status The new status value
 * @param {string|null} [updatedBy=null] Username or userId initiating the update
 * @param {string} [notes=""] Optional notes describing the action
 */
const appendTimeline = (document, timelineField, status, updatedBy = null, notes = "") => {
  if (!document[timelineField]) {
    document[timelineField] = [];
  }

  const defaultNotesMap = {
    orderTimeline: `Order status updated to ${status}.`,
    invoiceTimeline: `Invoice status updated to ${status}.`,
    paymentTimeline: `Payment status updated to ${status}.`,
  };

  const defaultNote = defaultNotesMap[timelineField] || `Status updated to ${status}.`;

  document[timelineField].push({
    status,
    timestamp: new Date(),
    updatedBy: updatedBy || null,
    notes: notes || defaultNote,
  });
};

module.exports = {
  appendTimeline,
};
