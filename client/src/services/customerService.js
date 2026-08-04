import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated customer registry from the database.
 */
export const getCustomers = async (page = 1, limit = 8, status = "", paymentCycle = "", config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status && status !== "All") params.append("status", status);
    if (paymentCycle && paymentCycle !== "All") params.append("paymentCycle", paymentCycle);

    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves a customer profile by database ID.
 */
export const getCustomerById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new customer in the database.
 */
export const createCustomer = async (customerData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.CUSTOMERS.BASE, customerData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies an existing customer's profile.
 */
export const updateCustomer = async (id, customerData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.CUSTOMERS.BY_ID(id), customerData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Toggles a customer's active status.
 */
export const updateCustomerStatus = async (id, status, config = {}) => {
  try {
    const response = await api.patch(API_ENDPOINTS.CUSTOMERS.STATUS(id), { status }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Queries customers list by keywords.
 */
export const searchCustomers = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.CUSTOMERS.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};