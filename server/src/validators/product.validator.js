const { body } = require("express-validator");
const { ALLOWED_CATEGORIES, ALLOWED_UNITS } = require("../constants/product.constants");

const createProductValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .isLength({ min: 2 })
    .withMessage("Product name must be at least 2 characters."),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required.")
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(", ")}`),

  body("unit")
    .trim()
    .notEmpty()
    .withMessage("Unit is required.")
    .isIn(ALLOWED_UNITS)
    .withMessage(`Invalid unit. Allowed values: ${ALLOWED_UNITS.join(", ")}`),

  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required.")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be greater than or equal to 0."),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required.")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be greater than or equal to 0."),

  body("currentStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current stock must be greater than or equal to 0."),

  body("minimumStock")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum stock must be greater than or equal to 0."),

  body("displayOrder")
    .optional()
    .isInt()
    .withMessage("Display order must be an integer."),

  body("priority")
    .optional()
    .isIn(["Normal", "Popular", "Featured"])
    .withMessage("Priority must be Normal, Popular, or Featured."),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Archived"])
    .withMessage("Status must be Active, Inactive, or Archived."),

  body("notes")
    .optional()
    .trim(),
];

module.exports = {
  createProductValidation,
};
