import { create } from "zustand";
import * as biService from "../services/businessIntelligenceService";

export const useBusinessIntelligenceStore = create((set, get) => ({
  overview: null,
  recommendations: [],
  sales: null,
  inventory: null,
  customers: null,
  suppliers: null,
  finance: null,
  purchases: null,
  alerts: null,
  healthScore: null,
  loading: false,
  error: null,
  lastUpdated: null,

  filters: {
    category: "",
    severity: "",
    status: "Active",
  },

  setFilter: (key, value) => {
    set({ filters: { ...get().filters, [key]: value } });
    get().fetchRecommendations();
  },

  fetchBIConsole: async () => {
    set({ loading: true, error: null });
    try {
      const [overview, recs, sales, inventory, customers, suppliers, finance, purchases, alerts] = await Promise.all([
        biService.getOverview(),
        biService.getRecommendations(get().filters),
        biService.getSalesIntelligence(),
        biService.getInventoryIntelligence(),
        biService.getCustomerIntelligence(),
        biService.getSupplierIntelligence(),
        biService.getFinancialIntelligence(),
        biService.getPurchaseIntelligence(),
        biService.getAlerts(),
      ]);

      set({
        overview: overview.data || overview,
        recommendations: recs.data || recs,
        sales: sales.data || sales,
        inventory: inventory.data || inventory,
        customers: customers.data || customers,
        suppliers: suppliers.data || suppliers,
        finance: finance.data || finance,
        purchases: purchases.data || purchases,
        alerts: alerts.data || alerts,
        healthScore: (overview.data || overview).healthScore,
        loading: false,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchRecommendations: async () => {
    try {
      const res = await biService.getRecommendations(get().filters);
      set({ recommendations: res.data || res });
    } catch {}
  },

  resolveRec: async (id, notes) => {
    try {
      await biService.resolveRecommendation(id, notes);
      await get().fetchBIConsole();
    } catch (err) {
      set({ error: err.message });
    }
  },

  archiveRec: async (id) => {
    try {
      await biService.archiveRecommendation(id);
      await get().fetchBIConsole();
    } catch (err) {
      set({ error: err.message });
    }
  },
}));
