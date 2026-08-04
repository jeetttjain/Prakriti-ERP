const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

/**
 * Validates customer existence.
 * @param {string} customerId
 * @returns {Promise<object>} Customer document
 */
const validateCustomer = async (customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error("Customer not found.");
    error.statusCode = 404;
    throw error;
  }
  return customer;
};

/**
 * Validates product existence.
 * @param {string} productId
 * @returns {Promise<object>} Product document
 */
const validateProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error(`Product with ID ${productId} not found.`);
    error.statusCode = 404;
    throw error;
  }
  return product;
};

/**
 * Validates order existence.
 * @param {string} orderId
 * @returns {Promise<object>} Order document
 */
const validateOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Associated order not found.");
    error.statusCode = 404;
    throw error;
  }
  return order;
};

/**
 * Validates invoice existence.
 * @param {string} invoiceId
 * @returns {Promise<object>} Invoice document
 */
const validateInvoice = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    const error = new Error("Invoice not found.");
    error.statusCode = 404;
    throw error;
  }
  return invoice;
};

/**
 * Validates payment existence.
 * @param {string} paymentId
 * @returns {Promise<object>} Payment document
 */
const validatePayment = async (paymentId) => {
  const payment = await Payment.findOne({ _id: paymentId, isDeleted: { $ne: true } });
  if (!payment) {
    const error = new Error("Payment record not found.");
    error.statusCode = 404;
    throw error;
  }
  return payment;
};

module.exports = {
  validateCustomer,
  validateProduct,
  validateOrder,
  validateInvoice,
  validatePayment,
};
