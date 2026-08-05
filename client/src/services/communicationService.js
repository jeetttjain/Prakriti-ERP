import api from "./api";
import { normalizeError } from "../utils/errors";

export const getMessages = async (params) => {
  try {
    const res = await api.get("/communication/messages", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getConversations = async (params) => {
  try {
    const res = await api.get("/communication/conversations", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getTemplates = async (params) => {
  try {
    const res = await api.get("/communication/templates", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getProviders = async (params) => {
  try {
    const res = await api.get("/communication/providers", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAnalytics = async (params) => {
  try {
    const res = await api.get("/communication/analytics", { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const sendMessage = async (payload) => {
  try {
    const res = await api.post("/communication/send", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
