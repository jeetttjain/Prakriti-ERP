import api from "./api";
import { normalizeError } from "../utils/errors";

const getBIData = async (endpoint, params = {}, config = {}) => {
  try {
    const response = await api.get(`/bi/${endpoint}`, { params, ...config });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getOverview = (params, config) => getBIData("overview", params, config);
export const getRecommendations = (params, config) => getBIData("recommendations", params, config);
export const getSalesIntelligence = (params, config) => getBIData("sales", params, config);
export const getInventoryIntelligence = (params, config) => getBIData("inventory", params, config);
export const getCustomerIntelligence = (params, config) => getBIData("customers", params, config);
export const getSupplierIntelligence = (params, config) => getBIData("suppliers", params, config);
export const getFinancialIntelligence = (params, config) => getBIData("finance", params, config);
export const getPurchaseIntelligence = (params, config) => getBIData("purchases", params, config);
export const getAlerts = (params, config) => getBIData("alerts", params, config);
export const getHealthScore = (params, config) => getBIData("health", params, config);

export const resolveRecommendation = async (id, resolutionNotes, config = {}) => {
  try {
    const response = await api.post(`/bi/recommendation/${id}/resolve`, { resolutionNotes }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const archiveRecommendation = async (id, config = {}) => {
  try {
    const response = await api.post(`/bi/recommendation/${id}/archive`, {}, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
