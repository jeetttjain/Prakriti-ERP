const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  searchProducts,
} = require("../controllers/product.controller");

const {
  createProductValidation,
} = require("../validators/product.validator");

router.post("/", createProductValidation, createProduct);

// Search first to avoid collision with ID route
router.get("/search", searchProducts);

// Get All
router.get("/", getProducts);

// Get By Id
router.get("/:id", getProductById);

// Update
router.put("/:id", updateProduct);

// Status update
router.patch("/:id/status", updateProductStatus);

module.exports = router;
