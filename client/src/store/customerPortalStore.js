import { create } from "zustand";
import * as portalService from "../services/customerPortalService";

const CP_SESSION_KEY = "prakriti_cp_session";
let currentAbortController = null;

const getStoredCPSession = () => {
  try {
    const data = localStorage.getItem(CP_SESSION_KEY);
    return data ? JSON.parse(data) : { isLoggedIn: false, customer: null, accessToken: null, refreshToken: null };
  } catch {
    return { isLoggedIn: false, customer: null, accessToken: null, refreshToken: null };
  }
};

/**
 * Zustand Customer Portal Store.
 * Manages customer authentication and all portal data states.
 * @exports useCustomerPortalStore
 */
export const useCustomerPortalStore = create((set, get) => ({
  // Session
  ...getStoredCPSession(),
  loginLoading: false,
  loginError: null,

  // Data slices
  dashboard: null,
  orders: [],
  orderDetails: null,
  ordersTotal: 0,
  invoices: [],
  invoiceDetails: null,
  invoicesTotal: 0,
  payments: [],
  paymentsTotal: 0,
  outstanding: null,
  profile: null,
  notifications: [],
  loading: false,
  error: null,

  // ── Auth ────────────────────────────────────────
  loginCustomer: async (mobile, password) => {
    set({ loginLoading: true, loginError: null });
    try {
      const res = await portalService.loginCustomer(mobile, password);
      const payload = res.data || res;
      const session = {
        isLoggedIn: true,
        customer: payload.customer,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
      };
      localStorage.setItem(CP_SESSION_KEY, JSON.stringify(session));
      set({ ...session, loginLoading: false });
      return true;
    } catch (err) {
      set({ loginError: err.message, loginLoading: false });
      return false;
    }
  },

  logoutCustomer: () => {
    localStorage.removeItem(CP_SESSION_KEY);
    set({ isLoggedIn: false, customer: null, accessToken: null, refreshToken: null });
  },

  // ── Data Fetchers ───────────────────────────────
  fetchDashboard: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await portalService.getPortalDashboard({ signal: currentAbortController.signal });
      set({ dashboard: res.data !== undefined ? res.data : res, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  fetchOrders: async (params = {}) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyOrders(params, { signal: currentAbortController.signal });
      const d = res.data !== undefined ? res.data : res;
      const items = res.items || d.orders || (Array.isArray(d) ? d : []);
      const total = res.totalRecords || d.total || items.length;
      set({ orders: items, ordersTotal: total, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  fetchOrderDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyOrderDetails(id);
      set({ orderDetails: res.data !== undefined ? res.data : res, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchInvoices: async (params = {}) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyInvoices(params, { signal: currentAbortController.signal });
      const d = res.data !== undefined ? res.data : res;
      const items = res.items || d.invoices || (Array.isArray(d) ? d : []);
      const total = res.totalRecords || d.total || items.length;
      set({ invoices: items, invoicesTotal: total, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  fetchInvoiceDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyInvoiceDetails(id);
      set({ invoiceDetails: res.data !== undefined ? res.data : res, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPayments: async (params = {}) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyPayments(params, { signal: currentAbortController.signal });
      const d = res.data !== undefined ? res.data : res;
      const items = res.items || d.payments || (Array.isArray(d) ? d : []);
      const total = res.totalRecords || d.total || items.length;
      set({ payments: items, paymentsTotal: total, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  fetchOutstanding: async () => {
    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyOutstanding();
      set({ outstanding: res.data !== undefined ? res.data : res, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyProfile();
      set({ profile: res.data !== undefined ? res.data : res, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await portalService.getMyNotifications();
      set({ notifications: res.items || res.data || (Array.isArray(res) ? res : []), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  markNotificationRead: async (id) => {
    try {
      await portalService.markMyNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, status: "Read" } : n
        ),
      }));
    } catch {}
  },
}));
