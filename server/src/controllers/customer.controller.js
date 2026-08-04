const Customer = require("../models/Customer");
const { validationResult } = require("express-validator");
const { validateCustomer } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { getPagination } = require("../services/pagination.service");

// CREATE CUSTOMER
exports.createCustomer = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const {
      businessName,
      personName,
      contactNumber,
      whatsappNumber,
      address,
      paymentCycle,
      creditLimit,
      gstNumber,
      notes,
      hasBranches,
      branches,
    } = req.body;

    // Duplicate Contact Number Check
    const existingCustomer = await Customer.findOne({ contactNumber });
    if (existingCustomer) {
      return errorResponse(res, "Contact number already exists.", 409);
    }

    // Set mobile field for compatibility
    const mobile = contactNumber;

    const customer = await Customer.create({
      businessName,
      personName,
      mobile,
      contactNumber,
      whatsappNumber,
      address,
      paymentCycle,
      creditLimit,
      gstNumber,
      notes,
      hasBranches,
      branches,
    });

    return successResponse(res, customer, "Customer created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET ALL CUSTOMERS
exports.getCustomers = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { businessName: 1 });

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(filter);

    return paginatedResponse(res, customers, page, limit, total, "totalCustomers");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET CUSTOMER BY ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await validateCustomer(req.params.id);
    return successResponse(res, customer);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE CUSTOMER STATUS
exports.updateCustomerStatus = async (req, res) => {
  try {
    const customer = await validateCustomer(req.params.id);

    customer.status = req.body.status;
    await customer.save();

    return successResponse(res, customer, "Customer status updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await validateCustomer(req.params.id);

    // Check duplicate contactNumber
    if (req.body.contactNumber) {
      const existingCustomer = await Customer.findOne({
        contactNumber: req.body.contactNumber,
        _id: { $ne: req.params.id },
      });

      if (existingCustomer) {
        return errorResponse(res, "Contact number already exists.", 409);
      }
      req.body.mobile = req.body.contactNumber;
    }

    Object.assign(customer, req.body);
    await customer.save();

    return successResponse(res, customer, "Customer updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH CUSTOMERS
exports.searchCustomers = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const customers = await Customer.find({
      $or: [
        { businessName: { $regex: keyword, $options: "i" } },
        { personName: { $regex: keyword, $options: "i" } },
        { mobile: { $regex: keyword, $options: "i" } },
        { contactNumber: { $regex: keyword, $options: "i" } },
        { whatsappNumber: { $regex: keyword, $options: "i" } },
      ],
    }).sort({ businessName: 1 });

    return successResponse(res, customers);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};