const { body } = require("express-validator");

const createOrderValidation = [
  body("customerId")
    .trim()
    .notEmpty()
    .withMessage("Customer ID is required.")
    .isMongoId()
    .withMessage("Invalid Customer ID format."),

  body("branchId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid Branch ID format."),

  body("expectedDeliveryDate")
    .notEmpty()
    .withMessage("Expected delivery date is required.")
    .isISO8601()
    .withMessage("Expected delivery date must be a valid ISO 8601 date."),

  body("deliverySlot")
    .optional()
    .isIn(["Morning", "Afternoon", "Evening"])
    .withMessage("Delivery slot must be Morning, Afternoon, or Evening."),

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

  body("orderItems")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one product item."),

  body("orderItems.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each item.")
    .isMongoId()
    .withMessage("Invalid Product ID format."),

  body("orderItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each item.")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be greater than 0."),

  body("orderItems.*.remarks")
    .optional()
    .trim(),

  body("orderStatus")
    .optional()
    .isIn(["Draft", "Confirmed", "Packed", "Out For Delivery", "Delivered", "Cancelled"])
    .withMessage("Invalid order status value."),

  body("paymentStatus")
    .optional()
    .isIn(["Pending", "Partial", "Paid"])
    .withMessage("Invalid payment status value."),

  body("deliveryStatus")
    .optional()
    .isIn(["Pending", "Packed", "Out For Delivery", "Delivered", "Cancelled"])
    .withMessage("Invalid delivery status value."),

  body("orderType")
    .optional()
    .isIn(["Manual", "Customer Portal", "WhatsApp", "AI Voice Call", "API"])
    .withMessage("Invalid order type value."),

  body("orderSource")
    .optional()
    .isIn(["Admin", "Customer", "Automation", "AI", "Sales Executive"])
    .withMessage("Invalid order source value."),

  body("customerNotes")
    .optional()
    .trim(),

  body("adminNotes")
    .optional()
    .trim(),
];

module.exports = {
  createOrderValidation,
};
