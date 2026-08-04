import axios from "axios";

/**
 * Normalizes an Axios/HTTP error into a consistent object structure matching response.service.js
 * @param {Error|Object} error The raw error caught in a try/catch block
 * @returns {Object} Normalized error details: { isCanceled: boolean, message: string, status: number|null, errors: any, payload: any }
 */
export const normalizeError = (error) => {
  if (axios.isCancel(error) || error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
    return {
      isCanceled: true,
      message: "Request canceled",
      status: null,
      errors: null,
      payload: null
    };
  }

  const normalized = {
    isCanceled: false,
    message: "An unexpected system error occurred.",
    status: null,
    errors: null,
    payload: null
  };

  if (error && error.response) {
    normalized.status = error.response.status;
    normalized.payload = error.response.data;
    normalized.message =
      error.response.data?.message ||
      error.response.data?.error ||
      `HTTP request failed with code ${error.response.status}`;
    normalized.errors = error.response.data?.errors || null;
  } else if (error && error.request) {
    normalized.message = "No response received from the server. Please check your network connection.";
  } else if (error && error.message) {
    normalized.message = error.message;
  }

  return normalized;
};
