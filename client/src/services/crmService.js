import api from "./api";
import { normalizeError } from "../utils/errors";

export const getCustomers = async () => {
  try {
    const res = await api.get("/crm/customers");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getCustomer360 = async (customerCode) => {
  try {
    const res = await api.get(`/crm/customer360/${customerCode}`);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getLeads = async () => {
  try {
    const res = await api.get("/crm/leads");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getOpportunities = async () => {
  try {
    const res = await api.get("/crm/opportunities");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getQuotations = async () => {
  try {
    const res = await api.get("/crm/quotations");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getVisits = async () => {
  try {
    const res = await api.get("/crm/visits");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getComplaints = async () => {
  try {
    const res = await api.get("/crm/complaints");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getForecast = async () => {
  try {
    const res = await api.get("/crm/forecast");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAnalytics = async () => {
  try {
    const res = await api.get("/crm/analytics");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createLead = async (payload) => {
  try {
    const res = await api.post("/crm/lead", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const convertLead = async (leadId) => {
  try {
    const res = await api.post("/crm/lead/convert", { leadId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createQuotation = async (payload) => {
  try {
    const res = await api.post("/crm/quotation", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const recordCollection = async (payload) => {
  try {
    const res = await api.post("/crm/collection", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
