const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { validationResult } = require("express-validator");
const { validateCustomer, validateProduct, validateOrder, validateInvoice } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { calculateInvoiceTotals } = require("../services/calculation.service");
const { appendTimeline } = require("../services/audit.service");
const { syncOrderInvoiceStatus } = require("../services/invoiceSync.service");
const { getPagination } = require("../services/pagination.service");
const { executeTransaction } = require("../services/transaction.service");
const { invalidateReportCaches } = require("../services/cache.service");

// CREATE INVOICE
exports.createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const {
      orderId,
      customerId,
      dueDate,
      invoiceDate,
      invoiceStatus,
      paymentStatus,
      invoiceType,
      invoiceSource,
      currency,
      exchangeRate,
      transportCharge,
      deliveryCharge,
      taxAmount,
      discount,
      discountType,
      notes,
      invoiceItems,
      grandTotal,
      createdBy,
    } = req.body;

    const invoice = await executeTransaction(async (session) => {
      // 1. Verify Customer exists and snapshot details
      const customer = await validateCustomer(customerId);

      const customerSnapshot = {
        businessName: customer.businessName,
        contactPerson: customer.personName,
        contactNumber: customer.contactNumber || customer.mobile,
        whatsappNumber: customer.whatsappNumber || customer.mobile,
      };

      // 2. Verify Order exists
      const order = await validateOrder(orderId);
      const branchSnapshot = order.branchSnapshot; // Re-use from order

      // 3. Calculate sequence number
      const prevInvoicesCount = await Invoice.countDocuments({
        orderId,
        isDeleted: { $ne: true },
      }).session(session);
      const invoiceSequence = prevInvoicesCount + 1;

      // 4. Build items list and recalculate subtotal
      const finalItems = [];
      let computedSubtotal = 0;

      for (const item of invoiceItems) {
        const product = await validateProduct(item.productId);

        const quantity = Number(item.quantity);
        const sellingPriceSnapshot = product.sellingPrice;
        const amount = quantity * sellingPriceSnapshot;
        computedSubtotal += amount;

        finalItems.push({
          productId: item.productId,
          orderItemId: item.orderItemId,
          productCode: product.productCode,
          productName: product.productName,
          displayNameSnapshot: product.productName,
          category: product.category,
          unit: product.unit,
          quantity,
          purchasePriceSnapshot: product.purchasePrice,
          sellingPriceSnapshot,
          taxSnapshot: 0,
          amount,
          remarks: item.remarks || "",
        });
      }

      // 5. Server-side totals validation check
      const totals = calculateInvoiceTotals(
        computedSubtotal,
        discount,
        discountType,
        transportCharge,
        deliveryCharge,
        taxAmount
      );

      if (Math.abs(totals.grandTotal - Number(grandTotal)) > 0.01) {
        const error = new Error(
          `Grand total mismatch. Calculated: ₹${totals.grandTotal.toFixed(2)}, Received: ₹${Number(grandTotal).toFixed(2)}`
        );
        error.statusCode = 400;
        throw error;
      }

      // 6. Setup timeline logs
      const initialStatus = invoiceStatus || "Draft";
      const isLocked = initialStatus === "Issued";

      // 7. Payment status summary setup
      const initialPaymentSummary = {
        paidAmount: 0,
        pendingAmount: totals.grandTotal,
        outstandingAmount: totals.grandTotal,
        lastPaymentDate: null,
        paymentCount: 0,
      };

      const newInvoice = new Invoice({
        invoiceNumber: "PENDING_AUTO", // Replaced in pre-validate hook
        invoiceSequence,
        orderId,
        customerId,
        customerSnapshot,
        branchSnapshot,
        invoiceDate,
        dueDate,
        invoiceStatus: initialStatus,
        paymentStatus,
        invoiceType,
        invoiceSource,
        currency,
        exchangeRate,
        isLocked,
        paymentSummary: initialPaymentSummary,
        subtotal: totals.subtotal,
        discount: Number(discount) || 0,
        discountType: discountType || "Flat",
        transportCharge: Number(transportCharge) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        taxAmount: Number(taxAmount) || 0,
        grandTotal: totals.grandTotal,
        notes,
        invoiceItems: finalItems,
        createdBy,
      });

      appendTimeline(newInvoice, "invoiceTimeline", initialStatus, createdBy, "Invoice registered.");

      await newInvoice.save({ session });

      // 8. Auto sync associated Order status
      await syncOrderInvoiceStatus(orderId, session);

      return newInvoice;
    });

    invalidateReportCaches();
    return successResponse(res, invoice, "Invoice created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET INVOICES (PAGINATED & FILTERED)
exports.getInvoices = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { invoiceDate: -1 });

    const filter = { isDeleted: { $ne: true } };

    if (req.query.status) {
      filter.invoiceStatus = req.query.status;
    }
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.customer) {
      filter.customerId = req.query.customer;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.invoiceDate = {};
      if (req.query.startDate) {
        filter.invoiceDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.invoiceDate.$lte = new Date(req.query.endDate);
      }
    }

    const invoices = await Invoice.find(filter)
      .populate("customerId", "businessName personName contactNumber mobile")
      .populate("orderId", "orderNumber")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(filter);

    return paginatedResponse(res, invoices, page, limit, total, "totalInvoices");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET INVOICE BY ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate("customerId", "businessName personName contactNumber mobile")
      .populate("orderId", "orderNumber");

    if (!invoice) {
      return errorResponse(res, "Invoice not found.", 404);
    }

    return successResponse(res, invoice);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE INVOICE STATUS
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status, paymentStatus, updatedBy, notes } = req.body;

    const result = await executeTransaction(async (session) => {
      const invoice = await validateInvoice(req.params.id);

      // Strict locks validation
      if (invoice.isLocked && status && status !== invoice.invoiceStatus) {
        const error = new Error("This invoice is locked. Status updates are prohibited.");
        error.statusCode = 400;
        throw error;
      }

      if (status && status !== invoice.invoiceStatus) {
        invoice.invoiceStatus = status;
        appendTimeline(invoice, "invoiceTimeline", status, updatedBy, notes);

        if (status === "Issued") {
          invoice.isLocked = true;
        }
      }

      if (paymentStatus) invoice.paymentStatus = paymentStatus;
      if (updatedBy) invoice.updatedBy = updatedBy;

      await invoice.save({ session });

      // Auto sync Order status
      await syncOrderInvoiceStatus(invoice.orderId, session);
      return invoice;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Invoice status updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE INVOICE (LOCK GATES FOR ISSUED EDITS)
exports.updateInvoice = async (req, res) => {
  try {
    const result = await executeTransaction(async (session) => {
      const invoice = await validateInvoice(req.params.id);

      // 1. Strict lockdown rule checks if Issued or locked
      if (invoice.invoiceStatus === "Issued" || invoice.isLocked) {
        const attemptedImmutableEdits = [
          "customerId",
          "orderId",
          "customerSnapshot",
          "branchSnapshot",
          "invoiceItems",
          "subtotal",
          "grandTotal",
          "discount",
          "discountType",
          "transportCharge",
          "deliveryCharge",
          "taxAmount",
        ].some((field) => req.body[field] !== undefined);

        if (attemptedImmutableEdits) {
          const error = new Error("Cannot modify snapshots, items, or totals after an invoice has been Issued.");
          error.statusCode = 400;
          throw error;
        }
      }

      // Block metadata writes
      delete req.body.invoiceNumber;
      delete req.body.invoiceSequence;
      delete req.body.isDeleted;
      delete req.body.invoiceTimeline;

      // If items are modified (and invoice is not locked), rebuild price snapshots
      if (req.body.invoiceItems) {
        const updatedItems = [];
        for (const item of req.body.invoiceItems) {
          const product = await validateProduct(item.productId);
          const qty = Number(item.quantity);
          updatedItems.push({
            productId: item.productId,
            orderItemId: item.orderItemId,
            productCode: product.productCode,
            productName: product.productName,
            displayNameSnapshot: product.productName,
            category: product.category,
            unit: product.unit,
            quantity: qty,
            purchasePriceSnapshot: product.purchasePrice,
            sellingPriceSnapshot: product.sellingPrice,
            taxSnapshot: 0,
            amount: qty * product.sellingPrice,
            remarks: item.remarks || "",
          });
        }
        invoice.invoiceItems = updatedItems;
      }

      // Update body properties
      Object.assign(invoice, req.body);

      // Auto lock if status becomes Issued during updates
      if (req.body.invoiceStatus === "Issued") {
        invoice.isLocked = true;
        appendTimeline(invoice, "invoiceTimeline", "Issued", req.body.updatedBy, "Invoice issued and locked.");
      }

      // Recalculate subtotal and grandTotal
      const computedSubtotal = invoice.invoiceItems.reduce((sum, item) => sum + item.amount, 0);
      const totals = calculateInvoiceTotals(
        computedSubtotal,
        invoice.discount,
        invoice.discountType,
        invoice.transportCharge,
        invoice.deliveryCharge,
        invoice.taxAmount
      );

      invoice.subtotal = totals.subtotal;
      invoice.grandTotal = totals.grandTotal;

      // Increment revision
      invoice.revisionNumber += 1;

      await invoice.save({ session });

      // Auto sync associated Order status
      await syncOrderInvoiceStatus(invoice.orderId, session);
      return invoice;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Invoice updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SOFT DELETE (ARCHIVE) INVOICE
exports.softDeleteInvoice = async (req, res) => {
  try {
    await executeTransaction(async (session) => {
      const invoice = await validateInvoice(req.params.id);

      invoice.isDeleted = true;
      invoice.deletedAt = new Date();
      invoice.deletedBy = req.body.deletedBy || null;
      await invoice.save({ session });

      // Auto sync associated Order status
      await syncOrderInvoiceStatus(invoice.orderId, session);
    });

    invalidateReportCaches();
    return successResponse(res, null, "Invoice archived successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH INVOICES
exports.searchInvoices = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    // 1. Locate matching customer IDs
    const matchingCustomers = await Customer.find({
      $or: [
        { businessName: { $regex: keyword, $options: "i" } },
        { personName: { $regex: keyword, $options: "i" } },
        { contactNumber: { $regex: keyword, $options: "i" } },
        { mobile: { $regex: keyword, $options: "i" } },
      ],
    }).select("_id");

    const customerIds = matchingCustomers.map((c) => c._id);

    // 2. Locate matching order IDs
    const matchingOrders = await Order.find({
      orderNumber: { $regex: keyword, $options: "i" },
    }).select("_id");

    const orderIds = matchingOrders.map((o) => o._id);

    // 3. Build query filters
    const invoiceQuery = {
      isDeleted: { $ne: true },
      $or: [
        { invoiceNumber: { $regex: keyword, $options: "i" } },
        { customerId: { $in: customerIds } },
        { orderId: { $in: orderIds } },
        { "customerSnapshot.businessName": { $regex: keyword, $options: "i" } },
      ],
    };

    // Parse grandTotal float pricing matches
    const numVal = Number(keyword);
    if (!isNaN(numVal) && keyword.trim() !== "") {
      invoiceQuery.$or.push({ grandTotal: numVal });
    }

    // Parse date matches
    const parsedDate = Date.parse(keyword);
    if (!isNaN(parsedDate)) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      invoiceQuery.$or.push({
        invoiceDate: { $gte: startOfDay, $lte: endOfDay },
      });
    }

    const invoices = await Invoice.find(invoiceQuery)
      .populate("customerId", "businessName personName contactNumber mobile")
      .populate("orderId", "orderNumber")
      .sort({ invoiceDate: -1 });

    return successResponse(res, invoices);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
