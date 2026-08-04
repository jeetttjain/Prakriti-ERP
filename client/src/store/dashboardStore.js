import { create } from "zustand";
import * as dashboardService from "../services/dashboardService";

const LAYOUT_KEY = "erp_dashboard_layout";
let currentAbortController = null;

/**
 * Zustand Store for coordinating dashboard state and layouts.
 * @exports useDashboardStore
 */
export const useDashboardStore = create((set, get) => ({
  overview: null,
  kpis: null,
  charts: null,
  activity: null,
  alerts: null,
  loading: false,
  error: null,

  // Personalization settings
  widgetOrder: (() => {
    try {
      const stored = localStorage.getItem(LAYOUT_KEY);
      if (stored) {
        const layout = JSON.parse(stored);
        if (layout.order) return layout.order;
      }
    } catch {}
    return ["kpis", "charts", "alerts", "activity", "status"];
  })(),

  hiddenWidgets: (() => {
    try {
      const stored = localStorage.getItem(LAYOUT_KEY);
      if (stored) {
        const layout = JSON.parse(stored);
        if (layout.hidden) return layout.hidden;
      }
    } catch {}
    return {
      kpis: false,
      charts: false,
      alerts: false,
      activity: false,
      status: false,
    };
  })(),

  setWidgetOrder: (order) => {
    const { hiddenWidgets } = get();
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ order, hidden: hiddenWidgets }));
    set({ widgetOrder: order });
  },

  toggleWidgetVisibility: (widgetId, isVisible) => {
    const { widgetOrder, hiddenWidgets } = get();
    const updatedHidden = { ...hiddenWidgets, [widgetId]: !isVisible };
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ order: widgetOrder, hidden: updatedHidden }));
    set({ hiddenWidgets: updatedHidden });
  },

  fetchDashboard: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const config = { signal: currentAbortController.signal };
      const [overview, kpis, charts, activity, alerts] = await Promise.all([
        dashboardService.getOverview(config),
        dashboardService.getKPIs(config),
        dashboardService.getCharts(config),
        dashboardService.getActivity(config),
        dashboardService.getAlerts(config),
      ]);

      set({
        overview: overview.data !== undefined ? overview.data : overview,
        kpis: kpis.data !== undefined ? kpis.data : kpis,
        charts: charts.data !== undefined ? charts.data : charts,
        activity: activity.data !== undefined ? activity.data : activity,
        alerts: alerts.data !== undefined ? alerts.data : alerts,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },
}));
