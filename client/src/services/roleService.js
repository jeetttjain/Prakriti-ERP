import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

export const getRoles = async (config = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.ROLES.BASE, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const createRole = async (roleData, config = {}) => {
  try {
    const response = await api.post(API_ENDPOINTS.ROLES.BASE, roleData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updateRole = async (id, roleData, config = {}) => {
  try {
    const response = await api.put(API_ENDPOINTS.ROLES.BY_ID(id), roleData, config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const deleteRole = async (id, config = {}) => {
  try {
    const response = await api.delete(API_ENDPOINTS.ROLES.BY_ID(id), config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
