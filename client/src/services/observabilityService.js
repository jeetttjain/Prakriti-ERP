import api from "./api";
import { normalizeError } from "../utils/errors";

export const getLogs = async (params) => {
  try {
    const res = await api.get("/observability/logs", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getMetrics = async () => {
  try {
    const res = await api.get("/observability/metrics");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getTraces = async (params) => {
  try {
    const res = await api.get("/observability/traces", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getHealth = async () => {
  try {
    const res = await api.get("/observability/health");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAlerts = async () => {
  try {
    const res = await api.get("/observability/alerts");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getDiagnostics = async () => {
  try {
    const res = await api.get("/observability/diagnostics");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const runDiagnostics = async () => {
  try {
    const res = await api.post("/observability/diagnostics/run");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const acknowledgeAlert = async (alertId) => {
  try {
    const res = await api.post("/observability/alerts/acknowledge", { alertId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
