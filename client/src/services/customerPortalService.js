import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

// ── Auth ─────────────────────────────────────
export const loginCustomer = async (mobile, password, config = {}) => {
  try {
    const res = await api.post(API_ENDPOINTS.CUSTOMER_PORTAL.LOGIN, { mobile, password }, config);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const refreshCustomerToken = async (refreshToken, config = {}) => {
  try {
    const res = await api.post(API_ENDPOINTS.CUSTOMER_PORTAL.REFRESH, { refreshToken }, config);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const enableCustomerPortal = async (customerId, password, config = {}) => {
  try {
    const res = await api.post(API_ENDPOINTS.CUSTOMER_PORTAL.ENABLE_PORTAL, { customerId, password }, config);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

// ── Data Endpoints ────────────────────────────
export const getPortalDashboard = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.DASHBOARD, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getMyOrders = (params = {}, config = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.CUSTOMER_PORTAL.ORDERS}${query ? `?${query}` : ""}`;
  return api.get(url, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });
};

export const getMyOrderDetails = (id, config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.ORDER_DETAILS(id), config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getMyInvoices = (params = {}, config = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.CUSTOMER_PORTAL.INVOICES}${query ? `?${query}` : ""}`;
  return api.get(url, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });
};

export const getMyInvoiceDetails = (id, config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.INVOICE_DETAILS(id), config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getMyPayments = (params = {}, config = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.CUSTOMER_PORTAL.PAYMENTS}${query ? `?${query}` : ""}`;
  return api.get(url, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });
};

export const getMyOutstanding = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.OUTSTANDING, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getMyProfile = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.PROFILE, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getMyNotifications = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.NOTIFICATIONS, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const markMyNotificationRead = async (id, config = {}) => {
  try {
    const res = await api.put(API_ENDPOINTS.CUSTOMER_PORTAL.MARK_NOTIFICATION_READ(id), {}, config);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
