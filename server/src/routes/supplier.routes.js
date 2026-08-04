const express = require("express");
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
} = require("../controllers/supplier.controller");
const { supplierValidation } = require("../validators/supplier.validator");

// Register Supplier
router.post("/", supplierValidation, createSupplier);

// Search Suppliers
router.get("/search", searchSuppliers);

// Get Supplier by ID
router.get("/:id", getSupplierById);

// Update Supplier
router.put("/:id", supplierValidation, updateSupplier);

// Delete Supplier
router.delete("/:id", deleteSupplier);

// Get All Suppliers
router.get("/", getSuppliers);

module.exports = router;
