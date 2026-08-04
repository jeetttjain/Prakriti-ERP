import { create } from "zustand";
import * as paymentService from "../services/paymentService";

let currentAbortController = null;

/**
 * Payment State Store definition.
 * Handles payment CRUD lifecycle, pagination, filtering, searches, and auto data sync.
 * @exports usePaymentStore
 */
export const usePaymentStore = create((set, get) => ({
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  // Filters State
  statusFilter: "All",
  methodFilter: "All",
  typeFilter: "All",
  customerFilter: "All",
  startDateFilter: "",
  endDateFilter: "",
  searchQuery: "",

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshPayments();
  },

  setFilters: (filters) => {
    set((state) => ({
      ...state,
      ...filters,
      currentPage: 1
    }));
    get().refreshPayments();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshPayments();
  },

  fetchPayments: async (page = 1) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    const {
      statusFilter,
      methodFilter,
      typeFilter,
      customerFilter,
      startDateFilter,
      endDateFilter
    } = get();

    const filters = {
      status: statusFilter,
      method: methodFilter,
      type: typeFilter,
      customer: customerFilter,
      startDate: startDateFilter,
      endDate: endDateFilter
    };

    try {
      const result = await paymentService.getPayments(page, 8, filters, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        payments: items,
        totalPages,
        totalRecords,
        currentPage: page,
        loading: false
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  searchPayments: async (query = "") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query });
    if (query.trim() === "") {
      const { currentPage } = get();
      await get().fetchPayments(currentPage);
      return;
    }

    try {
      const result = await paymentService.searchPayments(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        payments: items,
        totalPages: 1,
        totalRecords: items.length,
        currentPage: 1,
        loading: false
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  refreshPayments: async () => {
    const { searchQuery, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchPayments(searchQuery);
    } else {
      await get().fetchPayments(currentPage);
    }
  },

  resetFilters: async () => {
    set({
      searchQuery: "",
      statusFilter: "All",
      methodFilter: "All",
      typeFilter: "All",
      customerFilter: "All",
      startDateFilter: "",
      endDateFilter: "",
      currentPage: 1
    });
    await get().fetchPayments(1);
  },

  selectPayment: async (id) => {
    set({ loading: true, error: null, selectedPayment: null });
    try {
      const result = await paymentService.getPaymentById(id);
      set({ selectedPayment: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedPayment: () => {
    set({ selectedPayment: null });
  },

  registerPayment: async (paymentData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await paymentService.createPayment(paymentData);
      set({ loading: false, success: "Payment recorded successfully" });
      await get().refreshPayments();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyPayment: async (id, paymentData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await paymentService.updatePayment(id, paymentData);
      set({ loading: false, success: "Payment updated successfully" });
      await get().refreshPayments();
      if (get().selectedPayment?._id === id) {
        await get().selectPayment(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  changePaymentStatus: async (id, statusData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await paymentService.updatePaymentStatus(id, statusData);
      set({ loading: false, success: "Payment status updated" });
      await get().refreshPayments();
      if (get().selectedPayment?._id === id) {
        await get().selectPayment(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  archivePayment: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      await paymentService.deletePayment(id);
      set({ loading: false, success: "Payment archived" });
      await get().refreshPayments();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));

export default usePaymentStore;
