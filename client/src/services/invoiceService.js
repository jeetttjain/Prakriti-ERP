import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated invoices from database.
 */
export const getInvoices = async (page = 1, limit = 8, filters = {}, config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (filters.status && filters.status !== "All") params.append("status", filters.status);
    if (filters.paymentStatus && filters.paymentStatus !== "All") params.append("paymentStatus", filters.paymentStatus);
    if (filters.customer && filters.customer !== "All") params.append("customer", filters.customer);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`${API_ENDPOINTS.INVOICES.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves an invoice document details by database ID.
 */
export const getInvoiceById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.INVOICES.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new invoice transaction in database.
 */
export const createInvoice = async (invoiceData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.INVOICES.BASE, invoiceData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies an existing invoice details.
 */
export const updateInvoice = async (id, invoiceData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.INVOICES.BY_ID(id), invoiceData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies invoice lifecycle status and timeline logs.
 */
export const updateInvoiceStatus = async (id, statusData, config = {}) => {
  try {
    const payload = typeof statusData === "string" ? { status: statusData } : statusData;
    const response = await api.patch(API_ENDPOINTS.INVOICES.STATUS(id), payload, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Soft deletes/archives an invoice by ID.
 */
export const deleteInvoice = async (id, config = {}) => {
  try {
    const response = await api.delete(API_ENDPOINTS.INVOICES.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Queries invoices matching search query.
 */
export const searchInvoices = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.INVOICES.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
