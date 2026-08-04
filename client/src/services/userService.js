import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

export const getUsers = async (config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.USERS.BASE, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const createUser = async (userData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.USERS.BASE, userData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updateUser = async (id, userData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.USERS.BY_ID(id), userData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const deleteUser = async (id, config = {}) => {
  try {
    const response = await api.delete(API_ENDPOINTS.USERS.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const resetPassword = async (userId, newPassword, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.USERS.RESET_PASSWORD, { userId, newPassword }, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
