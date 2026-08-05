class GstEngine {
  /**
   * Calculates GST breakdown (Intra-state: CGST + SGST, Inter-state: IGST).
   */
  calculateGst(amount, gstRatePct = 18, isInterState = false) {
    const totalTax = (amount * gstRatePct) / 100;
    if (isInterState) {
      return { cgst: 0, sgst: 0, igst: totalTax, totalTax, totalAmount: amount + totalTax };
    }
    const halfTax = totalTax / 2;
    return { cgst: halfTax, sgst: halfTax, igst: 0, totalTax, totalAmount: amount + totalTax };
  }
}

module.exports = new GstEngine();
