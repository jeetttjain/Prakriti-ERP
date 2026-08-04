import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

const getDashboardData = async (endpoint, config = {}) => {
  try {
    const response = await api.get(`/dashboard/${endpoint}`, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getOverview = (config) => getDashboardData("overview", config);
export const getKPIs = (config) => getDashboardData("kpis", config);
export const getCharts = (config) => getDashboardData("charts", config);
export const getActivity = (config) => getDashboardData("activity", config);
export const getAlerts = (config) => getDashboardData("alerts", config);
