import api from "./api";
import { normalizeError } from "../utils/errors";

export const getBranches = async () => {
  try {
    const res = await api.get("/supplychain/branches");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getWarehouses = async () => {
  try {
    const res = await api.get("/supplychain/warehouses");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getInventory = async () => {
  try {
    const res = await api.get("/supplychain/inventory");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getTransfers = async () => {
  try {
    const res = await api.get("/supplychain/transfers");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getDispatch = async () => {
  try {
    const res = await api.get("/supplychain/dispatch");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getRoutes = async () => {
  try {
    const res = await api.get("/supplychain/routes");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getSuppliers = async () => {
  try {
    const res = await api.get("/supplychain/suppliers");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAnalytics = async () => {
  try {
    const res = await api.get("/supplychain/analytics");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createTransfer = async (payload) => {
  try {
    const res = await api.post("/supplychain/transfer", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createDispatch = async (payload) => {
  try {
    const res = await api.post("/supplychain/dispatch", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
