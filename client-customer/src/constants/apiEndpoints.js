export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/customer-portal/auth/login",
    REFRESH: "/customer-portal/auth/refresh",
    SEND_OTP: "/customer-portal/auth/send-otp",
    VERIFY_OTP: "/customer-portal/auth/verify-otp",
  },
  QR: {
    SCAN: "/customer-portal/qr/scan",
  },
  DASHBOARD: "/customer-portal/dashboard",
  PRODUCTS: {
    BASE: "/customer-portal/products",
    BY_ID: (id) => `/customer-portal/products/${id}`,
    CATEGORIES: "/customer-portal/categories",
  },
  ORDERS: {
    BASE: "/customer-portal/orders",
    BY_ID: (id) => `/customer-portal/orders/${id}`,
    REORDER: (id) => `/customer-portal/orders/${id}/reorder`,
  },
  INVOICES: {
    BASE: "/customer-portal/invoices",
    BY_ID: (id) => `/customer-portal/invoices/${id}`,
  },
  PAYMENTS: "/customer-portal/payments",
  OUTSTANDING: "/customer-portal/outstanding",
  PROFILE: "/customer-portal/profile",
  NOTIFICATIONS: {
    BASE: "/customer-portal/notifications",
    READ: (id) => `/customer-portal/notifications/${id}/read`,
  },
  OFFERS: "/customer-portal/offers",
  FAVORITES: {
    BASE: "/customer-portal/favorites",
    REMOVE: (productId) => `/customer-portal/favorites/${productId}`,
  },
  SUPPORT: "/customer-portal/support",
};
