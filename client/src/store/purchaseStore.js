import { create } from "zustand";
import * as purchaseService from "../services/purchaseService";

let currentAbortController = null;

/**
 * Zustand Store for coordinating Purchase replenishment console state.
 * @exports usePurchaseStore
 */
export const usePurchaseStore = create((set, get) => ({
  purchases: [],
  selectedPurchase: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  statusFilter: "All",
  supplierFilter: "All",
  searchQuery: "",

  stats: {
    totalPurchases: 0,
    receivedCount: 0,
    pendingCount: 0,
    totalSpent: 0,
  },

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshPurchases();
  },

  setFilters: (status) => {
    set({ statusFilter: status, currentPage: 1 });
    get().refreshPurchases();
  },

  setSupplierFilter: (supplier) => {
    set({ supplierFilter: supplier, currentPage: 1 });
    get().refreshPurchases();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshPurchases();
  },

  fetchPurchases: async (page = 1, status = "All", supplier = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, currentPage: page, statusFilter: status, supplierFilter: supplier });
    try {
      const statusParam = status === "All" ? "" : status;
      const supplierParam = supplier === "All" ? "" : supplier;
      const result = await purchaseService.getPurchases(page, 8, statusParam, supplierParam, { signal: currentAbortController.signal });

      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        purchases: items,
        totalPages,
        totalRecords,
        loading: false,
      });
      get().calculateStats();
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  searchPurchases: async (query = "", status = "All", supplier = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query, statusFilter: status, supplierFilter: supplier });
    if (query.trim() === "") {
      await get().fetchPurchases(1, status, supplier);
      return;
    }
    try {
      const result = await purchaseService.searchPurchases(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        purchases: items,
        totalPages: 1,
        totalRecords: items.length,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  refreshPurchases: async () => {
    const { searchQuery, statusFilter, supplierFilter, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchPurchases(searchQuery, statusFilter, supplierFilter);
    } else {
      await get().fetchPurchases(currentPage, statusFilter, supplierFilter);
    }
  },

  resetFilters: async () => {
    set({ searchQuery: "", statusFilter: "All", supplierFilter: "All", currentPage: 1 });
    await get().fetchPurchases(1, "All", "All");
  },

  selectPurchase: async (id) => {
    set({ loading: true, error: null, selectedPurchase: null });
    try {
      const result = await purchaseService.getPurchaseById(id);
      set({ selectedPurchase: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedPurchase: () => {
    set({ selectedPurchase: null });
  },

  addPurchase: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await purchaseService.createPurchase(data);
      set({ loading: false, success: "Purchase order created successfully" });
      await get().refreshPurchases();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyPurchase: async (id, data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await purchaseService.updatePurchase(id, data);
      set({ loading: false, success: "Purchase order updated successfully" });
      await get().refreshPurchases();
      if (get().selectedPurchase?._id === id) {
        await get().selectPurchase(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cancelPO: async (id, user) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await purchaseService.cancelPurchase(id, user);
      set({ loading: false, success: "Purchase order cancelled" });
      await get().refreshPurchases();
      if (get().selectedPurchase?._id === id) {
        await get().selectPurchase(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  receivePO: async (id, user) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await purchaseService.receivePurchase(id, user);
      set({ loading: false, success: "Goods received and inventory replenished" });
      await get().refreshPurchases();
      if (get().selectedPurchase?._id === id) {
        await get().selectPurchase(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  calculateStats: async () => {
    try {
      const result = await purchaseService.getPurchases(1, 1000);
      const list = result.items || result.data || [];
      const stats = list.reduce(
        (acc, item) => {
          acc.totalPurchases += 1;
          if (item.purchaseStatus === "Received") {
            acc.receivedCount += 1;
            acc.totalSpent += Number(item.grandTotal) || 0;
          } else if (item.purchaseStatus === "Ordered" || item.purchaseStatus === "Draft") {
            acc.pendingCount += 1;
          }
          return acc;
        },
        { totalPurchases: 0, receivedCount: 0, pendingCount: 0, totalSpent: 0 }
      );
      set({ stats });
    } catch {}
  },
}));
