import { create } from "zustand";
import * as productService from "../services/productService";

let currentAbortController = null;

/**
 * Product State Store definition.
 * Handles product listing, editing, searching, pagination, filters, and auto data sync.
 * @exports useProductStore
 */
export const useProductStore = create((set, get) => ({
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  statusFilter: "All",
  categoryFilter: "All",
  searchQuery: "",

  setPagination: (page) => {
    set({ currentPage: page });
    get().refreshProducts();
  },

  setFilters: (filter) => {
    set({ statusFilter: filter, currentPage: 1 });
    get().refreshProducts();
  },

  setCategoryFilter: (category) => {
    set({ categoryFilter: category, currentPage: 1 });
    get().refreshProducts();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().refreshProducts();
  },

  fetchProducts: async (page = 1, status = "All", category = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, currentPage: page, statusFilter: status, categoryFilter: category });
    try {
      const statusParam = status === "All" ? "" : status;
      const categoryParam = category === "All" ? "" : category;
      const result = await productService.getProducts(page, 8, statusParam, categoryParam, { signal: currentAbortController.signal });

      const items = result.items || result.data || [];
      const totalPages = result.totalPages || 1;
      const totalRecords = result.totalRecords || items.length;

      set({
        products: items,
        totalPages,
        totalRecords,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  searchProducts: async (query = "", status = "All", category = "All") => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null, searchQuery: query, statusFilter: status, categoryFilter: category });
    if (query.trim() === "") {
      await get().fetchProducts(1, status, category);
      return;
    }
    try {
      const result = await productService.searchProducts(query, { signal: currentAbortController.signal });
      const items = result.items || result.data || [];
      set({
        products: items,
        totalPages: 1,
        totalRecords: items.length,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  refreshProducts: async () => {
    const { searchQuery, statusFilter, categoryFilter, currentPage } = get();
    if (searchQuery.trim() !== "") {
      await get().searchProducts(searchQuery, statusFilter, categoryFilter);
    } else {
      await get().fetchProducts(currentPage, statusFilter, categoryFilter);
    }
  },

  resetFilters: async () => {
    set({ searchQuery: "", statusFilter: "All", categoryFilter: "All", currentPage: 1 });
    await get().fetchProducts(1, "All", "All");
  },

  selectProduct: async (id) => {
    set({ loading: true, error: null, selectedProduct: null });
    try {
      const result = await productService.getProductById(id);
      set({ selectedProduct: result.data || result, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearSelectedProduct: () => {
    set({ selectedProduct: null });
  },

  registerProduct: async (productData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await productService.createProduct(productData);
      set({ loading: false, success: "Product created successfully" });
      await get().refreshProducts();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyProduct: async (id, productData) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await productService.updateProduct(id, productData);
      set({ loading: false, success: "Product updated successfully" });
      await get().refreshProducts();
      if (get().selectedProduct?._id === id) {
        await get().selectProduct(id);
      }
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  changeProductStatus: async (id, newStatus) => {
    set({ loading: true, error: null, success: null });
    try {
      const result = await productService.updateProductStatus(id, newStatus);
      set({ loading: false, success: `Status updated to ${newStatus}` });
      await get().refreshProducts();
      return result;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
