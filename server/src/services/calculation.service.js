/**
 * Calculates discount amount based on discount value and type.
 * @param {number} subtotal
 * @param {number} discount
 * @param {string} discountType
 * @returns {number}
 */
const calculateDiscount = (subtotal, discount, discountType = "Flat") => {
  const numSubtotal = Number(subtotal) || 0;
  const numDiscount = Number(discount) || 0;
  if (discountType === "Percentage") {
    return numSubtotal * (numDiscount / 100);
  }
  return numDiscount;
};

/**
 * Calculates tax amount based on taxable amount and tax rate percentage.
 * @param {number} amount
 * @param {number} taxRate
 * @returns {number}
 */
const calculateTax = (amount, taxRate = 0) => {
  return (Number(amount) || 0) * ((Number(taxRate) || 0) / 100);
};

/**
 * Calculates outstanding payment balance.
 * @param {number} grandTotal
 * @param {number} paidAmount
 * @returns {number}
 */
const calculateOutstanding = (grandTotal, paidAmount) => {
  return Math.max(0, (Number(grandTotal) || 0) - (Number(paidAmount) || 0));
};

/**
 * Calculates net received payment after deducting transaction fee.
 * @param {number} amountReceived
 * @param {number} transactionFee
 * @returns {number}
 */
const calculateNetPayment = (amountReceived, transactionFee = 0) => {
  return Math.max(0, (Number(amountReceived) || 0) - (Number(transactionFee) || 0));
};

/**
 * Calculates subtotal, discount amount, and grand total for an Order.
 * @param {number} subtotal
 * @param {number} discount
 * @param {string} discountType
 * @param {number} transportCharge
 * @param {number} deliveryCharge
 * @returns {object} { subtotal, discountAmount, grandTotal }
 */
const calculateOrderTotals = (subtotal, discount, discountType = "Flat", transportCharge = 0, deliveryCharge = 0) => {
  const numSubtotal = Number(subtotal) || 0;
  const discountAmount = calculateDiscount(numSubtotal, discount, discountType);
  const grandTotal = numSubtotal - discountAmount + (Number(transportCharge) || 0) + (Number(deliveryCharge) || 0);
  return {
    subtotal: numSubtotal,
    discountAmount,
    grandTotal: Math.max(0, grandTotal),
  };
};

/**
 * Calculates subtotal, discount amount, and grand total for an Invoice.
 * @param {number} subtotal
 * @param {number} discount
 * @param {string} discountType
 * @param {number} transportCharge
 * @param {number} deliveryCharge
 * @param {number} taxAmount
 * @returns {object} { subtotal, discountAmount, grandTotal }
 */
const calculateInvoiceTotals = (subtotal, discount, discountType = "Flat", transportCharge = 0, deliveryCharge = 0, taxAmount = 0) => {
  const numSubtotal = Number(subtotal) || 0;
  const discountAmount = calculateDiscount(numSubtotal, discount, discountType);
  const grandTotal =
    numSubtotal -
    discountAmount +
    (Number(transportCharge) || 0) +
    (Number(deliveryCharge) || 0) +
    (Number(taxAmount) || 0);
  return {
    subtotal: numSubtotal,
    discountAmount,
    grandTotal: Math.max(0, grandTotal),
  };
};

module.exports = {
  calculateDiscount,
  calculateTax,
  calculateOutstanding,
  calculateNetPayment,
  calculateOrderTotals,
  calculateInvoiceTotals,
};
