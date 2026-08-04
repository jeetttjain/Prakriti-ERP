import { create } from "zustand";
import * as notificationService from "../services/notificationService";

let currentAbortController = null;

/**
 * Zustand notification store.
 * @exports useNotificationStore
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  templates: [],
  loading: false,
  error: null,
  success: null,
  filters: {
    status: "",
    channel: "",
    module: "",
    search: "",
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchNotifications();
  },

  resetFilters: () => {
    set({ filters: { status: "", channel: "", module: "", search: "" } });
    get().fetchNotifications();
  },

  fetchNotifications: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    const { filters } = get();
    set({ loading: true, error: null });
    try {
      const res = await notificationService.getNotifications(filters, { signal: currentAbortController.signal });
      const items = res.items || res.data || (Array.isArray(res) ? res : []);
      set({ notifications: items, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      const res = await notificationService.getTemplates();
      set({ templates: res.data || res });
    } catch {}
  },

  dispatchNotification: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await notificationService.sendNotification(id);
      const updated = res.data || res;
      set((state) => ({
        notifications: state.notifications.map((n) => (n._id === id ? updated : n)),
        loading: false,
        success: "Notification dispatched",
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  retryNotification: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await notificationService.retryNotification(id);
      const updated = res.data || res;
      set((state) => ({
        notifications: state.notifications.map((n) => (n._id === id ? updated : n)),
        loading: false,
        success: "Notification queued for retry",
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cancelNotification: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await notificationService.cancelNotification(id);
      const updated = res.data || res;
      set((state) => ({
        notifications: state.notifications.map((n) => (n._id === id ? updated : n)),
        loading: false,
        success: "Notification cancelled",
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
