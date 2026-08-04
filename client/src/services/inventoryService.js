import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated inventory records.
 */
export const getInventory = async (page = 1, limit = 8, status = "", location = "", config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status && status !== "All") params.append("status", status);
    if (location && location !== "All") params.append("location", location);

    const response = await api.get(`${API_ENDPOINTS.INVENTORY.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves a specific inventory record by ID or product ID.
 */
export const getInventoryById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.INVENTORY.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Searches inventory records matching the keyword.
 */
export const searchInventory = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.INVENTORY.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Adjusts inventory stock levels manually.
 */
export const adjustInventory = async (adjustmentData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.INVENTORY.ADJUST, adjustmentData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Reserves stock.
 */
export const reserveInventory = async (reservationData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.INVENTORY.RESERVE, reservationData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Releases reserved stock manually.
 */
export const releaseReservation = async (releaseData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.INVENTORY.RELEASE, releaseData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves paginated stock movement history log.
 */
export const getMovementHistory = async (queryParams = {}, config = {}) => {
  try {
    const { page = 1, limit = 8, productId = "", inventoryId = "", type = "", module = "" } = queryParams;
    const params = new URLSearchParams({ page, limit });
    if (productId) params.append("productId", productId);
    if (inventoryId) params.append("inventoryId", inventoryId);
    if (type && type !== "All") params.append("type", type);
    if (module && module !== "All") params.append("module", module);

    const response = await api.get(`${API_ENDPOINTS.INVENTORY.MOVEMENTS}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers opening stock for a product.
 */
export const createOpeningStock = async (openingData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.INVENTORY.BASE, openingData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
