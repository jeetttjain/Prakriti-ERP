import { create } from "zustand";
import * as authService from "../services/authService";

const STORAGE_KEY = "prakriti_auth_session";

const getStoredSession = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { isAdminLoggedIn: false, currentUser: null, accessToken: null, refreshToken: null };
  try {
    return JSON.parse(data);
  } catch {
    return { isAdminLoggedIn: false, currentUser: null, accessToken: null, refreshToken: null };
  }
};

/**
 * Zustand authentication store managing credentials, active session context, and permissions guards.
 * @exports useAuthStore
 */
export const useAuthStore = create((set, get) => ({
  ...getStoredSession(),
  loading: false,
  error: null,

  setSession: (sessionData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    set(sessionData);
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ isAdminLoggedIn: false, currentUser: null, accessToken: null, refreshToken: null });
  },

  loginAdmin: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(username, password);
      const session = {
        isAdminLoggedIn: true,
        currentUser: res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      set(session);
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  logoutAdmin: async () => {
    const { refreshToken } = get();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {}
    localStorage.removeItem(STORAGE_KEY);
    set({ isAdminLoggedIn: false, currentUser: null, accessToken: null, refreshToken: null });
  },

  fetchProfile: async () => {
    try {
      const res = await authService.getProfile();
      const { isAdminLoggedIn, accessToken, refreshToken } = get();
      
      // Update permissions in localStorage cache user object
      const updatedUser = {
        _id: res.data._id,
        name: res.data.name,
        userCode: res.data.userCode,
        email: res.data.email,
        role: res.data.roleId?.roleName || "User",
        permissions: res.data.roleId?.permissions || {},
        mustChangePassword: res.data.mustChangePassword,
      };

      const session = { isAdminLoggedIn, accessToken, refreshToken, currentUser: updatedUser };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      set(session);
    } catch {}
  },

  /**
   * Evaluates if the current authenticated context permits the given action in a module.
   */
  hasPermission: (moduleName, action) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    if (currentUser.role === "Owner") return true;

    // Check specific module and action value
    const perms = currentUser.permissions || {};
    const modPerm = perms[moduleName];
    if (!modPerm) return false;
    return !!modPerm[action];
  },

  /**
   * Evaluates if the current user has access to view a module sidebar item.
   */
  hasModuleAccess: (moduleName) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    if (currentUser.role === "Owner") return true;

    const perms = currentUser.permissions || {};
    const modPerm = perms[moduleName];
    if (!modPerm) return false;
    return Object.values(modPerm).some((val) => !!val);
  },
}));
