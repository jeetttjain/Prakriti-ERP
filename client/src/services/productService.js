import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves paginated products list from database.
 */
export const getProducts = async (page = 1, limit = 8, status = "", category = "", config = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status && status !== "All") params.append("status", status);
    if (category && category !== "All") params.append("category", category);

    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.BASE}?${params.toString()}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Retrieves a product details card by database ID.
 */
export const getProductById = async (id, config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Registers a new product in the catalog.
 */
export const createProduct = async (productData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.BASE, productData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Modifies an existing product's characteristics.
 */
export const updateProduct = async (id, productData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), productData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Toggles a product's active status.
 */
export const updateProductStatus = async (id, status, config = {}) => {
  try {
    const response = await api.patch(API_ENDPOINTS.PRODUCTS.STATUS(id), { status }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Queries products list by keywords.
 */
export const searchProducts = async (keyword, config = {}) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(keyword)}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
