import api from "./api";
import { normalizeError } from "../utils/errors";

export const getAccounts = async () => {
  try {
    const res = await api.get("/finance/accounts");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getLedger = async () => {
  try {
    const res = await api.get("/finance/ledger");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getJournals = async () => {
  try {
    const res = await api.get("/finance/journals");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getReports = async () => {
  try {
    const res = await api.get("/finance/reports");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getBudgets = async () => {
  try {
    const res = await api.get("/finance/budget");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAssets = async () => {
  try {
    const res = await api.get("/finance/assets");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const postJournal = async (payload) => {
  try {
    const res = await api.post("/finance/journal", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const closePeriod = async (payload) => {
  try {
    const res = await api.post("/finance/closing", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
