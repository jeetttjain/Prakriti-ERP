import { create } from "zustand";
import * as orderService from "../services/orderService";

let currentAbortController = null;

/**
 * Order State Store definition.
 * Handles order CRUD lifecycle, pagination, filtering, searches, and auto data sync.
 * @exports useOrderStore
 */
export const useOrderStore = create((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  // Filters State
  statusFilter: "All",
  paymentStatusFilter: "All",
  deliveryStatusFilter: "All",
  customerFilter: "All",
  startDateFilter: "",
  endDateFilter: "",
  searchQuery: "",

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshOrders();
  },

  setFilters: (filters) => {
    set((state) => ({
      ...state,
      ...filters,
      currentPage: 1
    }));
    get().refreshOrders();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshOrders();
  },

  fetchOrders: async (page = 1) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    const {
      statusFilter,
      paymentStatusFilter,
      deliveryStatusFilter,
      customerFilter,
      startDateFilter,
      endDateFilter
    } = get();

    const filters = {
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      deliveryStatus: deliveryStatusFilter,
      customer: customerFilter,
      startDate: startDateFilter,
      endDate: endDateFilter
    };

    try {
      const result = await orderService.getOrders(page, 8, filters, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        orders: items,
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

  searchOrders: async (query = "") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query });
    if (query.trim() === "") {
      const { currentPage } = get();
      await get().fetchOrders(currentPage);
      return;
    }

    try {
      const result = await orderService.searchOrders(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        orders: items,
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

  refreshOrders: async () => {
    const { searchQuery, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchOrders(searchQuery);
    } else {
      await get().fetchOrders(currentPage);
    }
  },

  resetFilters: async () => {
    set({
      searchQuery: "",
      statusFilter: "All",
      paymentStatusFilter: "All",
      deliveryStatusFilter: "All",
      customerFilter: "All",
      startDateFilter: "",
      endDateFilter: "",
      currentPage: 1
    });
    await get().fetchOrders(1);
  },

  selectOrder: async (id) => {
    set({ loading: true, error: null, selectedOrder: null });
    try {
      const result = await orderService.getOrderById(id);
      set({ selectedOrder: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedOrder: () => {
    set({ selectedOrder: null });
  },

  registerOrder: async (orderData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await orderService.createOrder(orderData);
      set({ loading: false, success: "Order created successfully" });
      await get().refreshOrders();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyOrder: async (id, orderData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await orderService.updateOrder(id, orderData);
      set({ loading: false, success: "Order updated successfully" });
      await get().refreshOrders();
      if (get().selectedOrder?._id === id) {
        await get().selectOrder(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  changeOrderStatus: async (id, statusData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await orderService.updateOrderStatus(id, statusData);
      set({ loading: false, success: "Order status updated" });
      await get().refreshOrders();
      if (get().selectedOrder?._id === id) {
        await get().selectOrder(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  archiveOrder: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      await orderService.deleteOrder(id);
      set({ loading: false, success: "Order archived successfully" });
      await get().refreshOrders();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
