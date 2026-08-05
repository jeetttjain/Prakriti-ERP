import api from "./api";
import { normalizeError } from "../utils/errors";

const getDashboardData = async (endpoint, params = {}, config = {}) => {
  try {
    const response = await api.get(`/dashboard/${endpoint}`, { params, ...config });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getOverview = (params, config) => getDashboardData("overview", params, config);
export const getKPIs = (params, config) => getDashboardData("kpis", params, config);
export const getCharts = (params, config) => getDashboardData("charts", params, config);
export const getActivity = (params, config) => getDashboardData("activity", params, config);
export const getAlerts = (params, config) => getDashboardData("alerts", params, config);
export const getHealth = (params, config) => getDashboardData("health", params, config);

export const getPreferences = async (config = {}) => {
  try {
    const response = await api.get("/dashboard/preferences", config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updatePreferences = async (preferences, config = {}) => {
  try {
    const response = await api.put("/dashboard/preferences", preferences, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const clearCache = async (config = {}) => {
  try {
    const response = await api.post("/dashboard/cache/clear", {}, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
