import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Fetch paginated audit log activity entries matching filters.
 * @param {number} [page=1] Target page number
 * @param {number} [limit=20] Items per page
 * @param {Object} [filters={}] Active filter options (module, actionType, search, startDate, endDate)
 * @param {Object} [config={}] Axios configuration (support AbortSignal)
 */
export const getAuditLogs = async (page = 1, limit = 20, filters = {}, config = {}) => {
  try {
    const params = {
      page,
      limit,
      ...filters,
    };
    const response = await api.get(API_ENDPOINTS.AUDIT.BASE, { params, ...config });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Fetch single Audit Log Entry Details
 * @param {string} id Audit log entry ID
 */
export const getAuditLogById = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.AUDIT.BY_ID(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Reconstruct entity transaction timeline
 * @param {string} entity Entity name (Invoice, Product, Customer)
 * @param {string} entityId Entity ID
 */
export const getEntityHistory = async (entity, entityId) => {
  try {
    const response = await api.get(API_ENDPOINTS.AUDIT.ENTITY_HISTORY(entity, entityId));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Fetch Audit Dashboard Summary Cards & Stats
 */
export const getAuditStats = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUDIT.ACTIVITY);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
