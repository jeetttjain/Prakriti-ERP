import { create } from "zustand";
import * as auditService from "../services/auditService";

let currentAbortController = null;

export const useAuditStore = create((set, get) => ({
  auditLogs: [],
  stats: {
    totalActivities: 0,
    todayActivities: 0,
    failedLogins: 0,
    totalExports: 0,
    recent: [],
  },
  selectedLog: null,
  entityHistory: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,

  // Active Filter state
  moduleFilter: "All",
  actionTypeFilter: "All",
  searchQuery: "",
  startDateFilter: "",
  endDateFilter: "",

  setFilters: (newFilters) => {
    set((state) => ({ ...state, ...newFilters, currentPage: 1 }));
    get().fetchAuditLogs(1);
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchAuditLogs(page);
  },

  fetchAuditLogs: async (page = 1) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });

    const { moduleFilter, actionTypeFilter, searchQuery, startDateFilter, endDateFilter } = get();
    const filters = {
      module: moduleFilter !== "All" ? moduleFilter : undefined,
      actionType: actionTypeFilter !== "All" ? actionTypeFilter : undefined,
      search: searchQuery || undefined,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
    };

    try {
      const res = await auditService.getAuditLogs(page, 20, filters, {
        signal: currentAbortController.signal,
      });

      const payload = res.data || res.items || res;
      set({
        auditLogs: payload.items || payload.data || payload || [],
        currentPage: payload.page || page,
        totalPages: payload.totalPages || 1,
        totalRecords: payload.totalRecords || 0,
        loading: false,
      });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message || "Failed to load audit log activity.", loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await auditService.getAuditStats();
      set({ stats: res.data || res });
    } catch {
      // Ignore stats error
    }
  },

  fetchEntityHistory: async (entity, entityId) => {
    try {
      const res = await auditService.getEntityHistory(entity, entityId);
      set({ entityHistory: res.data || res });
    } catch {
      set({ entityHistory: [] });
    }
  },

  setSelectedLog: (log) => {
    set({ selectedLog: log });
  },
}));
