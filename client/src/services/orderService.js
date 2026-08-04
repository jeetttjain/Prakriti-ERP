import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated orders from database.
 */
export const getOrders = async (page = 1, limit = 8, filters = {}, config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (filters.status && filters.status !== "All") params.append("status", filters.status);
    if (filters.paymentStatus && filters.paymentStatus !== "All") params.append("paymentStatus", filters.paymentStatus);
    if (filters.deliveryStatus && filters.deliveryStatus !== "All") params.append("deliveryStatus", filters.deliveryStatus);
    if (filters.customer && filters.customer !== "All") params.append("customer", filters.customer);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`${API_ENDPOINTS.ORDERS.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves an order document details by database ID.
 */
export const getOrderById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.ORDERS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new order transaction in database.
 */
export const createOrder = async (orderData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.ORDERS.BASE, orderData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies an existing order payload.
 */
export const updateOrder = async (id, orderData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.ORDERS.BY_ID(id), orderData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies order lifecycle status and timeline.
 */
export const updateOrderStatus = async (id, statusData, config = {}) => {
  try {
    const payload = typeof statusData === "string" ? { status: statusData } : statusData;
    const response = await api.patch(API_ENDPOINTS.ORDERS.STATUS(id), payload, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Soft deletes/archives an order by ID.
 */
export const deleteOrder = async (id, config = {}) => {
  try {
    const response = await api.delete(API_ENDPOINTS.ORDERS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Queries orders matching keywords.
 */
export const searchOrders = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.ORDERS.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
