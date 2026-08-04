import { create } from "zustand";
import * as reportService from "../services/reportService";

const SAVED_VIEWS_KEY = "erp_saved_reports";
let currentAbortController = null;

/**
 * Zustand Store for coordinating Reports queries, filters, auto-refresh timers, and saved presets.
 * @exports useReportStore
 */
export const useReportStore = create((set, get) => ({
  selectedReport: "dashboard",
  loading: false,
  error: null,
  reportData: null,
  autoRefreshInterval: "Off",

  filters: {
    rangeType: "Week",
    startDate: "",
    endDate: "",
    customerId: "",
    supplierId: "",
    productId: "",
    category: "",
    orderStatus: "",
    paymentStatus: "",
    purchaseStatus: "",
  },

  savedViews: (() => {
    try {
      const stored = localStorage.getItem(SAVED_VIEWS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),

  setSelectedReport: (report) => {
    set({ selectedReport: report, error: null });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setAutoRefreshInterval: (interval) => {
    set({ autoRefreshInterval: interval });
  },

  resetFilters: () => {
    set({
      filters: {
        rangeType: "Week",
        startDate: "",
        endDate: "",
        customerId: "",
        supplierId: "",
        productId: "",
        category: "",
        orderStatus: "",
        paymentStatus: "",
        purchaseStatus: "",
      },
    });
  },

  fetchReportData: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    const { selectedReport, filters } = get();
    set({ loading: true, error: null });
    try {
      let res;
      const config = { signal: currentAbortController.signal };
      switch (selectedReport) {
        case "dashboard":
          res = await reportService.getDashboardSummary(filters, config);
          break;
        case "sales":
          res = await reportService.getSalesReport(filters, config);
          break;
        case "purchase":
          res = await reportService.getPurchaseReport(filters, config);
          break;
        case "inventory":
          res = await reportService.getInventoryReport(filters, config);
          break;
        case "customer":
          res = await reportService.getCustomerReport(filters, config);
          break;
        case "supplier":
          res = await reportService.getSupplierReport(filters, config);
          break;
        case "payment":
          res = await reportService.getPaymentReport(filters, config);
          break;
        case "outstanding":
          res = await reportService.getOutstandingReport(filters, config);
          break;
        case "product":
          res = await reportService.getProductPerformanceReport(filters, config);
          break;
        default:
          throw new Error("Invalid report selection.");
      }

      set({ reportData: res.data !== undefined ? res.data : res, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  saveCurrentView: (viewName) => {
    const { selectedReport, filters, savedViews } = get();
    const newView = {
      reportName: viewName,
      selectedReport,
      selectedFilters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedViews, newView];
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(updated));
    set({ savedViews: updated });
  },

  loadSavedView: (view) => {
    set({
      selectedReport: view.selectedReport,
      filters: { ...view.selectedFilters },
    });
  },

  deleteSavedView: (viewName) => {
    const { savedViews } = get();
    const updated = savedViews.filter((v) => v.reportName !== viewName);
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(updated));
    set({ savedViews: updated });
  },
}));
