const { body } = require("express-validator");

const createCustomerValidation = [
  // Populate mobile with contactNumber for backward compatibility
  (req, res, next) => {
    if (req.body.contactNumber) {
      req.body.mobile = req.body.contactNumber;
    }
    if (req.body.branches && Array.isArray(req.body.branches)) {
      req.body.branches.forEach((b) => {
        if (b.contactNumber) {
          b.mobile = b.contactNumber;
        }
      });
    }
    next();
  },

  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required.")
    .isLength({ min: 3 })
    .withMessage("Business name must be at least 3 characters."),

  body("personName")
    .trim()
    .notEmpty()
    .withMessage("Person name is required.")
    .isLength({ min: 2 })
    .withMessage("Person name must be at least 2 characters."),

  body("contactNumber")
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Please enter a valid 10-digit contact number."),

  body("whatsappNumber")
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Please enter a valid 10-digit WhatsApp number."),

  body("mobile")
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Please enter a valid 10-digit mobile number."),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required."),

  body("paymentCycle")
    .optional()
    .isIn([15, 30])
    .withMessage("Payment cycle must be 15 or 30 days."),

  body("creditLimit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Credit limit cannot be negative."),

  body("gstNumber")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),
];

module.exports = {
  createCustomerValidation,
};