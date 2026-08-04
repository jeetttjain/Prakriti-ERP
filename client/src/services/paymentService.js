import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated payments from database.
 */
export const getPayments = async (page = 1, limit = 8, filters = {}, config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (filters.status && filters.status !== "All") params.append("status", filters.status);
    if (filters.method && filters.method !== "All") params.append("method", filters.method);
    if (filters.type && filters.type !== "All") params.append("type", filters.type);
    if (filters.customer && filters.customer !== "All") params.append("customer", filters.customer);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`${API_ENDPOINTS.PAYMENTS.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves a payment transaction details by database ID.
 */
export const getPaymentById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.PAYMENTS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new payment transaction in database.
 */
export const createPayment = async (paymentData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.PAYMENTS.BASE, paymentData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies an existing payment details.
 */
export const updatePayment = async (id, paymentData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.PAYMENTS.BY_ID(id), paymentData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies payment lifecycle status and timeline logs.
 */
export const updatePaymentStatus = async (id, statusData, config = {}) => {
  try {
    const payload = typeof statusData === "string" ? { status: statusData } : statusData;
    const response = await api.patch(API_ENDPOINTS.PAYMENTS.STATUS(id), payload, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Soft deletes/archives a payment by ID.
 */
export const deletePayment = async (id, config = {}) => {
  try {
    const response = await api.delete(API_ENDPOINTS.PAYMENTS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Queries payments matching search query.
 */
export const searchPayments = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PAYMENTS.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
