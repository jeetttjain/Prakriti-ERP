import { create } from "zustand";
import * as settingsService from "../services/settingsService";

let currentAbortController = null;

/**
 * Zustand store for active configuration Settings.
 * @exports useSettingsStore
 */
export const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  success: null,

  fetchSettings: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await settingsService.getSettings({ signal: currentAbortController.signal });
      set({ settings: res.data || res, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  saveSettings: async (settingsData) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await settingsService.updateSettings(settingsData);
      const updated = res.data || res;
      set({ settings: updated, loading: false, success: "Settings saved successfully" });
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  toggleFeature: async (field, value) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await settingsService.toggleModule(field, value);
      const updated = res.data || res;
      set({ settings: updated, loading: false, success: "Feature toggle updated" });
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  isCategoryEnabled: (category) => {
    const { settings } = get();
    if (!settings) return true;

    const cat = String(category).toLowerCase();
    if (cat.startsWith("veg") && !settings.vegetablesEnabled) return false;
    if (cat.startsWith("fruit") && !settings.fruitsEnabled) return false;
    if (cat.startsWith("dairy") && !settings.dairyEnabled) return false;
    if (cat.startsWith("groc") && !settings.groceryEnabled) return false;
    if (cat.startsWith("bev") && !settings.beveragesEnabled) return false;
    if (cat.startsWith("pack") && !settings.packagingEnabled) return false;

    return true;
  },

  isModuleEnabled: (moduleKey) => {
    const { settings } = get();
    if (!settings || !settings.features) return true;
    return !!settings.features[moduleKey];
  },
}));
