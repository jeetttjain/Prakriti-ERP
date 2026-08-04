import { create } from "zustand";
import * as customerService from "../services/customerService";

export const useCustomerStore = create((set, get) => ({
  qrSession: null, // { qrSessionId, restaurant, expiresAt }
  customer: null,
  isAuthenticated: !!localStorage.getItem("prakriti_cp_session"),
  products: [],
  categories: [],
  cart: [], // [{ product, quantity, remarks }]
  orders: [],
  invoices: [],
  favorites: [],
  offers: [],
  loading: false,
  error: null,

  setQRSession: (sessionData) => {
    set({ qrSession: sessionData });
    localStorage.setItem("prakriti_qr_session", JSON.stringify(sessionData));
  },

  scanQRCode: async (qrId, encryptedToken) => {
    set({ loading: true, error: null });
    try {
      const res = await customerService.scanQR(qrId, encryptedToken);
      const data = res.data || res;
      set({ qrSession: data, loading: false });
      localStorage.setItem("prakriti_qr_session", JSON.stringify(data));
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addToCart: (product, quantity = 1, remarks = "") => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product._id === product._id);
    let updatedCart = [...cart];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
      if (remarks) updatedCart[existingIndex].remarks = remarks;
    } else {
      updatedCart.push({ product, quantity, remarks });
    }

    set({ cart: updatedCart });
    localStorage.setItem("prakriti_customer_cart", JSON.stringify(updatedCart));
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    const updatedCart = cart.filter((item) => item.product._id !== productId);
    set({ cart: updatedCart });
    localStorage.setItem("prakriti_customer_cart", JSON.stringify(updatedCart));
  },

  updateCartQuantity: (productId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.product._id === productId ? { ...item, quantity } : item
    );
    set({ cart: updatedCart });
    localStorage.setItem("prakriti_customer_cart", JSON.stringify(updatedCart));
  },

  clearCart: () => {
    set({ cart: [] });
    localStorage.removeItem("prakriti_customer_cart");
  },

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await customerService.getProducts(params);
      const data = res.data || res;
      set({ products: data.items || data.products || data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await customerService.getCategories();
      set({ categories: res.data || res || [] });
    } catch {
      // Ignore
    }
  },

  logout: () => {
    localStorage.removeItem("prakriti_cp_session");
    set({ customer: null, isAuthenticated: false, cart: [] });
  },
}));
