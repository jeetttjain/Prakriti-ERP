import { create } from "zustand";
import * as supplierService from "../services/supplierService";

let currentAbortController = null;

/**
 * Zustand Store for coordinating Supplier console state.
 * @exports useSupplierStore
 */
export const useSupplierStore = create((set, get) => ({
  suppliers: [],
  selectedSupplier: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  statusFilter: "All",
  categoryFilter: "All",
  searchQuery: "",

  stats: {
    totalSuppliers: 0,
    activeCount: 0,
    categoriesCount: 0,
  },

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshSuppliers();
  },

  setFilters: (status) => {
    set({ statusFilter: status, currentPage: 1 });
    get().refreshSuppliers();
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category, currentPage: 1 });
    get().refreshSuppliers();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshSuppliers();
  },

  fetchSuppliers: async (page = 1, status = "All", category = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, currentPage: page, statusFilter: status, categoryFilter: category });
    try {
      const statusParam = status === "All" ? "" : status;
      const categoryParam = category === "All" ? "" : category;
      const result = await supplierService.getSuppliers(page, 8, statusParam, categoryParam, { signal: currentAbortController.signal });

      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        suppliers: items,
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

  searchSuppliers: async (query = "", status = "All", category = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query, statusFilter: status, categoryFilter: category });
    if (query.trim() === "") {
      await get().fetchSuppliers(1, status, category);
      return;
    }
    try {
      const result = await supplierService.searchSuppliers(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        suppliers: items,
        totalPages: 1,
        totalRecords: items.length,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  refreshSuppliers: async () => {
    const { searchQuery, statusFilter, categoryFilter, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchSuppliers(searchQuery, statusFilter, categoryFilter);
    } else {
      await get().fetchSuppliers(currentPage, statusFilter, categoryFilter);
    }
  },

  resetFilters: async () => {
    set({ searchQuery: "", statusFilter: "All", categoryFilter: "All", currentPage: 1 });
    await get().fetchSuppliers(1, "All", "All");
  },

  selectSupplier: async (id) => {
    set({ loading: true, error: null, selectedSupplier: null });
    try {
      const result = await supplierService.getSupplierById(id);
      set({ selectedSupplier: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedSupplier: () => {
    set({ selectedSupplier: null });
  },

  addSupplier: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await supplierService.createSupplier(data);
      set({ loading: false, success: "Supplier created successfully" });
      await get().refreshSuppliers();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifySupplier: async (id, data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await supplierService.updateSupplier(id, data);
      set({ loading: false, success: "Supplier updated successfully" });
      await get().refreshSuppliers();
      if (get().selectedSupplier?._id === id) {
        await get().selectSupplier(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeSupplier: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      await supplierService.deleteSupplier(id);
      set({ loading: false, success: "Supplier deleted successfully" });
      await get().refreshSuppliers();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  calculateStats: async () => {
    try {
      const result = await supplierService.getSuppliers(1, 1000);
      const list = result.items || result.data || [];
      const stats = list.reduce(
        (acc, item) => {
          acc.totalSuppliers += 1;
          if (item.status === "Active") acc.activeCount += 1;
          acc.categories.add(item.supplierCategory || "Other");
          return acc;
        },
        { totalSuppliers: 0, activeCount: 0, categories: new Set() }
      );
      set({
        stats: {
          totalSuppliers: stats.totalSuppliers,
          activeCount: stats.activeCount,
          categoriesCount: stats.categories.size,
        },
      });
    } catch {}
  },
}));
