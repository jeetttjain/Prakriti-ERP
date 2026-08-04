import { create } from "zustand";
import * as customerService from "../services/customerService";

let currentAbortController = null;

/**
 * Customer State Store definition.
 * Handles customer listing, editing, searching, pagination, status filters, and auto data sync.
 * @exports useCustomerStore
 */
export const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  statusFilter: "All",
  paymentCycleFilter: "All",
  searchQuery: "",

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshCustomers();
  },

  setFilters: (filter) => {
    set({ statusFilter: filter, currentPage: 1 });
    get().refreshCustomers();
  },

  setPaymentCycleFilter: (paymentCycle) => {
    set({ paymentCycleFilter: paymentCycle, currentPage: 1 });
    get().refreshCustomers();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshCustomers();
  },

  fetchCustomers: async (page = 1, status = "All", paymentCycle = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, currentPage: page, statusFilter: status, paymentCycleFilter: paymentCycle });
    try {
      const statusParam = status === "All" ? "" : status;
      const cycleParam = paymentCycle === "All" ? "" : paymentCycle;
      const result = await customerService.getCustomers(page, 8, statusParam, cycleParam, { signal: currentAbortController.signal });

      const items = result.items || result.data || [];
      const totalPages = result.totalPages || (result.data ? 1 : 1);
      const totalRecords = result.totalRecords || items.length;

      set({
        customers: items,
        totalPages,
        totalRecords,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  searchCustomers: async (query = "", status = "All", paymentCycle = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query, statusFilter: status, paymentCycleFilter: paymentCycle });
    if (query.trim() === "") {
      await get().fetchCustomers(1, status, paymentCycle);
      return;
    }
    try {
      const result = await customerService.searchCustomers(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        customers: items,
        totalPages: 1,
        totalRecords: items.length,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  refreshCustomers: async () => {
    const { searchQuery, statusFilter, paymentCycleFilter, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchCustomers(searchQuery, statusFilter, paymentCycleFilter);
    } else {
      await get().fetchCustomers(currentPage, statusFilter, paymentCycleFilter);
    }
  },

  resetFilters: async () => {
    set({ searchQuery: "", statusFilter: "All", paymentCycleFilter: "All", currentPage: 1 });
    await get().fetchCustomers(1, "All", "All");
  },

  selectCustomer: async (id) => {
    set({ loading: true, error: null, selectedCustomer: null });
    try {
      const result = await customerService.getCustomerById(id);
      set({ selectedCustomer: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedCustomer: () => {
    set({ selectedCustomer: null });
  },

  registerCustomer: async (customerData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await customerService.createCustomer(customerData);
      set({ loading: false, success: "Customer registered successfully" });
      await get().refreshCustomers();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyCustomer: async (id, customerData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await customerService.updateCustomer(id, customerData);
      set({ loading: false, success: "Customer updated successfully" });
      await get().refreshCustomers();
      if (get().selectedCustomer?._id === id) {
        await get().selectCustomer(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  changeCustomerStatus: async (id, newStatus) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await customerService.updateCustomerStatus(id, newStatus);
      set({ loading: false, success: `Status changed to ${newStatus}` });
      await get().refreshCustomers();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
