const { body } = require("express-validator");

const createOpeningStockValidation = [
  body("productId")
    .isMongoId()
    .withMessage("Please enter a valid product ID."),
  body("currentStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Opening stock level must be positive and non-negative."),
  body("minimumStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum stock level must be positive and non-negative."),
  body("reorderLevel")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Reorder level must be positive and non-negative."),
  body("maximumStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum stock level must be positive and non-negative."),
];

const adjustInventoryValidation = [
  body("productId")
    .isMongoId()
    .withMessage("Please enter a valid product ID."),
  body("newStockValue")
    .isFloat({ min: 0 })
    .withMessage("New stock value must be positive and non-negative."),
];

const reserveInventoryValidation = [
  body("productId")
    .isMongoId()
    .withMessage("Please enter a valid product ID."),
  body("quantity")
    .isFloat({ gt: 0 })
    .withMessage("Reservation quantity must be greater than zero."),
];

const releaseReservationValidation = [
  body("productId")
    .isMongoId()
    .withMessage("Please enter a valid product ID."),
  body("quantity")
    .isFloat({ gt: 0 })
    .withMessage("Release quantity must be greater than zero."),
];

module.exports = {
  createOpeningStockValidation,
  adjustInventoryValidation,
  reserveInventoryValidation,
  releaseReservationValidation,
};
