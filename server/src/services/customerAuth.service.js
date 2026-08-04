const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const CP_JWT_SECRET = process.env.CP_JWT_SECRET || "prakriti_customer_portal_secret_!@#";
const CP_REFRESH_SECRET = process.env.CP_REFRESH_SECRET || "prakriti_customer_refresh_!@#";

/**
 * Customer portal password-based login.
 * Returns accessToken + refreshToken scoped to the customer identity.
 */
const loginCustomer = async (mobile, password) => {
  const customer = await Customer.findOne({ mobile }).select("+portalPassword");
  if (!customer) throw new Error("No account found with this mobile number.");

  if (!customer.portalEnabled) {
    throw new Error("Portal access is not enabled for this account. Please contact support.");
  }
  if (customer.status !== "Active") {
    throw new Error("Your account is inactive. Please contact support.");
  }
  if (!customer.portalPassword) {
    throw new Error("Portal password not set. Please contact support to activate your account.");
  }

  const isMatch = await bcrypt.compare(password, customer.portalPassword);
  if (!isMatch) throw new Error("Invalid mobile number or password.");

  customer.portalLastLogin = new Date();
  await customer.save();

  const payload = { customerId: customer._id, mobile: customer.mobile, type: "customer" };

  const accessToken = jwt.sign(payload, CP_JWT_SECRET, { expiresIn: "2h" });
  const refreshToken = jwt.sign({ customerId: customer._id }, CP_REFRESH_SECRET, { expiresIn: "7d" });

  return {
    customer: {
      _id: customer._id,
      businessName: customer.businessName,
      personName: customer.personName,
      mobile: customer.mobile,
      whatsappNumber: customer.whatsappNumber,
      address: customer.address,
      gstNumber: customer.gstNumber,
      branches: customer.branches,
      paymentCycle: customer.paymentCycle,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Verifies a refresh token and issues a new access token.
 */
const refreshCustomerToken = async (token) => {
  try {
    const decoded = jwt.verify(token, CP_REFRESH_SECRET);
    const customer = await Customer.findById(decoded.customerId);
    if (!customer || !customer.portalEnabled) throw new Error("Invalid session.");

    const accessToken = jwt.sign(
      { customerId: customer._id, mobile: customer.mobile, type: "customer" },
      CP_JWT_SECRET,
      { expiresIn: "2h" }
    );
    return { accessToken };
  } catch {
    throw new Error("Session expired. Please log in again.");
  }
};

/**
 * Hashes and sets a new portal password for a customer (called by ERP admin).
 */
const setPortalPassword = async (customerId, newPassword, enablePortal = true) => {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error("Customer not found.");
  customer.portalPassword = await bcrypt.hash(newPassword, 10);
  customer.portalEnabled = enablePortal;
  await customer.save();
};

module.exports = {
  loginCustomer,
  refreshCustomerToken,
  setPortalPassword,
  CP_JWT_SECRET,
};
