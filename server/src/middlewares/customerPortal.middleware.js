const jwt = require("jsonwebtoken");
const { CP_JWT_SECRET } = require("../services/customerAuth.service");
const { errorResponse } = require("../services/response.service");

/**
 * Validates and injects customer identity into req.customer.
 * All customer portal routes must pass through this middleware.
 */
const authenticateCustomer = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (!token) return errorResponse(res, "Customer portal authentication required.", 401);

    const decoded = jwt.verify(token, CP_JWT_SECRET);

    // Ensure the token was issued for a customer, not an ERP staff user
    if (decoded.type !== "customer") {
      return errorResponse(res, "Access denied. Customer token required.", 403);
    }

    req.customer = decoded; // { customerId, mobile }
    next();
  } catch {
    return errorResponse(res, "Invalid or expired portal session. Please log in again.", 401);
  }
};

module.exports = { authenticateCustomer };
