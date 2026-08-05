import { create } from "zustand";
import * as dashboardService from "../services/dashboardService";

let currentAbortController = null;

export const useDashboardStore = create((set, get) => ({
  overview: null,
  kpis: null,
  charts: null,
  activity: null,
  alerts: null,
  health: null,
  loading: false,
  error: null,
  lastUpdated: null,

  // Global Filter State
  filters: {
    timeframe: "all", // today, thisWeek, thisMonth, thisYear, all
    startDate: "",
    endDate: "",
    branchId: "",
    warehouseId: "",
    categoryId: "",
  },

  // Personalization settings
  widgetOrder: ["kpis", "charts", "salesAnalytics", "inventoryAnalytics", "financeAnalytics", "alerts", "activity", "health"],
  hiddenWidgets: {
    kpis: false,
    charts: false,
    salesAnalytics: false,
    inventoryAnalytics: false,
    financeAnalytics: false,
    alerts: false,
    activity: false,
    health: false,
  },

  setFilter: (key, value) => {
    const updatedFilters = { ...get().filters, [key]: value };
    set({ filters: updatedFilters });
    get().fetchDashboard();
  },

  resetFilters: () => {
    set({
      filters: {
        timeframe: "all",
        startDate: "",
        endDate: "",
        branchId: "",
        warehouseId: "",
        categoryId: "",
      },
    });
    get().fetchDashboard();
  },

  setWidgetOrder: async (order) => {
    const { hiddenWidgets } = get();
    set({ widgetOrder: order });
    try {
      await dashboardService.updatePreferences({ order, hidden: hiddenWidgets });
    } catch {}
  },

  toggleWidgetVisibility: async (widgetId, isVisible) => {
    const { widgetOrder, hiddenWidgets } = get();
    const updatedHidden = { ...hiddenWidgets, [widgetId]: !isVisible };
    set({ hiddenWidgets: updatedHidden });
    try {
      await dashboardService.updatePreferences({ order: widgetOrder, hidden: updatedHidden });
    } catch {}
  },

  fetchPreferences: async () => {
    try {
      const res = await dashboardService.getPreferences();
      const prefs = res.data || res;
      if (prefs.order) set({ widgetOrder: prefs.order });
      if (prefs.hidden) set({ hiddenWidgets: prefs.hidden });
    } catch {}
  },

  fetchDashboard: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const config = { signal: currentAbortController.signal };
      
      const [overview, kpis, charts, activity, alerts, health] = await Promise.all([
        dashboardService.getOverview(filters, config),
        dashboardService.getKPIs(filters, config),
        dashboardService.getCharts(filters, config),
        dashboardService.getActivity(filters, config),
        dashboardService.getAlerts(filters, config),
        dashboardService.getHealth({}, config),
      ]);

      set({
        overview: overview.data !== undefined ? overview.data : overview,
        kpis: kpis.data !== undefined ? kpis.data : kpis,
        charts: charts.data !== undefined ? charts.data : charts,
        activity: activity.data !== undefined ? activity.data : activity,
        alerts: alerts.data !== undefined ? alerts.data : alerts,
        health: health.data !== undefined ? health.data : health,
        loading: false,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  clearCache: async () => {
    try {
      await dashboardService.clearCache();
      await get().fetchDashboard();
    } catch {}
  },
}));
