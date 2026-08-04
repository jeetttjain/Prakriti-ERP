import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated purchase records from backend.
 */
export const getPurchases = async (page = 1, limit = 8, status = "", supplierId = "", config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status && status !== "All") params.append("status", status);
    if (supplierId && supplierId !== "All") params.append("supplier", supplierId);

    const response = await api.get(`${API_ENDPOINTS.PURCHASES.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves purchase order detail profile by ID.
 */
export const getPurchaseById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.PURCHASES.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new Purchase Order replenishment request.
 */
export const createPurchase = async (purchaseData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.PURCHASES.BASE, purchaseData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Updates a Purchase Order details.
 */
export const updatePurchase = async (id, purchaseData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.PURCHASES.BY_ID(id), purchaseData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Transitions purchase order status.
 */
export const updatePurchaseStatus = async (id, status, updatedBy = "System", config = {}) => {
  try {
    const payload = typeof status === "object" ? status : { status, updatedBy };
    const response = await api.patch(API_ENDPOINTS.PURCHASES.STATUS(id), payload, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Explicitly marks a purchase order as fully Received, increasing stock atomically.
 */
export const receivePurchase = async (id, receivedBy = "System", config = {}) => {
  try {
    const payload = typeof receivedBy === "object" ? receivedBy : { receivedBy };
    const response = await api.post(API_ENDPOINTS.PURCHASES.RECEIVE(id), payload, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Cancels a purchase order.
 */
export const cancelPurchase = async (id, cancelledBy = "System", config = {}) => {
  try {
    const payload = typeof cancelledBy === "object" ? cancelledBy : { cancelledBy };
    const response = await api.post(API_ENDPOINTS.PURCHASES.CANCEL(id), payload, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Queries purchases by key terms.
 */
export const searchPurchases = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PURCHASES.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
