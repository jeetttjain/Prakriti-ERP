const { body } = require("express-validator");

const supplierValidation = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required."),
  body("personName")
    .trim()
    .notEmpty()
    .withMessage("Contact person name is required."),
  body("mobile")
    .trim()
    .notEmpty()
    .withMessage("Mobile contact number is required."),
  body("supplierCategory")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Supplier category must be valid."),
  body("supplierRating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Supplier rating must be an integer between 1 and 5."),
];

module.exports = { supplierValidation };
