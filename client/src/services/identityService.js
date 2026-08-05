import api from "./api";
import { normalizeError } from "../utils/errors";

export const getUsers = async (params) => {
  try {
    const res = await api.get("/identity/users", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getSessions = async (params) => {
  try {
    const res = await api.get("/identity/sessions", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getDevices = async (params) => {
  try {
    const res = await api.get("/identity/devices", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getApiKeys = async (params) => {
  try {
    const res = await api.get("/identity/apikeys", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getSecurityConfig = async () => {
  try {
    const res = await api.get("/identity/security");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const revokeSession = async (sessionId) => {
  try {
    const res = await api.post("/identity/session/revoke", { sessionId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const trustDevice = async (deviceId) => {
  try {
    const res = await api.post("/identity/device/trust", { deviceId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const blockDevice = async (deviceId) => {
  try {
    const res = await api.post("/identity/device/block", { deviceId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createApiKey = async (name, scopes = ["READ_ONLY"]) => {
  try {
    const res = await api.post("/identity/apikey", { name, scopes });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
