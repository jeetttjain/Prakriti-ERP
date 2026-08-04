import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Retrieves global ERP configurations object.
 */
export const getSettings = async (config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.SETTINGS.BASE, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Saves modifications to configurations in database.
 */
export const updateSettings = async (settingsData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.SETTINGS.BASE, settingsData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Toggles a single feature flag/switch.
 */
export const toggleModule = async (field, value, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.SETTINGS.TOGGLE, { field, value }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
