import api from "./api";
import { normalizeError } from "../utils/errors";

export const getModules = async () => {
  try {
    const res = await api.get("/system/modules");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getFlags = async () => {
  try {
    const res = await api.get("/system/flags");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getConfigs = async () => {
  try {
    const res = await api.get("/system/configuration");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getMaintenance = async () => {
  try {
    const res = await api.get("/system/maintenance");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getSnapshots = async () => {
  try {
    const res = await api.get("/system/snapshots");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const startModule = async (moduleId) => {
  try {
    const res = await api.post("/system/module/start", { moduleId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const stopModule = async (moduleId, force = false) => {
  try {
    const res = await api.post("/system/module/stop", { moduleId, force });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const setFlag = async (key, isEnabled) => {
  try {
    const endpoint = isEnabled ? "/system/feature/enable" : "/system/feature/disable";
    const res = await api.post(endpoint, { key });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const triggerEmergency = async (target) => {
  try {
    const res = await api.post("/system/emergency", { target });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createSnapshot = async (description) => {
  try {
    const res = await api.post("/system/snapshot/create", { description });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const restoreSnapshot = async (snapshotId) => {
  try {
    const res = await api.post("/system/snapshot/restore", { snapshotId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
