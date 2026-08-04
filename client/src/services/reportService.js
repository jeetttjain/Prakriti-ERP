import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Helper to execute report requests with clean query parameters and signal support.
 */
const getReport = async (endpoint, filters = {}, config = {}) => {
  try {
    const cleanedFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "" && filters[key] !== "All") {
        cleanedFilters[key] = filters[key];
      }
    });

    const params = new URLSearchParams(cleanedFilters).toString();
    const url = `/reports/${endpoint}${params ? `?${params}` : ""}`;
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getDashboardSummary = (filters, config) => getReport("dashboard-summary", filters, config);
export const getSalesReport = (filters, config) => getReport("sales", filters, config);
export const getPurchaseReport = (filters, config) => getReport("purchases", filters, config);
export const getInventoryReport = (filters, config) => getReport("inventory", filters, config);
export const getCustomerReport = (filters, config) => getReport("customers", filters, config);
export const getSupplierReport = (filters, config) => getReport("suppliers", filters, config);
export const getPaymentReport = (filters, config) => getReport("payments", filters, config);
export const getOutstandingReport = (filters, config) => getReport("outstanding", filters, config);
export const getProductPerformanceReport = (filters, config) => getReport("products", filters, config);

// Analytics endpoints
export const getSalesSummaryAnalytics = (filters, config) => getReport("sales-summary", filters, config);
export const getTopProductsAnalytics = (filters, config) => getReport("top-products", filters, config);
export const getTopCustomersAnalytics = (filters, config) => getReport("top-customers", filters, config);
export const getPurchaseSummaryAnalytics = (filters, config) => getReport("purchase-summary", filters, config);
export const getTopSuppliersAnalytics = (filters, config) => getReport("top-suppliers", filters, config);
export const getInventorySummaryAnalytics = (filters, config) => getReport("inventory-summary", filters, config);
export const getStockMovementAnalytics = (filters, config) => getReport("stock-movement", filters, config);
export const getReceivablesAnalytics = (filters, config) => getReport("receivables", filters, config);
export const getPayablesAnalytics = (filters, config) => getReport("payables", filters, config);
export const getPaymentSummaryAnalytics = (filters, config) => getReport("payment-summary", filters, config);
export const getCustomerAnalytics = (filters, config) => getReport("customer-analytics", filters, config);
export const getProductAnalytics = (filters, config) => getReport("product-analytics", filters, config);
export const getSupplierAnalytics = (filters, config) => getReport("supplier-analytics", filters, config);
