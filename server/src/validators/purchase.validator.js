const { body } = require("express-validator");

const purchaseValidation = [
  body("supplierId")
    .isMongoId()
    .withMessage("Please select a valid supplier."),
  body("expectedDelivery")
    .notEmpty()
    .withMessage("Expected delivery date is required.")
    .isISO8601()
    .withMessage("Expected delivery must be a valid date format."),
  body("purchaseType")
    .optional()
    .isIn(["Regular", "Emergency", "Return", "Direct Farm", "Internal Transfer"])
    .withMessage("Invalid purchase type classification."),
  body("purchaseItems")
    .isArray({ min: 1 })
    .withMessage("At least one purchase item is required."),
  body("purchaseItems.*.productId")
    .isMongoId()
    .withMessage("Each item must have a valid product ID."),
  body("purchaseItems.*.quantity")
    .isFloat({ gt: 0 })
    .withMessage("Purchase item quantity must be greater than zero."),
  body("purchaseItems.*.purchasePrice")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be positive and non-negative."),
  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount must be positive and non-negative."),
  body("transport")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Transport charge must be positive and non-negative."),
];

module.exports = { purchaseValidation };
