import api from "./api";
import { normalizeError } from "../utils/errors";

export const getFiles = async (params) => {
  try {
    const res = await api.get("/data/files", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const searchFiles = async (queryText, filters = {}) => {
  try {
    const res = await api.get("/data/search", { params: { q: queryText, ...filters } });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getPreview = async (fileId) => {
  try {
    const res = await api.get(`/data/preview/${fileId}`);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const uploadFile = async (payload) => {
  try {
    const res = await api.post("/data/upload", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createBackup = async (backupName, type = "FULL") => {
  try {
    const res = await api.post("/data/backup", { backupName, type });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const restoreBackup = async (backupId) => {
  try {
    const res = await api.post("/data/restore", { backupId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
