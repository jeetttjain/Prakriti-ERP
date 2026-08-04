import { create } from "zustand";
import * as roleService from "../services/roleService";

let currentAbortController = null;

/**
 * Zustand role store.
 * @exports useRoleStore
 */
export const useRoleStore = create((set, get) => ({
  roles: [],
  loading: false,
  error: null,
  success: null,

  fetchRoles: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await roleService.getRoles({ signal: currentAbortController.signal });
      const items = res.items || res.data || (Array.isArray(res) ? res : []);
      set({ roles: items, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  addRole: async (roleData) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await roleService.createRole(roleData);
      set({ loading: false, success: "Role created successfully" });
      await get().fetchRoles();
      return res.data || res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyRole: async (id, roleData) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await roleService.updateRole(id, roleData);
      set({ loading: false, success: "Role updated successfully" });
      await get().fetchRoles();
      return res.data || res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeRole: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      await roleService.deleteRole(id);
      set({ loading: false, success: "Role removed successfully" });
      await get().fetchRoles();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
