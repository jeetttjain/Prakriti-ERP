const { body } = require("express-validator");

const createInvoiceValidation = [
  body("orderId")
    .trim()
    .notEmpty()
    .withMessage("Order ID is required.")
    .isMongoId()
    .withMessage("Invalid Order ID format."),

  body("customerId")
    .trim()
    .notEmpty()
    .withMessage("Customer ID is required.")
    .isMongoId()
    .withMessage("Invalid Customer ID format."),

  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required.")
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date."),

  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount cannot be negative."),

  body("discountType")
    .optional()
    .isIn(["Flat", "Percentage"])
    .withMessage("Discount type must be Flat or Percentage."),

  body("transportCharge")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Transport charge cannot be negative."),

  body("deliveryCharge")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Delivery charge cannot be negative."),

  body("taxAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax amount cannot be negative."),

  body("invoiceItems")
    .isArray({ min: 1 })
    .withMessage("Invoice must contain at least one product item."),

  body("invoiceItems.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each item.")
    .isMongoId()
    .withMessage("Invalid Product ID format."),

  body("invoiceItems.*.orderItemId")
    .notEmpty()
    .withMessage("Order item reference ID is required for each item.")
    .isMongoId()
    .withMessage("Invalid Order Item ID format."),

  body("invoiceItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each item.")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be greater than 0."),

  body("invoiceType")
    .optional()
    .isIn(["Sale", "Credit Note", "Debit Note", "Proforma", "Estimate"])
    .withMessage("Invalid invoice type."),

  body("invoiceSource")
    .optional()
    .isIn(["Order", "Manual", "API", "Automation"])
    .withMessage("Invalid invoice source."),

  body("invoiceStatus")
    .optional()
    .isIn(["Draft", "Issued", "Partially Paid", "Paid", "Cancelled"])
    .withMessage("Invalid invoice status value."),

  body("paymentStatus")
    .optional()
    .isIn(["Pending", "Partial", "Paid"])
    .withMessage("Invalid payment status value."),

  body("currency")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Currency code cannot be empty."),

  body("exchangeRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Exchange rate cannot be negative."),

  body("notes")
    .optional()
    .trim(),
];

module.exports = {
  createInvoiceValidation,
};
