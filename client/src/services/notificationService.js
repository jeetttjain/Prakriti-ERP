import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

export const getNotifications = async (filters = {}, config = {}) => {
  try {
    const cleaned = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "" && filters[key] !== "All") {
        cleaned[key] = filters[key];
      }
    });
    const params = new URLSearchParams(cleaned).toString();
    const url = `${API_ENDPOINTS.NOTIFICATIONS.BASE}${params ? `?${params}` : ""}`;
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getTemplates = async (config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.TEMPLATES, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const sendNotification = async (id, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.SEND(id), {}, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const retryNotification = async (id, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.RETRY(id), {}, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const cancelNotification = async (id, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.CANCEL(id), {}, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getPreferences = async (query = {}, config = {}) => {
  try {
    const params = new URLSearchParams(query).toString();
    const url = `${API_ENDPOINTS.NOTIFICATIONS.PREFERENCES}${params ? `?${params}` : ""}`;
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updatePreferences = async (prefData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, prefData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
