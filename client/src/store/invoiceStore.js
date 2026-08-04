import { create } from "zustand";
import * as invoiceService from "../services/invoiceService";

let currentAbortController = null;

/**
 * Invoice State Store definition.
 * Handles invoice CRUD lifecycle, pagination, filtering, searches, and auto data sync.
 * @exports useInvoiceStore
 */
export const useInvoiceStore = create((set, get) => ({
  invoices: [],
  selectedInvoice: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  // Filters State
  statusFilter: "All",
  paymentStatusFilter: "All",
  customerFilter: "All",
  startDateFilter: "",
  endDateFilter: "",
  searchQuery: "",

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshInvoices();
  },

  setFilters: (filters) => {
    set((state) => ({
      ...state,
      ...filters,
      currentPage: 1
    }));
    get().refreshInvoices();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshInvoices();
  },

  fetchInvoices: async (page = 1) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    const {
      statusFilter,
      paymentStatusFilter,
      customerFilter,
      startDateFilter,
      endDateFilter
    } = get();

    const filters = {
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      customer: customerFilter,
      startDate: startDateFilter,
      endDate: endDateFilter
    };

    try {
      const result = await invoiceService.getInvoices(page, 8, filters, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        invoices: items,
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

  searchInvoices: async (query = "") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query });
    if (query.trim() === "") {
      const { currentPage } = get();
      await get().fetchInvoices(currentPage);
      return;
    }

    try {
      const result = await invoiceService.searchInvoices(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        invoices: items,
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

  refreshInvoices: async () => {
    const { searchQuery, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchInvoices(searchQuery);
    } else {
      await get().fetchInvoices(currentPage);
    }
  },

  resetFilters: async () => {
    set({
      searchQuery: "",
      statusFilter: "All",
      paymentStatusFilter: "All",
      customerFilter: "All",
      startDateFilter: "",
      endDateFilter: "",
      currentPage: 1
    });
    await get().fetchInvoices(1);
  },

  selectInvoice: async (id) => {
    set({ loading: true, error: null, selectedInvoice: null });
    try {
      const result = await invoiceService.getInvoiceById(id);
      set({ selectedInvoice: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedInvoice: () => {
    set({ selectedInvoice: null });
  },

  registerInvoice: async (invoiceData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await invoiceService.createInvoice(invoiceData);
      set({ loading: false, success: "Invoice created successfully" });
      await get().refreshInvoices();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyInvoice: async (id, invoiceData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await invoiceService.updateInvoice(id, invoiceData);
      set({ loading: false, success: "Invoice updated successfully" });
      await get().refreshInvoices();
      if (get().selectedInvoice?._id === id) {
        await get().selectInvoice(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  changeInvoiceStatus: async (id, statusData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await invoiceService.updateInvoiceStatus(id, statusData);
      set({ loading: false, success: "Invoice status updated" });
      await get().refreshInvoices();
      if (get().selectedInvoice?._id === id) {
        await get().selectInvoice(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  archiveInvoice: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      await invoiceService.deleteInvoice(id);
      set({ loading: false, success: "Invoice archived" });
      await get().refreshInvoices();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));

export default useInvoiceStore;
