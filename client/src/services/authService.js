import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

/**
 * Executes credentials login on the backend.
 */
export const login = async (username, password, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Executes session logout.
 */
export const logout = async (refreshToken, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Changes active user password.
 */
export const changePassword = async (oldPassword, newPassword, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Fetches populated profile context.
 */
export const getProfile = async (config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTH.PROFILE, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
