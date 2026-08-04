import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

// ── Orders ────────────────────────────────────
export const getDraftOrders = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.DRAFTS, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const placeOrder = (payload, config) =>
  api.post(API_ENDPOINTS.CUSTOMER_PORTAL.ORDERS, payload, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const updateDraftOrder = (id, payload, config) =>
  api.put(API_ENDPOINTS.CUSTOMER_PORTAL.ORDER_DETAILS(id), payload, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const deleteDraftOrder = (id, config) =>
  api.delete(API_ENDPOINTS.CUSTOMER_PORTAL.ORDER_DETAILS(id), config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const reorder = (id, config) =>
  api.post(API_ENDPOINTS.CUSTOMER_PORTAL.REORDER(id), {}, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

// ── Favorites ─────────────────────────────────
export const getFavorites = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.FAVORITES, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const addFavorite = (productId, config) =>
  api.post(API_ENDPOINTS.CUSTOMER_PORTAL.FAVORITES, { productId }, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const removeFavorite = (productId, config) =>
  api.delete(API_ENDPOINTS.CUSTOMER_PORTAL.REMOVE_FAVORITE(productId), config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

// ── Support ───────────────────────────────────
export const getSupportTickets = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.SUPPORT, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const submitSupportTicket = (payload, config) =>
  api.post(API_ENDPOINTS.CUSTOMER_PORTAL.SUPPORT, payload, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });
