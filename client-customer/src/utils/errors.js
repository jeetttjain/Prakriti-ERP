import axios from "axios";

export const normalizeError = (error) => {
  if (axios.isCancel(error) || error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
    return { isCanceled: true, message: "Request canceled" };
  }
  let message = "An unexpected error occurred.";
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }
  return { isCanceled: false, message };
};
