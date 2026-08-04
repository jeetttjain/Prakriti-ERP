import { create } from "zustand";
import * as automationService from "../services/automationService";

let currentAbortController = null;

export const useAutomationStore = create((set, get) => ({
  rules: [],
  executions: [],
  stats: {
    totalRules: 0,
    activeRules: 0,
    totalExecutions: 0,
    failedExecutions: 0,
  },
  health: {
    queue: { runningJobs: 0, pendingJobs: 0, completedJobs: 0, failedJobs: 0 },
    scheduler: { status: "ACTIVE", isPaused: false },
  },
  selectedRule: null,
  selectedExecution: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  // Filters
  moduleFilter: "All",
  triggerFilter: "All",
  searchQuery: "",

  setFilters: (newFilters) => {
    set((state) => ({ ...state, ...newFilters, currentPage: 1 }));
    get().fetchRules(1);
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchRules(page);
  },

  fetchRules: async (page = 1) => {
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    const { moduleFilter, triggerFilter } = get();

    try {
      const res = await automationService.getRules(page, 20, {
        module: moduleFilter !== "All" ? moduleFilter : undefined,
        trigger: triggerFilter !== "All" ? triggerFilter : undefined,
      }, { signal: currentAbortController.signal });

      const payload = res.data || res;
      set({
        rules: payload.items || payload.data || [],
        currentPage: payload.page || page,
        totalPages: payload.totalPages || 1,
        totalRecords: payload.totalRecords || 0,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message || "Failed to load rules.", loading: false });
    }
  },

  fetchExecutions: async (page = 1) => {
    try {
      const res = await automationService.getExecutions(page, 20);
      const payload = res.data || res;
      set({ executions: payload.items || payload.data || [] });
    } catch {
      // Ignore
    }
  },

  fetchStatsAndHealth: async () => {
    try {
      const [statsRes, healthRes] = await Promise.all([
        automationService.getStats(),
        automationService.getHealth(),
      ]);
      set({
        stats: statsRes.data || statsRes,
        health: healthRes.data || healthRes,
      });
    } catch {
      // Ignore
    }
  },

  toggleRuleState: async (id) => {
    try {
      await automationService.toggleRule(id);
      await get().fetchRules(get().currentPage);
      await get().fetchStatsAndHealth();
    } catch (err) {
      set({ error: err.message });
    }
  },

  runRuleManually: async (id) => {
    try {
      await automationService.runRuleManual(id);
      await get().fetchExecutions(1);
    } catch (err) {
      set({ error: err.message });
    }
  },

  cloneRule: async (id) => {
    try {
      await automationService.cloneRule(id);
      await get().fetchRules(1);
    } catch (err) {
      set({ error: err.message });
    }
  },

  setSelectedRule: (rule) => set({ selectedRule: rule }),
  setSelectedExecution: (execution) => set({ selectedExecution: execution }),
}));
