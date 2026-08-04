import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated suppliers from backend.
 */
export const getSuppliers = async (page = 1, limit = 8, status = "", category = "", config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status && status !== "All") params.append("status", status);
    if (category && category !== "All") params.append("category", category);

    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves supplier details by ID.
 */
export const getSupplierById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.SUPPLIERS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new supplier.
 */
export const createSupplier = async (supplierData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.SUPPLIERS.BASE, supplierData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Updates supplier details.
 */
export const updateSupplier = async (id, supplierData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.SUPPLIERS.BY_ID(id), supplierData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Deletes/removes a supplier.
 */
export const deleteSupplier = async (id, config = {}) => {
  try {
    const response = await api.delete(API_ENDPOINTS.SUPPLIERS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Searches suppliers list matching search query values.
 */
export const searchSuppliers = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.SUPPLIERS.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
