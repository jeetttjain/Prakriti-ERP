const express = require("express");

const router = express.Router();

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
  searchCustomers,
} = require("../controllers/customer.controller");
const {
  createCustomerValidation,
} = require("../validators/customer.validator");

router.post("/", createCustomerValidation, createCustomer);

// Search pehle
router.get("/search", searchCustomers);

// Get All
router.get("/", getCustomers);

// Get By Id
router.get("/:id", getCustomerById);

// Update
router.put("/:id", updateCustomer);

// Status
router.patch("/:id/status", updateCustomerStatus);

module.exports = router;