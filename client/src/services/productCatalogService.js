import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

export const getPortalProducts = (params = {}, config = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.CUSTOMER_PORTAL.PRODUCTS}${query ? `?${query}` : ""}`;
  return api.get(url, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });
};

export const getPortalProductById = (id, config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.PRODUCT_DETAILS(id), config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getCategories = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.CATEGORIES, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });

export const getOffers = (config) =>
  api.get(API_ENDPOINTS.CUSTOMER_PORTAL.OFFERS, config).then((r) => r.data).catch((e) => { throw normalizeError(e); });
