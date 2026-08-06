const Customer = require("../models/Customer");
const { validationResult } = require("express-validator");
const { validateCustomer } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { getPagination } = require("../services/pagination.service");
const { normalizePhone, escapeRegex } = require("../utils/phoneUtils");

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

    const normalizedContact = normalizePhone(contactNumber || req.body.phone || req.body.mobile);
    const normalizedWhatsApp = normalizePhone(whatsappNumber || normalizedContact);

    if (!normalizedContact) {
      return errorResponse(res, "Contact phone number is required.", 400);
    }

    // Duplicate Contact Number Check across normalized fields
    const existingCustomer = await Customer.findOne({
      $or: [
        { contactNumber: normalizedContact },
        { mobile: normalizedContact },
        { phone: normalizedContact },
        { whatsappNumber: normalizedContact },
      ],
    });

    if (existingCustomer) {
      return errorResponse(res, "Contact phone number already registered to another customer.", 409);
    }

    const customerCode = `CUST-${Date.now().toString().slice(-4)}`;

    const customer = await Customer.create({
      customerCode,
      companyName: businessName || personName,
      contactName: personName || businessName,
      businessName,
      personName,
      email: req.body.email || `${normalizedContact}@customer.prakriti.org`,
      phone: normalizedContact,
      mobile: normalizedContact,
      contactNumber: normalizedContact,
      whatsappNumber: normalizedWhatsApp,
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

    if (req.body.contactNumber || req.body.phone || req.body.mobile) {
      const normalized = normalizePhone(req.body.contactNumber || req.body.phone || req.body.mobile);
      
      const existingCustomer = await Customer.findOne({
        _id: { $ne: customer._id },
        $or: [
          { contactNumber: normalized },
          { mobile: normalized },
          { phone: normalized },
        ],
      });

      if (existingCustomer) {
        return errorResponse(res, "Contact phone number already registered to another customer.", 409);
      }

      req.body.phone = normalized;
      req.body.mobile = normalized;
      req.body.contactNumber = normalized;
    }

    if (req.body.whatsappNumber) {
      req.body.whatsappNumber = normalizePhone(req.body.whatsappNumber);
    }

    Object.assign(customer, req.body);
    await customer.save();

    return successResponse(res, customer, "Customer updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH CUSTOMERS (SAFE REGEX & PHONE NORMALIZATION SEARCH)
exports.searchCustomers = async (req, res) => {
  try {
    const rawKeyword = req.query.q || "";
    const safeRegexStr = escapeRegex(rawKeyword);
    const normalizedPhoneQuery = normalizePhone(rawKeyword);

    const orConditions = [
      { businessName: { $regex: safeRegexStr, $options: "i" } },
      { companyName: { $regex: safeRegexStr, $options: "i" } },
      { personName: { $regex: safeRegexStr, $options: "i" } },
      { contactName: { $regex: safeRegexStr, $options: "i" } },
      { gstin: { $regex: safeRegexStr, $options: "i" } },
      { gstNumber: { $regex: safeRegexStr, $options: "i" } },
      { customerCode: { $regex: safeRegexStr, $options: "i" } },
    ];

    if (normalizedPhoneQuery) {
      orConditions.push(
        { phone: { $regex: normalizedPhoneQuery } },
        { mobile: { $regex: normalizedPhoneQuery } },
        { contactNumber: { $regex: normalizedPhoneQuery } },
        { whatsappNumber: { $regex: normalizedPhoneQuery } }
      );
    }

    const customers = await Customer.find({ $or: orConditions }).sort({ companyName: 1 });

    return successResponse(res, customers);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};