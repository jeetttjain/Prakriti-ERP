const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const { validationResult } = require("express-validator");
const { validateCustomer, validateInvoice, validatePayment } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { calculateNetPayment } = require("../services/calculation.service");
const { appendTimeline } = require("../services/audit.service");
const { handlePaymentChange } = require("../services/paymentSync.service");
const { getPagination } = require("../services/pagination.service");
const { executeTransaction } = require("../services/transaction.service");
const { invalidateReportCaches } = require("../services/cache.service");

// CREATE PAYMENT
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const {
      invoiceId,
      orderId,
      customerId,
      paymentDate,
      settlementDate,
      paymentMethod,
      paymentSource,
      reconciliationStatus,
      paymentReference,
      amountReceived,
      transactionFee,
      paymentStatus,
      paymentType,
      notes,
      attachments,
      createdBy,
    } = req.body;

    const payment = await executeTransaction(async (session) => {
      // 1. Verify Customer exists
      await validateCustomer(customerId);

      // 2. Verify Invoice exists
      const invoice = await validateInvoice(invoiceId);

      // 3. Validate amount against outstanding balance
      const paidAmountSoFar = invoice.paymentSummary?.paidAmount || 0;
      const outstanding = Math.max(0, invoice.grandTotal - paidAmountSoFar);
      const numAmount = Number(amountReceived);

      if (numAmount > outstanding + 0.01) {
        const error = new Error(
          `Payment amount ₹${numAmount.toFixed(2)} exceeds outstanding invoice balance of ₹${outstanding.toFixed(2)}.`
        );
        error.statusCode = 400;
        throw error;
      }

      // 4. Calculate netReceived
      const netReceived = calculateNetPayment(numAmount, transactionFee);

      // 5. Setup initial timeline
      const initialStatus = paymentStatus || "Completed";

      const newPayment = new Payment({
        paymentNumber: "PENDING_AUTO",
        receiptNumber: "PENDING_AUTO",
        invoiceId,
        orderId,
        customerId,
        paymentDate,
        settlementDate,
        paymentMethod,
        paymentSource,
        reconciliationStatus,
        paymentReference,
        amountReceived: numAmount,
        transactionFee: Number(transactionFee) || 0,
        netReceived,
        paymentStatus: initialStatus,
        paymentType,
        notes,
        attachments: attachments || [],
        createdBy,
      });

      appendTimeline(newPayment, "paymentTimeline", initialStatus, createdBy, "Payment registered.");

      await newPayment.save({ session });

      // 6. Sync associated Invoice
      await handlePaymentChange(invoiceId, session);

      return newPayment;
    });

    invalidateReportCaches();
    return successResponse(res, payment, "Payment created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET PAYMENTS (PAGINATED & FILTERED)
exports.getPayments = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { paymentDate: -1 });

    const filter = { isDeleted: { $ne: true } };

    if (req.query.status) {
      filter.paymentStatus = req.query.status;
    }
    if (req.query.method) {
      filter.paymentMethod = req.query.method;
    }
    if (req.query.type) {
      filter.paymentType = req.query.type;
    }
    if (req.query.customer) {
      filter.customerId = req.query.customer;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.paymentDate = {};
      if (req.query.startDate) {
        filter.paymentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.paymentDate.$lte = new Date(req.query.endDate);
      }
    }

    const payments = await Payment.find(filter)
      .populate("customerId", "businessName personName contactNumber mobile")
      .populate("invoiceId", "invoiceNumber")
      .populate("orderId", "orderNumber")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    return paginatedResponse(res, payments, page, limit, total, "totalPayments");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET PAYMENT BY ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate("customerId", "businessName personName contactNumber mobile")
      .populate("invoiceId", "invoiceNumber")
      .populate("orderId", "orderNumber");

    if (!payment) {
      return errorResponse(res, "Payment record not found.", 404);
    }

    return successResponse(res, payment);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, updatedBy, notes } = req.body;

    const result = await executeTransaction(async (session) => {
      const payment = await validatePayment(req.params.id);

      if (status && status !== payment.paymentStatus) {
        payment.paymentStatus = status;
        appendTimeline(payment, "paymentTimeline", status, updatedBy, notes);
      }

      if (updatedBy) payment.updatedBy = updatedBy;

      await payment.save({ session });

      // Auto sync associated Invoice status
      await handlePaymentChange(payment.invoiceId, session);
      return payment;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Payment status updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE PAYMENT (WITH LOCK GATES FOR COMPLETED EDITS)
exports.updatePayment = async (req, res) => {
  try {
    const result = await executeTransaction(async (session) => {
      const payment = await validatePayment(req.params.id);

      // 1. Strict lockdown rule check if Completed
      if (payment.paymentStatus === "Completed") {
        const attemptedImmutableEdits = [
          "invoiceId",
          "orderId",
          "customerId",
          "amountReceived",
          "paymentMethod",
        ].some(
          (field) =>
            req.body[field] !== undefined &&
            req.body[field].toString() !== payment[field].toString()
        );

        if (attemptedImmutableEdits) {
          const error = new Error("Cannot modify references, payment amount, or payment method after a payment is Completed.");
          error.statusCode = 400;
          throw error;
        }
      }

      // Block metadata writes
      delete req.body.paymentNumber;
      delete req.body.receiptNumber;
      delete req.body.isDeleted;
      delete req.body.paymentTimeline;

      // Apply updates
      Object.assign(payment, req.body);

      // Recalculate netReceived
      payment.netReceived = calculateNetPayment(payment.amountReceived, payment.transactionFee);

      // If status changes to Completed, add timeline entry
      if (req.body.paymentStatus === "Completed") {
        appendTimeline(payment, "paymentTimeline", "Completed", req.body.updatedBy, "Payment marked Completed.");
      }

      await payment.save({ session });

      // Auto sync associated Invoice status
      await handlePaymentChange(payment.invoiceId, session);
      return payment;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Payment record updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SOFT DELETE PAYMENT
exports.softDeletePayment = async (req, res) => {
  try {
    await executeTransaction(async (session) => {
      const payment = await validatePayment(req.params.id);

      payment.isDeleted = true;
      payment.deletedAt = new Date();
      payment.deletedBy = req.body.deletedBy || null;
      await payment.save({ session });

      // Auto sync associated Invoice status
      await handlePaymentChange(payment.invoiceId, session);
    });

    invalidateReportCaches();
    return successResponse(res, null, "Payment record archived successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH PAYMENTS
exports.searchPayments = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    // 1. Locate matching customer IDs
    const matchingCustomers = await Customer.find({
      $or: [
        { businessName: { $regex: keyword, $options: "i" } },
        { personName: { $regex: keyword, $options: "i" } },
      ],
    }).select("_id");

    const customerIds = matchingCustomers.map((c) => c._id);

    // 2. Locate matching invoice IDs
    const matchingInvoices = await Invoice.find({
      invoiceNumber: { $regex: keyword, $options: "i" },
    }).select("_id");

    const invoiceIds = matchingInvoices.map((inv) => inv._id);

    // 3. Locate matching order IDs
    const matchingOrders = await Order.find({
      orderNumber: { $regex: keyword, $options: "i" },
    }).select("_id");

    const orderIds = matchingOrders.map((o) => o._id);

    // 4. Build query filters
    const paymentQuery = {
      isDeleted: { $ne: true },
      $or: [
        { paymentNumber: { $regex: keyword, $options: "i" } },
        { receiptNumber: { $regex: keyword, $options: "i" } },
        { paymentReference: { $regex: keyword, $options: "i" } },
        { paymentMethod: { $regex: keyword, $options: "i" } },
        { customerId: { $in: customerIds } },
        { invoiceId: { $in: invoiceIds } },
        { orderId: { $in: orderIds } },
      ],
    };

    // Match amountReceived float match
    const numVal = Number(keyword);
    if (!isNaN(numVal) && keyword.trim() !== "") {
      paymentQuery.$or.push({ amountReceived: numVal });
    }

    // Match date queries
    const parsedDate = Date.parse(keyword);
    if (!isNaN(parsedDate)) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      paymentQuery.$or.push({
        paymentDate: { $gte: startOfDay, $lte: endOfDay },
      });
    }

    const payments = await Payment.find(paymentQuery)
      .populate("customerId", "businessName personName contactNumber mobile")
      .populate("invoiceId", "invoiceNumber")
      .populate("orderId", "orderNumber")
      .sort({ paymentDate: -1 });

    return successResponse(res, payments);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
