import { create } from "zustand";
import * as userService from "../services/userService";

let currentAbortController = null;

/**
 * Zustand user store.
 * @exports useUserStore
 */
export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,
  success: null,

  fetchUsers: async () => {
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    set({ loading: true, error: null });
    try {
      const res = await userService.getUsers({ signal: currentAbortController.signal });
      const items = res.items || res.data || (Array.isArray(res) ? res : []);
      set({ users: items, loading: false });
    } catch (err) {
      if (err?.isCanceled) return;
      set({ error: err.message, loading: false });
    }
  },

  addUser: async (userData) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await userService.createUser(userData);
      set({ loading: false, success: "User created successfully" });
      await get().fetchUsers();
      return res.data || res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyUser: async (id, userData) => {
    set({ loading: true, error: null, success: null });
    try {
      const res = await userService.updateUser(id, userData);
      set({ loading: false, success: "User updated successfully" });
      await get().fetchUsers();
      return res.data || res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeUser: async (id) => {
    set({ loading: true, error: null, success: null });
    try {
      await userService.deleteUser(id);
      set({ loading: false, success: "User removed successfully" });
      await get().fetchUsers();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  resetUserPassword: async (userId, newPassword) => {
    set({ loading: true, error: null, success: null });
    try {
      await userService.resetPassword(userId, newPassword);
      set({ loading: false, success: "Password reset successfully" });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
