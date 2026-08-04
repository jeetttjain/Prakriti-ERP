import api from "./api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { normalizeError } from "../utils/errors";

export const scanQR = async (qrId, encryptedToken) => {
  try {
    const res = await api.post(API_ENDPOINTS.QR.SCAN, { qrId, encryptedToken });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const sendOTP = async (mobile) => {
  try {
    const res = await api.post(API_ENDPOINTS.AUTH.SEND_OTP, { mobile });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const verifyOTP = async (mobile, otp) => {
  try {
    const res = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { mobile, otp });
    if (res.data?.data?.token) {
      localStorage.setItem("prakriti_cp_session", res.data.data.token);
    }
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getProducts = async (params = {}) => {
  try {
    const res = await api.get(API_ENDPOINTS.PRODUCTS.BASE, { params });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getCategories = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getDashboard = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.DASHBOARD);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const placeOrder = async (orderData) => {
  try {
    const res = await api.post(API_ENDPOINTS.ORDERS.BASE, orderData);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getOrders = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.ORDERS.BASE);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getOrderById = async (id) => {
  try {
    const res = await api.get(API_ENDPOINTS.ORDERS.BY_ID(id));
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getInvoices = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.INVOICES.BASE);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getPayments = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.PAYMENTS);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getOffers = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.OFFERS);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getFavorites = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.FAVORITES.BASE);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const addFavorite = async (productId) => {
  try {
    const res = await api.post(API_ENDPOINTS.FAVORITES.BASE, { productId });
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const removeFavorite = async (productId) => {
  try {
    const res = await api.delete(API_ENDPOINTS.FAVORITES.REMOVE(productId));
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};

export const getProfile = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.PROFILE);
    return res.data;
  } catch (err) {
    throw normalizeError(err);
  }
};
