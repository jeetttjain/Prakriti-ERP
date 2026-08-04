const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { calculateOutstanding } = require("./calculation.service");

/**
 * Updates an Order's invoiceStatus ("Not Invoiced", "Partially Invoiced", "Fully Invoiced")
 * based on quantities invoiced compared to ordered items.
 * @param {string} orderId
 */
const syncOrderInvoiceStatus = async (orderId, session = null) => {
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) return;

    // Find all invoices associated with this order that are not Cancelled or Deleted
    const invoices = await Invoice.find({
      orderId,
      invoiceStatus: { $ne: "Cancelled" },
      isDeleted: { $ne: true },
    }).session(session);

    if (invoices.length === 0) {
      order.invoiceStatus = "Not Invoiced";
      await order.save({ session });
      return;
    }

    // Accumulate quantities ordered
    const orderedQuantities = {};
    order.orderItems.forEach((item) => {
      const prodId = item.productId.toString();
      orderedQuantities[prodId] = (orderedQuantities[prodId] || 0) + item.quantity;
    });

    // Accumulate quantities invoiced
    const invoicedQuantities = {};
    invoices.forEach((inv) => {
      inv.invoiceItems.forEach((item) => {
        const prodId = item.productId.toString();
        invoicedQuantities[prodId] = (invoicedQuantities[prodId] || 0) + item.quantity;
      });
    });

    let allFullyInvoiced = true;
    let someInvoiced = false;

    for (const prodId of Object.keys(orderedQuantities)) {
      const orderedQty = orderedQuantities[prodId];
      const invoicedQty = invoicedQuantities[prodId] || 0;

      if (invoicedQty > 0) {
        someInvoiced = true;
      }
      if (invoicedQty < orderedQty) {
        allFullyInvoiced = false;
      }
    }

    if (allFullyInvoiced) {
      order.invoiceStatus = "Fully Invoiced";
    } else if (someInvoiced) {
      order.invoiceStatus = "Partially Invoiced";
    } else {
      order.invoiceStatus = "Not Invoiced";
    }

    await order.save({ session });
  } catch (err) {
    console.error("Failed to sync order invoice status:", err.message);
  }
};

/**
 * Recalculates an Invoice's paymentSummary, paymentStatus, and invoiceStatus
 * based on all non-failed/non-cancelled payment transactions.
 * @param {string} invoiceId
 */
const syncInvoicePaymentStatus = async (invoiceId, session = null) => {
  try {
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) return;

    // Retrieve all active payments for this invoice
    const activePayments = await Payment.find({
      invoiceId,
      isDeleted: { $ne: true },
    }).session(session);

    let paidAmount = 0;
    let paymentCount = 0;
    let lastPaymentDate = null;
    const paymentIds = [];

    activePayments.forEach((p) => {
      // Ignore Failed or Cancelled payments
      if (p.paymentStatus === "Failed" || p.paymentStatus === "Cancelled") {
        return;
      }

      // Reverse payment summaries during refund
      const isRefund = p.paymentStatus === "Refunded" || p.paymentType === "Refund";

      if (isRefund) {
        paidAmount -= p.amountReceived;
      } else if (p.paymentStatus === "Completed") {
        paidAmount += p.amountReceived;
        paymentCount++;
        paymentIds.push(p._id);
        if (!lastPaymentDate || p.paymentDate > lastPaymentDate) {
          lastPaymentDate = p.paymentDate;
        }
      }
    });

    const outstandingAmount = calculateOutstanding(invoice.grandTotal, paidAmount);
    const pendingAmount = outstandingAmount;

    invoice.paymentSummary = {
      paidAmount,
      pendingAmount,
      outstandingAmount,
      lastPaymentDate,
      paymentCount,
    };
    invoice.paymentIds = paymentIds;

    // Auto sync statuses
    if (paidAmount >= invoice.grandTotal) {
      invoice.paymentStatus = "Paid";
      invoice.invoiceStatus = "Paid";
    } else if (paidAmount > 0) {
      invoice.paymentStatus = "Partial";
      invoice.invoiceStatus = "Partially Paid";
    } else {
      invoice.paymentStatus = "Pending";
      if (invoice.invoiceStatus === "Paid" || invoice.invoiceStatus === "Partially Paid") {
        invoice.invoiceStatus = "Issued";
      }
    }

    await invoice.save({ session });
  } catch (err) {
    console.error("Failed to sync invoice payment status:", err.message);
  }
};

module.exports = {
  syncOrderInvoiceStatus,
  syncInvoicePaymentStatus,
};
