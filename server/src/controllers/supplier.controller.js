const Supplier = require("../models/Supplier");
const { validationResult } = require("express-validator");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { getPagination } = require("../services/pagination.service");

// CREATE SUPPLIER
exports.createSupplier = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const supplier = new Supplier(req.body);
    await supplier.save();

    return successResponse(res, supplier, "Supplier created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET SUPPLIERS (PAGINATED & FILTERED)
exports.getSuppliers = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { createdAt: -1 });

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.supplierCategory = req.query.category;
    }

    const suppliers = await Supplier.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Supplier.countDocuments(filter);

    return paginatedResponse(res, suppliers, page, limit, total, "totalSuppliers");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET SUPPLIER BY ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return errorResponse(res, "Supplier not found.", 404);
    }
    return successResponse(res, supplier);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE SUPPLIER
exports.updateSupplier = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    // Prevent code modification
    delete req.body.supplierCode;

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return errorResponse(res, "Supplier not found.", 404);
    }

    return successResponse(res, supplier, "Supplier updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// DELETE SUPPLIER
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return errorResponse(res, "Supplier not found.", 404);
    }
    return successResponse(res, null, "Supplier deleted successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH SUPPLIERS
exports.searchSuppliers = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const filter = {
      $or: [
        { supplierCode: { $regex: keyword, $options: "i" } },
        { businessName: { $regex: keyword, $options: "i" } },
        { personName: { $regex: keyword, $options: "i" } },
        { mobile: { $regex: keyword, $options: "i" } },
      ],
    };

    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 });
    return successResponse(res, suppliers);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
