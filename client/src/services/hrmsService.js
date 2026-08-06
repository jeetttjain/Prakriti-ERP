import api from "./api";
import { normalizeError } from "../utils/errors";

export const getEmployees = async () => {
  try {
    const res = await api.get("/hrms/employees");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getOrgChart = async () => {
  try {
    const res = await api.get("/hrms/organization/chart");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAttendance = async () => {
  try {
    const res = await api.get("/hrms/attendance");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getLeave = async () => {
  try {
    const res = await api.get("/hrms/leave");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getPayroll = async () => {
  try {
    const res = await api.get("/hrms/payroll");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getAnalytics = async () => {
  try {
    const res = await api.get("/hrms/analytics");
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const createEmployee = async (payload) => {
  try {
    const res = await api.post("/hrms/employee", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const markAttendance = async (payload) => {
  try {
    const res = await api.post("/hrms/attendance", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const applyLeave = async (payload) => {
  try {
    const res = await api.post("/hrms/leave", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const runPayroll = async (payload) => {
  try {
    const res = await api.post("/hrms/payroll/run", payload);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
