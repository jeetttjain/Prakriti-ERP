const { body } = require("express-validator");

const createPaymentValidation = [
  body("invoiceId")
    .trim()
    .notEmpty()
    .withMessage("Invoice ID is required.")
    .isMongoId()
    .withMessage("Invalid Invoice ID format."),

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

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required.")
    .isIn(["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Wallet"])
    .withMessage("Invalid payment method."),

  body("amountReceived")
    .notEmpty()
    .withMessage("Amount received is required.")
    .isFloat({ gt: 0 })
    .withMessage("Amount received must be greater than zero."),

  body("transactionFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Transaction fee cannot be negative."),

  body("paymentType")
    .notEmpty()
    .withMessage("Payment type is required.")
    .isIn(["Full Payment", "Partial Payment", "Advance", "Adjustment", "Refund"])
    .withMessage("Invalid payment type."),

  body("paymentStatus")
    .optional()
    .isIn(["Pending", "Completed", "Failed", "Cancelled", "Refunded"])
    .withMessage("Invalid payment status."),

  body("paymentSource")
    .optional()
    .isIn(["Admin", "Customer Portal", "API", "Automation", "Bank Import"])
    .withMessage("Invalid payment source."),

  body("reconciliationStatus")
    .optional()
    .isIn(["Pending", "Matched", "Mismatch"])
    .withMessage("Invalid reconciliation status."),

  body("paymentReference")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),
];

module.exports = {
  createPaymentValidation,
};
