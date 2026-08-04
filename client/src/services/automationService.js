import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

export const getRules = async (page = 1, limit = 20, filters = {}, config = {}) => {
  try {
    const params = { page, limit, ...filters };
    const response = await api.get(API_ENDPOINTS.AUTOMATION.RULES, { params, ...config });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getRuleById = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTOMATION.RULE_BY_ID(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const createRule = async (data) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTOMATION.RULES, data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updateRule = async (id, data) => {
  try {
    const response = await api.put(API_ENDPOINTS.AUTOMATION.RULE_BY_ID(id), data);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const toggleRule = async (id) => {
  try {
    const response = await api.patch(API_ENDPOINTS.AUTOMATION.TOGGLE_RULE(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const cloneRule = async (id) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTOMATION.CLONE_RULE(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const deleteRule = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.AUTOMATION.RULE_BY_ID(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const runRuleManual = async (id) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTOMATION.RUN_RULE(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getExecutions = async (page = 1, limit = 20, filters = {}, config = {}) => {
  try {
    const params = { page, limit, ...filters };
    const response = await api.get(API_ENDPOINTS.AUTOMATION.EXECUTIONS, { params, ...config });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const retryExecution = async (id) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTOMATION.RETRY_EXECUTION(id));
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getStats = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTOMATION.STATS);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getHealth = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTOMATION.HEALTH);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const toggleScheduler = async (pause = false) => {
  try {
    const endpoint = pause ? API_ENDPOINTS.AUTOMATION.SCHEDULER_PAUSE : API_ENDPOINTS.AUTOMATION.SCHEDULER_RESUME;
    const response = await api.post(endpoint);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};
