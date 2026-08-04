const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { validationResult } = require("express-validator");
const { validateCustomer, validateProduct, validateOrder } = require("../services/validation.service");
const { successResponse, errorResponse, paginatedResponse } = require("../services/response.service");
const { calculateOrderTotals } = require("../services/calculation.service");
const { appendTimeline } = require("../services/audit.service");
const { getPagination } = require("../services/pagination.service");
const { executeTransaction } = require("../services/transaction.service");
const inventoryService = require("../services/inventory.service");
const { invalidateReportCaches } = require("../services/cache.service");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed.", 400, errors.array());
    }

    const {
      customerId,
      branchId,
      expectedDeliveryDate,
      deliverySlot,
      orderStatus,
      paymentStatus,
      deliveryStatus,
      invoiceStatus,
      orderType,
      orderSource,
      assignedVehicle,
      assignedDriver,
      customerNotes,
      adminNotes,
      discount,
      discountType,
      transportCharge,
      deliveryCharge,
      orderItems,
      createdBy,
    } = req.body;

    const order = await executeTransaction(async (session) => {
      // 1. Verify Customer exists and snapshot details
      const customer = await validateCustomer(customerId);

      const customerSnapshot = {
        businessName: customer.businessName,
        contactPerson: customer.personName,
        contactNumber: customer.contactNumber || customer.mobile,
        whatsappNumber: customer.whatsappNumber || customer.mobile,
      };

      // 2. Verify Branch exists if branchId is provided
      let branchSnapshot = null;
      if (branchId) {
        const branch = customer.branches.id(branchId);
        if (!branch) {
          const error = new Error("Selected customer branch not found.");
          error.statusCode = 404;
          throw error;
        }
        branchSnapshot = {
          branchName: branch.branchName,
          contactPerson: branch.personName,
          contactNumber: branch.contactNumber || branch.mobile,
          address: branch.address,
        };
      }

      // 3. Populate and snapshot orderItems pricing
      const finalOrderItems = [];
      let computedSubtotal = 0;

      for (const item of orderItems) {
        const product = await validateProduct(item.productId);

        const quantity = Number(item.quantity);
        const sellingPriceSnapshot = product.sellingPrice;
        const amount = quantity * sellingPriceSnapshot;
        computedSubtotal += amount;

        finalOrderItems.push({
          productId: item.productId,
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

      // 4. Calculate Discounts and Totals
      const totals = calculateOrderTotals(
        computedSubtotal,
        discount,
        discountType,
        transportCharge,
        deliveryCharge
      );

      // 5. Build timeline logs
      const initialStatus = orderStatus || "Draft";

      const orderDoc = new Order({
        customerId,
        customerSnapshot,
        branchId,
        branchSnapshot,
        expectedDeliveryDate,
        deliverySlot,
        orderStatus: initialStatus,
        paymentStatus,
        deliveryStatus,
        invoiceStatus,
        orderType,
        orderSource,
        assignedVehicle,
        assignedDriver,
        customerNotes,
        adminNotes,
        subtotal: totals.subtotal,
        discount: Number(discount) || 0,
        discountType: discountType || "Flat",
        transportCharge: Number(transportCharge) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        grandTotal: totals.grandTotal,
        orderItems: finalOrderItems,
        createdBy,
      });

      appendTimeline(orderDoc, "orderTimeline", initialStatus, createdBy, "Order registered in the system.");

      await orderDoc.save({ session });

      // 6. Integrate with stock reservation if created in Confirmed / active status
      const reservedStatuses = ["Confirmed", "Packed", "Out For Delivery"];
      if (reservedStatuses.includes(initialStatus)) {
        for (const item of orderDoc.orderItems) {
          await inventoryService.reserveStock(
            item.productId,
            item.quantity,
            "Order",
            orderDoc._id,
            orderDoc.orderNumber,
            "Order created in active reserved status",
            "Order Confirmed",
            createdBy,
            session
          );
        }
      }

      return orderDoc;
    });

    invalidateReportCaches();
    return successResponse(res, order, "Order created successfully.", 201);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET ORDERS (PAGINATED & FILTERED)
exports.getOrders = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query, { orderDate: -1 });

    const filter = { isDeleted: { $ne: true } };

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.deliveryStatus) {
      filter.deliveryStatus = req.query.deliveryStatus;
    }
    if (req.query.customer) {
      filter.customerId = req.query.customer;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.orderDate = {};
      if (req.query.startDate) {
        filter.orderDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.orderDate.$lte = new Date(req.query.endDate);
      }
    }

    const orders = await Order.find(filter)
      .populate("customerId", "businessName personName contactNumber mobile")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    return paginatedResponse(res, orders, page, limit, total, "totalOrders");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate("customerId", "businessName personName contactNumber mobile");

    if (!order) {
      return errorResponse(res, "Order not found.", 404);
    }

    return successResponse(res, order);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE ORDER STATUS & TIMELINE
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, deliveryStatus, invoiceStatus, updatedBy, notes } = req.body;

    const result = await executeTransaction(async (session) => {
      const order = await validateOrder(req.params.id);

      if (order.isLocked) {
        const error = new Error("This order is locked and its status cannot be modified.");
        error.statusCode = 400;
        throw error;
      }

      const previousStatus = order.orderStatus;
      if (status && status !== previousStatus) {
        const reservedStatuses = ["Confirmed", "Packed", "Out For Delivery"];
        const wasReserved = reservedStatuses.includes(previousStatus);
        const isNowReserved = reservedStatuses.includes(status);

        // 1. Transition into reservation state
        if (!wasReserved && isNowReserved) {
          for (const item of order.orderItems) {
            await inventoryService.reserveStock(
              item.productId,
              item.quantity,
              "Order",
              order._id,
              order.orderNumber,
              `Order status updated from ${previousStatus} to ${status}`,
              "Order Confirmed",
              updatedBy,
              session
            );
          }
        }

        // 2. Cancel from reserved state
        if (wasReserved && status === "Cancelled") {
          for (const item of order.orderItems) {
            await inventoryService.releaseReservedStock(
              item.productId,
              item.quantity,
              "Order",
              order._id,
              order.orderNumber,
              `Order status updated from ${previousStatus} to Cancelled`,
              "Order Cancelled",
              updatedBy,
              session
            );
          }
        }

        // 3. Deliver from reserved state
        if (wasReserved && status === "Delivered") {
          for (const item of order.orderItems) {
            await inventoryService.decreaseStock(
              item.productId,
              item.quantity,
              "Order",
              order._id,
              order.orderNumber,
              `Order status updated to Delivered`,
              "Customer Order",
              updatedBy,
              session,
              true // decrease both currentStock and reservedStock
            );
          }
        }

        // 4. Deliver directly from non-reserved state (e.g. Draft -> Delivered)
        if (!wasReserved && status === "Delivered") {
          for (const item of order.orderItems) {
            await inventoryService.decreaseStock(
              item.productId,
              item.quantity,
              "Order",
              order._id,
              order.orderNumber,
              `Order status updated to Delivered`,
              "Customer Order",
              updatedBy,
              session,
              false // decrease currentStock only
            );
          }
        }

        order.orderStatus = status;
        appendTimeline(order, "orderTimeline", status, updatedBy, notes);
      }

      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (deliveryStatus) order.deliveryStatus = deliveryStatus;
      if (invoiceStatus) order.invoiceStatus = invoiceStatus;
      if (updatedBy) order.updatedBy = updatedBy;

      await order.save({ session });
      return order;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Order status updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// UPDATE ORDER (WITH PRICE SNAPSHOT PRESERVATION & RECALCULATIONS)
exports.updateOrder = async (req, res) => {
  try {
    const result = await executeTransaction(async (session) => {
      const order = await validateOrder(req.params.id);

      if (order.isLocked) {
        const error = new Error("This order is locked and cannot be updated.");
        error.statusCode = 400;
        throw error;
      }

      const reservedStatuses = ["Confirmed", "Packed", "Out For Delivery"];
      const wasReserved = reservedStatuses.includes(order.orderStatus);

      // If it was already reserved, release reservations before modifying items
      if (wasReserved) {
        for (const item of order.orderItems) {
          await inventoryService.releaseReservedStock(
            item.productId,
            item.quantity,
            "Order",
            order._id,
            order.orderNumber,
            "Releasing stock reservation for order update",
            "Order Cancelled",
            req.body.updatedBy || order.updatedBy,
            session
          );
        }
      }

      // Preserve read-only identifiers
      delete req.body.orderNumber;
      delete req.body.customerId;
      delete req.body.customerSnapshot;
      delete req.body.branchSnapshot;
      delete req.body.isDeleted;
      delete req.body.orderTimeline;

      // Handle orderItems update with pricing snapshot checks
      if (req.body.orderItems) {
        const updatedItems = [];
        for (const item of req.body.orderItems) {
          const existingItem = order.orderItems.find(
            (i) => i.productId.toString() === item.productId.toString()
          );
          if (existingItem) {
            // Re-use existing pricing snapshot
            const qty = Number(item.quantity);
            updatedItems.push({
              productId: item.productId,
              productCode: existingItem.productCode,
              productName: existingItem.productName,
              displayNameSnapshot: existingItem.displayNameSnapshot,
              category: existingItem.category,
              unit: existingItem.unit,
              quantity: qty,
              purchasePriceSnapshot: existingItem.purchasePriceSnapshot,
              sellingPriceSnapshot: existingItem.sellingPriceSnapshot,
              taxSnapshot: existingItem.taxSnapshot,
              amount: qty * existingItem.sellingPriceSnapshot,
              remarks: item.remarks || existingItem.remarks,
            });
          } else {
            // Fetch new product snapshot from database
            const product = await validateProduct(item.productId);
            const qty = Number(item.quantity);
            updatedItems.push({
              productId: item.productId,
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
        }
        order.orderItems = updatedItems;
      }

      // Update individual editable fields
      Object.assign(order, req.body);

      // Recalculate totals
      const computedSubtotal = order.orderItems.reduce((sum, item) => sum + item.amount, 0);
      const totals = calculateOrderTotals(
        computedSubtotal,
        order.discount,
        order.discountType,
        order.transportCharge,
        order.deliveryCharge
      );

      order.subtotal = totals.subtotal;
      order.grandTotal = totals.grandTotal;

      await order.save({ session });

      // Re-reserve items if new order state requires reservation
      if (reservedStatuses.includes(order.orderStatus)) {
        for (const item of order.orderItems) {
          await inventoryService.reserveStock(
            item.productId,
            item.quantity,
            "Order",
            order._id,
            order.orderNumber,
            "Re-reserving stock after order update",
            "Order Confirmed",
            req.body.updatedBy || order.updatedBy,
            session
          );
        }
      }

      return order;
    });

    invalidateReportCaches();
    return successResponse(res, result, "Order updated successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SOFT DELETE ORDER
exports.softDeleteOrder = async (req, res) => {
  try {
    await executeTransaction(async (session) => {
      const order = await validateOrder(req.params.id);

      const reservedStatuses = ["Confirmed", "Packed", "Out For Delivery"];
      if (reservedStatuses.includes(order.orderStatus)) {
        for (const item of order.orderItems) {
          await inventoryService.releaseReservedStock(
            item.productId,
            item.quantity,
            "Order",
            order._id,
            order.orderNumber,
            "Releasing stock reservation on order deletion",
            "Order Cancelled",
            req.body.deletedBy,
            session
          );
        }
      }

      order.isDeleted = true;
      await order.save({ session });
    });

    invalidateReportCaches();
    return successResponse(res, null, "Order archived successfully.");

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};

// SEARCH ORDERS
exports.searchOrders = async (req, res) => {
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

    // 2. Build order query
    const orderQuery = {
      isDeleted: { $ne: true },
      $or: [
        { orderNumber: { $regex: keyword, $options: "i" } },
        { customerId: { $in: customerIds } },
        { "customerSnapshot.businessName": { $regex: keyword, $options: "i" } },
        { "customerSnapshot.contactPerson": { $regex: keyword, $options: "i" } },
      ],
    };

    // Include date search if keyword parses as a valid date
    const parsedDate = Date.parse(keyword);
    if (!isNaN(parsedDate)) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      orderQuery.$or.push({
        orderDate: { $gte: startOfDay, $lte: endOfDay },
      });
    }

    const orders = await Order.find(orderQuery)
      .populate("customerId", "businessName personName contactNumber mobile")
      .sort({ orderDate: -1 });

    return successResponse(res, orders);

  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
