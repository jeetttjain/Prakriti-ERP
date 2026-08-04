import { create } from "zustand";

const CART_KEY = "prakriti_cp_cart";

const loadCart = () => {
  try {
    const d = localStorage.getItem(CART_KEY);
    return d ? JSON.parse(d) : { items: [], deliveryDate: "", deliverySlot: "Morning", branchId: "", notes: "" };
  } catch {
    return { items: [], deliveryDate: "", deliverySlot: "Morning", branchId: "", notes: "" };
  }
};

const saveCart = (state) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: state.items,
      deliveryDate: state.deliveryDate,
      deliverySlot: state.deliverySlot,
      branchId: state.branchId,
      notes: state.notes,
    }));
  } catch {}
};

/**
 * Zustand cart store with localStorage persistence.
 * Subtotals are display-only — backend always recalculates final totals.
 */
export const useCustomerCartStore = create((set, get) => ({
  ...loadCart(),

  get subtotal() {
    return get().items.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0);
  },

  get itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product._id);
      let items;
      if (existing) {
        const maxQty = product.availableStock ?? Infinity;
        items = state.items.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, maxQty) }
            : i
        );
      } else {
        items = [...state.items, {
          productId: product._id,
          productName: product.productName,
          productCode: product.productCode,
          category: product.category,
          unit: product.unit,
          sellingPrice: product.sellingPrice,
          availableStock: product.availableStock,
          stockStatus: product.stockStatus,
          quantity,
          remarks: "",
        }];
      }
      const next = { ...state, items };
      saveCart(next);
      return next;
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const next = { ...state, items: state.items.filter((i) => i.productId !== productId) };
      saveCart(next);
      return next;
    });
  },

  updateQty: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const next = { ...state, items: state.items.filter((i) => i.productId !== productId) };
        saveCart(next);
        return next;
      }
      const next = {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
      saveCart(next);
      return next;
    });
  },

  updateRemarks: (productId, remarks) => {
    set((state) => {
      const next = { ...state, items: state.items.map((i) => i.productId === productId ? { ...i, remarks } : i) };
      saveCart(next);
      return next;
    });
  },

  setDelivery: (fields) => {
    set((state) => {
      const next = { ...state, ...fields };
      saveCart(next);
      return next;
    });
  },

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    set({ items: [], deliveryDate: "", deliverySlot: "Morning", branchId: "", notes: "" });
  },
}));
