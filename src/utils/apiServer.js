// src/utils/apiServer.js
import axios from "axios";
import toast from "react-hot-toast";

// ✅ Base API URL (local dev / prod change accordingly)
// const baseURL = "http://localhost:8000";

const baseURL = "https://gbgreenguidebackend-production.up.railway.app"; 





// ✅ Toast helper
const showToast = (type, message) => {
  if (type === "success") toast.success(message);
  if (type === "error") toast.error(message);
};

/**
 * Centralized API handler
 *
 * @param {string} method - HTTP method ("get" | "post" | "put" | "delete")
 * @param {string} api - API endpoint (without baseURL)
 * @param {object} data - Request body (for post/put) or query params (for get/delete)
 * @param {object} options - Extra configs
 *   @param {boolean} [options.tokenRequired=false] - Attach token if true
 *   @param {boolean} [options.showNotification=true] - Show success toast
 *   @param {boolean} [options.showErrorNotification=true] - Show error toast
 */
const apiServer = async (
  method = "get",
  api,
  data = {},
  {
    tokenRequired = false,
    showNotification = true,
    showErrorNotification = true,
  } = {}
) => {
  try {
    // ✅ Validate API path
    if (!api || typeof api !== "string") {
      throw new Error("Invalid API route provided to apiServer");
    }

    // ✅ Token from localStorage (managed by AuthContext)
    const storedData = localStorage.getItem("userData");
    const parsedData = storedData ? JSON.parse(storedData) : null;
    const accessToken = parsedData?.token || null;

    // ✅ Final URL (safe join)
    const finalUrl = `${baseURL}${api}`;

    // Debugging console
    console.log("🛰️ API Request =>", {
      method,
      url: finalUrl,
      tokenAttached: tokenRequired && !!accessToken,
      payload: data,
    });

    // ✅ Axios config
    const config = {
      method,
      url: finalUrl,
      headers: {},
      // data: ["post", "put"].includes(method) ? data : null,
      data: ["post", "put", "patch"].includes(method) ? data : null,

      params: ["get", "delete"].includes(method) ? data : null,
      withCredentials: true, // 🔑 important if cookies/session also used
    };

    // ✅ Attach token only if required
    if (tokenRequired && accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // ✅ API call
    const response = await axios(config);

    // ✅ Success notification
    if (showNotification) {
      const msg =
        response?.data?.message ||
        response?.data?.detail ||
        "Request completed successfully!";
      showToast("success", msg);
    }

    return response.data;
  } catch (error) {
    let errorMessage = "An unknown error occurred. Please try again.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (showErrorNotification) {
      showToast("error", errorMessage);
    }

    // Debugging error console
    console.error("❌ API Error =>", {
      api,
      message: errorMessage,
      error,
    });

    // ❌ Re-throw error so caller can handle if needed
    throw error;
  }
};

export default apiServer;
