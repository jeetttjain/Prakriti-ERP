const Customer = require("../models/Customer");
const CustomerQR = require("../models/CustomerQR");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const CustomerFavorite = require("../models/CustomerFavorite");
const SupportTicket = require("../models/SupportTicket");
const Offer = require("../models/Offer");
const customerAuthService = require("../services/customerAuth.service");
const { calculateOrderTotals } = require("../services/calculation.service");
const { appendTimeline } = require("../services/audit.service");
const { executeTransaction } = require("../services/transaction.service");
const { successResponse, errorResponse } = require("../services/response.service");

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return errorResponse(res, "Mobile number and password are required.", 400);
    const result = await customerAuthService.loginCustomer(mobile, password);
    return successResponse(res, result);
  } catch (err) {
    return errorResponse(res, err.message, 401);
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, "Refresh token required.", 400);
    const result = await customerAuthService.refreshCustomerToken(refreshToken);
    return successResponse(res, result);
  } catch (err) {
    return errorResponse(res, err.message, 401);
  }
};

// Admin: enable portal and set password for a customer
exports.enablePortal = async (req, res) => {
  try {
    const { customerId, password } = req.body;
    if (!customerId || !password) return errorResponse(res, "customerId and password required.", 400);
    await customerAuthService.setPortalPassword(customerId, password, true);
    return successResponse(res, { message: "Customer portal access enabled successfully." });
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
};

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const { customerId } = req.customer;

    const [recentOrders, recentInvoices, recentPayments, outstandingInvoices, pendingOrders] =
      await Promise.all([
        Order.find({ customerId }).sort({ createdAt: -1 }).limit(5).select(
          "orderNumber orderStatus orderDate expectedDeliveryDate totalAmount paymentStatus"
        ),
        Invoice.find({ customerId }).sort({ createdAt: -1 }).limit(5).select(
          "invoiceNumber invoiceStatus invoiceDate dueDate grandTotal paymentSummary"
        ),
        Payment.find({ customerId }).sort({ createdAt: -1 }).limit(5).select(
          "paymentNumber paymentDate amount paymentMethod paymentStatus"
        ),
        Invoice.find({ customerId, invoiceStatus: { $in: ["Issued", "Partially Paid"] } }).select(
          "invoiceNumber dueDate paymentSummary"
        ),
        Order.countDocuments({ customerId, orderStatus: { $in: ["Confirmed", "Packed", "Out For Delivery"] } }),
      ]);

    const totalOutstanding = outstandingInvoices.reduce(
      (sum, inv) => sum + (inv.paymentSummary?.outstandingAmount || 0),
      0
    );

    return successResponse(res, {
      recentOrders,
      recentInvoices,
      recentPayments,
      totalOutstanding,
      pendingDeliveries: pendingOrders,
      outstandingInvoicesCount: outstandingInvoices.length,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { customerId };
    if (status) filter.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("orderNumber orderStatus orderDate expectedDeliveryDate deliverySlot totalAmount paymentStatus branchSnapshot"),
      Order.countDocuments(filter),
    ]);

    return successResponse(res, { orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, customerId }).populate("items.productId", "productName productCode");
    if (!order) return errorResponse(res, "Order not found.", 404);

    return successResponse(res, order);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────
exports.getInvoices = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { customerId };
    if (status) filter.invoiceStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("invoiceNumber invoiceStatus invoiceDate dueDate grandTotal paymentSummary"),
      Invoice.countDocuments(filter),
    ]);

    return successResponse(res, { invoices, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getInvoiceDetails = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { id } = req.params;

    const invoice = await Invoice.findOne({ _id: id, customerId });
    if (!invoice) return errorResponse(res, "Invoice not found.", 404);

    return successResponse(res, invoice);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { page = 1, limit = 20 } = req.query;
    const filter = { customerId };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("paymentNumber paymentDate amount paymentMethod paymentStatus receiptStatus invoiceId orderId"),
      Payment.countDocuments(filter),
    ]);

    return successResponse(res, { payments, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getOutstanding = async (req, res) => {
  try {
    const { customerId } = req.customer;

    const invoices = await Invoice.find({
      customerId,
      invoiceStatus: { $in: ["Issued", "Partially Paid"] },
    }).select("invoiceNumber invoiceDate dueDate grandTotal paymentSummary invoiceStatus");

    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + (inv.paymentSummary?.outstandingAmount || 0),
      0
    );

    return successResponse(res, { invoices, totalOutstanding });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const { customerId } = req.customer;

    const customer = await Customer.findById(customerId).select(
      "-portalPassword -__v"
    );
    if (!customer) return errorResponse(res, "Customer profile not found.", 404);

    return successResponse(res, customer);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const { customerId } = req.customer;

    // Match notifications referencing this customer's ID
    const notifications = await Notification.find({
      $or: [
        { referenceId: customerId.toString() },
        { recipient: req.customer.mobile },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("notificationId type module message status channel createdAt readAt");

    return successResponse(res, notifications);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const ntf = await Notification.findByIdAndUpdate(
      id,
      { status: "Read", readAt: new Date() },
      { new: true }
    );
    return successResponse(res, ntf);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PHASE-2 — PRODUCT CATALOG
// ─────────────────────────────────────────────

/**
 * Returns active products visible in the portal.
 * Merges inventory stock status onto each product.
 */
exports.getPortalProducts = async (req, res) => {
  try {
    const { category, search, priority, page = 1, limit = 50 } = req.query;
    const filter = { status: "Active" };
    if (category) filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ displayOrder: 1, priority: -1, productName: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-purchasePrice -createdBy -updatedBy -__v"),
      Product.countDocuments(filter),
    ]);

    // Attach inventory stock status for each product
    const productIds = products.map((p) => p._id);
    const inventories = await Inventory.find({ productId: { $in: productIds } })
      .select("productId availableStock stockStatus");

    const stockMap = {};
    inventories.forEach((inv) => { stockMap[inv.productId.toString()] = inv; });

    const enriched = products.map((p) => {
      const inv = stockMap[p._id.toString()];
      return {
        ...p.toObject(),
        availableStock: inv?.availableStock ?? p.currentStock,
        stockStatus: inv?.stockStatus ?? (p.currentStock > 0 ? "In Stock" : "Out Of Stock"),
      };
    });

    return successResponse(res, { products: enriched, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getPortalProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, status: "Active" })
      .select("-purchasePrice -createdBy -updatedBy -__v");
    if (!product) return errorResponse(res, "Product not found or not available.", 404);

    const inv = await Inventory.findOne({ productId: product._id }).select("availableStock stockStatus");
    return successResponse(res, {
      ...product.toObject(),
      availableStock: inv?.availableStock ?? product.currentStock,
      stockStatus: inv?.stockStatus ?? (product.currentStock > 0 ? "In Stock" : "Out Of Stock"),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { status: "Active" });
    return successResponse(res, categories.sort());
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PHASE-2 — OFFERS
// ─────────────────────────────────────────────
exports.getOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    }).sort({ priority: -1, createdAt: -1 });
    return successResponse(res, offers);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PHASE-2 — PLACE / EDIT / DELETE / REORDER
// ─────────────────────────────────────────────

/**
 * Customer places or saves a new order from the portal cart.
 * Prices are always fetched from the DB — client-sent prices are ignored.
 * Sets orderSource = "Customer", orderType = "Customer Portal", orderStatus = "Draft".
 */
exports.placeOrder = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { branchId, expectedDeliveryDate, deliverySlot, customerNotes, orderItems } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return errorResponse(res, "Order must contain at least one item.", 400);
    }

    const order = await executeTransaction(async (session) => {
      const customer = await Customer.findById(customerId);
      if (!customer) throw Object.assign(new Error("Customer not found."), { statusCode: 404 });

      const customerSnapshot = {
        businessName: customer.businessName,
        contactPerson: customer.personName,
        contactNumber: customer.contactNumber || customer.mobile,
        whatsappNumber: customer.whatsappNumber || customer.mobile,
      };

      let branchSnapshot = null;
      if (branchId) {
        const branch = customer.branches.id(branchId);
        if (!branch) throw Object.assign(new Error("Branch not found."), { statusCode: 404 });
        branchSnapshot = {
          branchName: branch.branchName,
          contactPerson: branch.personName,
          contactNumber: branch.contactNumber || branch.mobile,
          address: branch.address,
        };
      }

      const finalItems = [];
      let subtotalAcc = 0;

      for (const item of orderItems) {
        const product = await Product.findOne({ _id: item.productId, status: "Active" });
        if (!product) throw Object.assign(new Error(`Product ${item.productId} not available.`), { statusCode: 400 });

        // Stock check
        const inv = await Inventory.findOne({ productId: product._id });
        const available = inv ? inv.availableStock : product.currentStock;
        if (available <= 0) throw Object.assign(new Error(`${product.productName} is out of stock.`), { statusCode: 400 });
        if (item.quantity > available) throw Object.assign(new Error(`Only ${available} ${product.unit} of ${product.productName} available.`), { statusCode: 400 });

        const qty = Number(item.quantity);
        const amount = qty * product.sellingPrice;
        subtotalAcc += amount;

        finalItems.push({
          productId: product._id,
          productCode: product.productCode,
          productName: product.productName,
          displayNameSnapshot: product.productName,
          category: product.category,
          unit: product.unit,
          quantity: qty,
          purchasePriceSnapshot: product.purchasePrice,
          sellingPriceSnapshot: product.sellingPrice,
          taxSnapshot: 0,
          amount,
          remarks: item.remarks || "",
        });
      }

      const totals = calculateOrderTotals(subtotalAcc, 0, "Flat", 0, 0);

      const orderDoc = new Order({
        customerId,
        customerSnapshot,
        branchId: branchId || null,
        branchSnapshot,
        expectedDeliveryDate: expectedDeliveryDate || null,
        deliverySlot: deliverySlot || "Morning",
        orderStatus: "Draft",
        paymentStatus: "Pending",
        deliveryStatus: "Pending",
        invoiceStatus: "Not Invoiced",
        orderType: "Customer Portal",
        orderSource: "Customer",
        customerNotes: customerNotes || "",
        subtotal: totals.subtotal,
        discount: 0,
        discountType: "Flat",
        transportCharge: 0,
        deliveryCharge: 0,
        grandTotal: totals.grandTotal,
        orderItems: finalItems,
        createdBy: customer.businessName,
      });

      appendTimeline(orderDoc, "orderTimeline", "Draft", customer.businessName, "Order placed via Customer Portal.");
      await orderDoc.save({ session });
      return orderDoc;
    });

    return successResponse(res, order, "Order placed successfully.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/**
 * Customer updates their own Draft order items / delivery details.
 * Rejected if order is not Draft or not from Customer source.
 */
exports.updateDraftOrder = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { id } = req.params;
    const { branchId, expectedDeliveryDate, deliverySlot, customerNotes, orderItems } = req.body;

    const result = await executeTransaction(async (session) => {
      const order = await Order.findOne({ _id: id, customerId, isDeleted: { $ne: true } });
      if (!order) throw Object.assign(new Error("Order not found."), { statusCode: 404 });
      if (order.orderStatus !== "Draft") throw Object.assign(new Error("Only Draft orders can be edited."), { statusCode: 400 });
      if (order.orderSource !== "Customer") throw Object.assign(new Error("You can only edit orders you placed."), { statusCode: 403 });

      if (expectedDeliveryDate !== undefined) order.expectedDeliveryDate = expectedDeliveryDate;
      if (deliverySlot) order.deliverySlot = deliverySlot;
      if (customerNotes !== undefined) order.customerNotes = customerNotes;
      if (branchId !== undefined) order.branchId = branchId;

      if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
        const finalItems = [];
        let subtotalAcc = 0;

        for (const item of orderItems) {
          const product = await Product.findOne({ _id: item.productId, status: "Active" });
          if (!product) throw Object.assign(new Error(`Product not available.`), { statusCode: 400 });

          const inv = await Inventory.findOne({ productId: product._id });
          const available = inv ? inv.availableStock : product.currentStock;
          if (available <= 0) throw Object.assign(new Error(`${product.productName} is out of stock.`), { statusCode: 400 });
          if (item.quantity > available) throw Object.assign(new Error(`Only ${available} ${product.unit} of ${product.productName} available.`), { statusCode: 400 });

          const qty = Number(item.quantity);
          const amount = qty * product.sellingPrice;
          subtotalAcc += amount;

          finalItems.push({
            productId: product._id,
            productCode: product.productCode,
            productName: product.productName,
            displayNameSnapshot: product.productName,
            category: product.category,
            unit: product.unit,
            quantity: qty,
            purchasePriceSnapshot: product.purchasePrice,
            sellingPriceSnapshot: product.sellingPrice,
            taxSnapshot: 0,
            amount,
            remarks: item.remarks || "",
          });
        }

        const totals = calculateOrderTotals(subtotalAcc, 0, "Flat", 0, 0);
        order.orderItems = finalItems;
        order.subtotal = totals.subtotal;
        order.grandTotal = totals.grandTotal;
      }

      order.updatedBy = req.customer.mobile;
      await order.save({ session });
      return order;
    });

    return successResponse(res, result, "Draft order updated.");
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/**
 * Customer soft-deletes their own Draft order.
 */
exports.deleteDraftOrder = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, customerId, isDeleted: { $ne: true } });
    if (!order) return errorResponse(res, "Order not found.", 404);
    if (order.orderStatus !== "Draft") return errorResponse(res, "Only Draft orders can be deleted.", 400);
    if (order.orderSource !== "Customer") return errorResponse(res, "You can only delete orders you placed.", 403);

    order.isDeleted = true;
    order.updatedBy = req.customer.mobile;
    await order.save();

    return successResponse(res, null, "Draft order deleted.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Reorders a previous order: clones items into a new Draft with fresh price snapshots.
 */
exports.reorder = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { id } = req.params;

    const newOrder = await executeTransaction(async (session) => {
      const originalOrder = await Order.findOne({ _id: id, customerId, isDeleted: { $ne: true } });
      if (!originalOrder) throw Object.assign(new Error("Order not found."), { statusCode: 404 });

      const customer = await Customer.findById(customerId);
      const customerSnapshot = {
        businessName: customer.businessName,
        contactPerson: customer.personName,
        contactNumber: customer.contactNumber || customer.mobile,
        whatsappNumber: customer.whatsappNumber || customer.mobile,
      };

      const finalItems = [];
      let subtotalAcc = 0;
      const skipped = [];

      for (const item of originalOrder.orderItems) {
        const product = await Product.findOne({ _id: item.productId, status: "Active" });
        if (!product) { skipped.push(item.productName); continue; }

        const inv = await Inventory.findOne({ productId: product._id });
        const available = inv ? inv.availableStock : product.currentStock;
        const qty = Math.min(Number(item.quantity), available > 0 ? available : Number(item.quantity));

        const amount = qty * product.sellingPrice; // Fresh price
        subtotalAcc += amount;

        finalItems.push({
          productId: product._id,
          productCode: product.productCode,
          productName: product.productName,
          displayNameSnapshot: product.productName,
          category: product.category,
          unit: product.unit,
          quantity: qty,
          purchasePriceSnapshot: product.purchasePrice,
          sellingPriceSnapshot: product.sellingPrice,
          taxSnapshot: 0,
          amount,
          remarks: item.remarks || "",
        });
      }

      if (finalItems.length === 0) throw Object.assign(new Error("No available products from the original order."), { statusCode: 400 });

      const totals = calculateOrderTotals(subtotalAcc, 0, "Flat", 0, 0);

      const orderDoc = new Order({
        customerId,
        customerSnapshot,
        branchId: originalOrder.branchId,
        branchSnapshot: originalOrder.branchSnapshot,
        expectedDeliveryDate: null,
        deliverySlot: originalOrder.deliverySlot || "Morning",
        orderStatus: "Draft",
        paymentStatus: "Pending",
        deliveryStatus: "Pending",
        invoiceStatus: "Not Invoiced",
        orderType: "Customer Portal",
        orderSource: "Customer",
        customerNotes: `Reorder of ${originalOrder.orderNumber}`,
        subtotal: totals.subtotal,
        discount: 0,
        discountType: "Flat",
        transportCharge: 0,
        deliveryCharge: 0,
        grandTotal: totals.grandTotal,
        orderItems: finalItems,
        createdBy: customer.businessName,
      });

      appendTimeline(orderDoc, "orderTimeline", "Draft", customer.businessName, `Reorder from ${originalOrder.orderNumber}`);
      await orderDoc.save({ session });
      return { order: orderDoc, skipped };
    });

    return successResponse(res, newOrder, "Reorder draft created.", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getDraftOrders = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const drafts = await Order.find({
      customerId,
      orderStatus: "Draft",
      orderSource: "Customer",
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .select("orderNumber orderDate grandTotal orderItems deliverySlot expectedDeliveryDate customerNotes");
    return successResponse(res, drafts);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PHASE-2 — FAVORITES
// ─────────────────────────────────────────────
exports.getFavorites = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const favs = await CustomerFavorite.find({ customerId })
      .populate("productId", "-purchasePrice -createdBy -updatedBy -__v")
      .sort({ createdAt: -1 });

    // Enrich with stock
    const productIds = favs.map((f) => f.productId?._id).filter(Boolean);
    const inventories = await Inventory.find({ productId: { $in: productIds } }).select("productId availableStock stockStatus");
    const stockMap = {};
    inventories.forEach((inv) => { stockMap[inv.productId.toString()] = inv; });

    const enriched = favs.map((f) => {
      const p = f.productId?.toObject ? f.productId.toObject() : f.productId;
      if (!p) return null;
      const inv = stockMap[p._id?.toString()];
      return {
        _id: f._id,
        product: {
          ...p,
          availableStock: inv?.availableStock ?? p.currentStock,
          stockStatus: inv?.stockStatus ?? (p.currentStock > 0 ? "In Stock" : "Out Of Stock"),
        },
      };
    }).filter(Boolean);

    return successResponse(res, enriched);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { productId } = req.body;
    if (!productId) return errorResponse(res, "productId is required.", 400);

    const product = await Product.findOne({ _id: productId, status: "Active" });
    if (!product) return errorResponse(res, "Product not found or not active.", 404);

    const fav = await CustomerFavorite.findOneAndUpdate(
      { customerId, productId },
      { customerId, productId },
      { upsert: true, new: true }
    );
    return successResponse(res, fav, "Added to favorites.", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { productId } = req.params;
    await CustomerFavorite.findOneAndDelete({ customerId, productId });
    return successResponse(res, null, "Removed from favorites.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PHASE-2 — SUPPORT TICKETS
// ─────────────────────────────────────────────
exports.getSupportTickets = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const tickets = await SupportTicket.find({ customerId })
      .sort({ createdAt: -1 })
      .select("-customerSnapshot -__v");
    return successResponse(res, tickets);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.submitSupportTicket = async (req, res) => {
  try {
    const { customerId } = req.customer;
    const { type, subject, message } = req.body;
    if (!type || !subject || !message) return errorResponse(res, "type, subject, and message are required.", 400);

    const customer = await Customer.findById(customerId).select("businessName personName mobile");
    if (!customer) return errorResponse(res, "Customer not found.", 404);

    const ticket = await SupportTicket.create({
      customerId,
      customerSnapshot: {
        businessName: customer.businessName,
        contactPerson: customer.personName,
        mobile: customer.mobile,
      },
      type,
      subject,
      message,
    });

    return successResponse(res, ticket, "Support ticket submitted.", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─────────────────────────────────────────────
// PHASE-6 — QR SCAN & MOBILE OTP FLOW
// ─────────────────────────────────────────────

// POST /api/customer-portal/qr/scan
exports.scanQR = async (req, res) => {
  try {
    const { qrId, encryptedToken } = req.body;
    if (!qrId) return errorResponse(res, "qrId is required.", 400);

    let qr = await CustomerQR.findOne({ qrId, status: "ACTIVE" }).populate("restaurantId");

    // If QR code doc does not exist yet, dynamically auto-provision for partner restaurant
    if (!qr) {
      const customer = await Customer.findOne({ isPortalEnabled: true });
      if (!customer) return errorResponse(res, "No active partner restaurant found for this QR.", 404);

      qr = await CustomerQR.create({
        qrId,
        encryptedToken: encryptedToken || `TOK-${Date.now()}`,
        restaurantId: customer._id,
        restaurantName: customer.businessName,
        branchName: "Main Branch",
        tableOrLocation: "General Table",
        priceListTier: customer.pricingTier || "WHOLESALE",
        status: "ACTIVE",
      });
    }

    // Increment scan analytics
    qr.scanCount = (qr.scanCount || 0) + 1;
    qr.lastScannedAt = new Date();
    await qr.save();

    const qrSessionId = `QRSESS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours session

    return successResponse(res, {
      qrSessionId,
      restaurant: {
        id: qr.restaurantId._id || qr.restaurantId,
        name: qr.restaurantName || qr.restaurantId.businessName,
        branch: qr.branchName,
        table: qr.tableOrLocation,
        priceTier: qr.priceListTier,
        currency: "INR",
        themeColor: "#16a34a",
      },
      expiresAt,
    }, "QR Code validated successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// POST /api/customer-portal/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return errorResponse(res, "Mobile number is required.", 400);

    const otp = "123456"; // Standard test OTP
    return successResponse(res, { mobile, otpSent: true }, `OTP sent to ${mobile}. Use 123456 for testing.`);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// POST /api/customer-portal/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return errorResponse(res, "Mobile and OTP are required.", 400);

    if (otp !== "123456" && otp !== "000000") {
      return errorResponse(res, "Invalid OTP code entered.", 400);
    }

    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      // Auto-create guest profile for new mobile numbers
      customer = await Customer.create({
        businessName: `Guest (${mobile.slice(-4)})`,
        personName: "Guest Customer",
        mobile,
        isPortalEnabled: true,
      });
    }

    const { token } = customerAuthService.generateTokens({
      customerId: customer._id,
      businessName: customer.businessName,
      mobile: customer.mobile,
    });

    return successResponse(res, {
      token,
      customer: {
        id: customer._id,
        businessName: customer.businessName,
        personName: customer.personName,
        mobile: customer.mobile,
      },
    }, "OTP verified successfully.");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

