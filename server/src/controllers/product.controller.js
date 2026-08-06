const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const { validateProduct } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { getPagination } = require("../services/pagination.service");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const {
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      currentStock,
      minimumStock,
      displayOrder,
      priority,
      status,
      notes,
      createdBy,
    } = req.body;

    // Case-insensitive duplicate check on productName
    const { escapeRegex } = require("../utils/phoneUtils");
    const existingProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${escapeRegex(productName.trim())}$`, "i") },
    });

    if (existingProduct) {
      return errorResponse(res, "Product name already exists.", 409);
    }

    const product = await Product.create({
      productName,
      category,
      unit,
      purchasePrice,
      sellingPrice,
      currentStock,
      minimumStock,
      displayOrder,
      priority,
      status,
      notes,
      createdBy,
    });

    return successResponse(res, product, "Product created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET PRODUCTS (PAGINATED & FILTERED)
exports.getProducts = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { productName: 1 });

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return paginatedResponse(res, products, page, limit, total, "totalProducts");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const product = await validateProduct(req.params.id);
    return successResponse(res, product);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE PRODUCT STATUS
exports.updateProductStatus = async (req, res) => {
  try {
    const product = await validateProduct(req.params.id);

    product.status = req.body.status;
    await product.save();

    return successResponse(res, product, "Product status updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await validateProduct(req.params.id);

    // Uniqueness checks
    if (req.body.productName) {
      const existingProduct = await Product.findOne({
        productName: { $regex: new RegExp(`^${req.body.productName.trim()}$`, "i") },
        _id: { $ne: req.params.id },
      });

      if (existingProduct) {
        return errorResponse(res, "Product name already exists.", 409);
      }
    }

    // Guarantee that slug and productCode remain completely immutable
    delete req.body.slug;
    delete req.body.productCode;

    Object.assign(product, req.body);
    await product.save();

    return successResponse(res, product, "Product updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH PRODUCTS
exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const products = await Product.find({
      $or: [
        { productName: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { unit: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ productName: 1 });

    return successResponse(res, products);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
