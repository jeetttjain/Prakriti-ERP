import axios from "axios";

/**
 * Global Axios Instance configured with Vite environment variables, authorization header selection,
 * timeout, auto-refresh token logic, and error interceptors.
 * @module api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const isPortalRoute = config.url && config.url.includes("/customer-portal");

    if (isPortalRoute) {
      try {
        const cpSession = localStorage.getItem("prakriti_cp_session");
        if (cpSession) {
          const { accessToken } = JSON.parse(cpSession);
          if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch { }
    } else {
      try {
        const adminSession = localStorage.getItem("prakriti_auth_session");
        if (adminSession) {
          const { accessToken } = JSON.parse(adminSession);
          if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch { }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple simultaneous refresh calls
let isRefreshingAdmin = false;
let isRefreshingPortal = false;
let adminRefreshSubscribers = [];
let portalRefreshSubscribers = [];

const subscribeTokenRefresh = (cb, isPortal) => {
  if (isPortal) portalRefreshSubscribers.push(cb);
  else adminRefreshSubscribers.push(cb);
};

const onRefreshed = (token, isPortal) => {
  if (isPortal) {
    portalRefreshSubscribers.forEach((cb) => cb(token));
    portalRefreshSubscribers = [];
  } else {
    adminRefreshSubscribers.forEach((cb) => cb(token));
    adminRefreshSubscribers = [];
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Token Expiration with Refresh Token fallback
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      const isPortalRoute = originalRequest.url && originalRequest.url.includes("/customer-portal");

      // Avoid infinite loop if refresh request itself failed
      if (originalRequest.url.includes("/auth/refresh")) {
        if (isPortalRoute) {
          localStorage.removeItem("prakriti_cp_session");
          if (window.location.pathname !== "/portal/login") {
            window.location.href = "/portal/login";
          }
        } else {
          localStorage.removeItem("prakriti_auth_session");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isPortalRoute) {
        const cpSessionRaw = localStorage.getItem("prakriti_cp_session");
        if (!cpSessionRaw) return Promise.reject(error);

        try {
          const cpSession = JSON.parse(cpSessionRaw);
          const refreshToken = cpSession?.refreshToken;
          if (!refreshToken) throw new Error("No refresh token");

          if (!isRefreshingPortal) {
            isRefreshingPortal = true;
            axios
              .post(`${api.defaults.baseURL}/customer-portal/auth/refresh`, { refreshToken })
              .then((res) => {
                isRefreshingPortal = false;
                const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
                if (newAccessToken) {
                  const updatedSession = { ...cpSession, accessToken: newAccessToken };
                  localStorage.setItem("prakriti_cp_session", JSON.stringify(updatedSession));
                  onRefreshed(newAccessToken, true);
                }
              })
              .catch((err) => {
                isRefreshingPortal = false;
                portalRefreshSubscribers = [];
                localStorage.removeItem("prakriti_cp_session");
                if (window.location.pathname !== "/portal/login") {
                  window.location.href = "/portal/login";
                }
              });
          }

          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            }, true);
          });
        } catch {
          localStorage.removeItem("prakriti_cp_session");
          if (window.location.pathname !== "/portal/login") {
            window.location.href = "/portal/login";
          }
          return Promise.reject(error);
        }
      } else {
        const adminSessionRaw = localStorage.getItem("prakriti_auth_session");
        if (!adminSessionRaw) return Promise.reject(error);

        try {
          const adminSession = JSON.parse(adminSessionRaw);
          const refreshToken = adminSession?.refreshToken;
          if (!refreshToken) throw new Error("No refresh token");

          if (!isRefreshingAdmin) {
            isRefreshingAdmin = true;
            axios
              .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
              .then((res) => {
                isRefreshingAdmin = false;
                const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
                if (newAccessToken) {
                  const updatedSession = { ...adminSession, accessToken: newAccessToken };
                  localStorage.setItem("prakriti_auth_session", JSON.stringify(updatedSession));
                  onRefreshed(newAccessToken, false);
                }
              })
              .catch((err) => {
                isRefreshingAdmin = false;
                adminRefreshSubscribers = [];
                localStorage.removeItem("prakriti_auth_session");
                if (window.location.pathname !== "/login") {
                  window.location.href = "/login";
                }
              });
          }

          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            }, false);
          });
        } catch {
          localStorage.removeItem("prakriti_auth_session");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;