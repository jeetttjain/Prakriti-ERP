import { create } from "zustand";
import * as inventoryService from "../services/inventoryService";

let currentAbortController = null;

/**
 * Zustand Store for managing Inventory backend states.
 * Holds active listings, pagination tracking, dashboard stats, and auto data sync.
 * @exports useInventoryStore
 */
export const useInventoryStore = create((set, get) => ({
  inventoryList: [],
  selectedInventory: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  statusFilter: "All",
  locationFilter: "All",
  searchQuery: "",
  
  // Movement History log sub-state
  movements: [],
  movementPage: 1,
  totalMovementPages: 1,
  movementLoading: false,

  // Summary Metrics
  stats: {
    totalProducts: 0,
    totalStock: 0,
    reservedStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  },

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshInventory();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status, currentPage: 1 });
    get().refreshInventory();
  },

  setLocationFilter: (location) => {
    set({ locationFilter: location, currentPage: 1 });
    get().refreshInventory();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshInventory();
  },

  fetchInventory: async (page = 1, status = "All", location = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, currentPage: page, statusFilter: status, locationFilter: location });
    try {
      const statusParam = status === "All" ? "" : status;
      const locationParam = location === "All" ? "" : location;
      const result = await inventoryService.getInventory(page, 8, statusParam, locationParam, { signal: currentAbortController.signal });
      
      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        inventoryList: items,
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

  searchInventory: async (query = "", status = "All", location = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query, statusFilter: status, locationFilter: location });
    if (query.trim() === "") {
      await get().fetchInventory(1, status, location);
      return;
    }
    try {
      const result = await inventoryService.searchInventory(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        inventoryList: items,
        totalPages: 1,
        totalRecords: items.length,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  refreshInventory: async () => {
    const { searchQuery, statusFilter, locationFilter, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchInventory(searchQuery, statusFilter, locationFilter);
    } else {
      await get().fetchInventory(currentPage, statusFilter, locationFilter);
    }
  },

  resetFilters: async () => {
    set({ searchQuery: "", statusFilter: "All", locationFilter: "All", currentPage: 1 });
    await get().fetchInventory(1, "All", "All");
  },

  selectInventory: async (id) => {
    set({ loading: true, error: null, selectedInventory: null });
    try {
      const result = await inventoryService.getInventoryById(id);
      set({ selectedInventory: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedInventory: () => {
    set({ selectedInventory: null });
  },

  registerOpeningStock: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await inventoryService.createOpeningStock(data);
      set({ loading: false, success: "Opening stock recorded" });
      await get().refreshInventory();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  adjustStock: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await inventoryService.adjustInventory(data);
      set({ loading: false, success: "Stock adjusted successfully" });
      await get().refreshInventory();
      
      const { selectedInventory } = get();
      if (selectedInventory && (selectedInventory._id === result.data?._id || selectedInventory.productId?._id === data.productId)) {
        set({ selectedInventory: result.data || result });
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  reserveStock: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await inventoryService.reserveInventory(data);
      set({ loading: false, success: "Stock reserved" });
      await get().refreshInventory();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  releaseStock: async (data) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await inventoryService.releaseReservation(data);
      set({ loading: false, success: "Reservation released" });
      await get().refreshInventory();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchMovementHistory: async (page = 1, params = {}) => {
    set({ movementLoading: true, movementPage: page });
    try {
      const result = await inventoryService.getMovementHistory({ page, limit: 8, ...params });
      const items = result.items || result.data || [];
      set({
        movements: items,
        totalMovementPages: result.totalPages || 1,
        movementLoading: false,
      });
    } catch (err) {
      set({ error: err.message, movementLoading: false });
    }
  },

  calculateStats: async () => {
    try {
      const result = await inventoryService.getInventory(1, 1000);
      const list = result.items || result.data || [];
      const stats = list.reduce(
        (acc, item) => {
          acc.totalProducts += 1;
          acc.totalStock += Number(item.currentStock) || 0;
          acc.reservedStock += Number(item.reservedStock) || 0;
          if (item.stockStatus === "Low Stock") acc.lowStockCount += 1;
          if (item.stockStatus === "Out Of Stock") acc.outOfStockCount += 1;
          return acc;
        },
        { totalProducts: 0, totalStock: 0, reservedStock: 0, lowStockCount: 0, outOfStockCount: 0 }
      );
      set({ stats });
    } catch {}
  },
}));
