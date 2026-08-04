import { create } from "zustand";
import * as orderService from "../services/customerOrderService";

let currentAbortController = null;

/**
 * Manages draft order list and active reorder state for the customer portal.
 */
export const useCustomerOrderStore = create((set, get) => ({
  drafts: [],
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
  submitSuccess: null,

  fetchDrafts: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await orderService.getDraftOrders({ signal: currentAbortController.signal });
      const items = res.items || res.data || (Array.isArray(res) ? res : []);
      set({ drafts: items, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  submitOrder: async (payload) => {
    set({ submitting: true, submitError: null, submitSuccess: null });
    try {
      const res = await orderService.placeOrder(payload);
      const order = res.data || res;
      set({ submitting: false, submitSuccess: order });
      await get().fetchDrafts();
      return order;
    } catch (err) {
      set({ submitError: err.message, submitting: false });
      return null;
    }
  },

  updateDraft: async (id, payload) => {
    set({ submitting: true, submitError: null });
    try {
      const res = await orderService.updateDraftOrder(id, payload);
      const updated = res.data || res;
      set({ submitting: false });
      await get().fetchDrafts();
      return updated;
    } catch (err) {
      set({ submitError: err.message, submitting: false });
      return null;
    }
  },

  deleteDraft: async (id) => {
    try {
      await orderService.deleteDraftOrder(id);
      await get().fetchDrafts();
    } catch (err) {
      set({ error: err.message });
    }
  },

  reorder: async (id) => {
    set({ submitting: true, submitError: null });
    try {
      const res = await orderService.reorder(id);
      const newDraft = res.data?.order || res.data || res;
      set({ submitting: false });
      await get().fetchDrafts();
      return newDraft;
    } catch (err) {
      set({ submitError: err.message, submitting: false });
      return null;
    }
  },

  clearSubmitState: () => set({ submitError: null, submitSuccess: null }),
}));
