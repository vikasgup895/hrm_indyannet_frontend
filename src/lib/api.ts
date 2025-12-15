import axios from "axios";

// 🌍 Define base URL clearly before axios.create()
const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://hrm.indyanet.com/api"
    : "http://localhost:4000/api";

// 🧱 Create axios instance
export const api = axios.create({
  baseURL,
  withCredentials: false, // ✅ since we're using JWT in headers
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

/**
 * ✅ Request Interceptor
 * Automatically attaches JWT from localStorage (or cookies)
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        document.cookie
          ?.split("; ")
          ?.find((r) => r.startsWith("authToken="))
          ?.split("=")[1] ||
        null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ [API] Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

/**
 * ✅ Response Interceptor
 * Handles 401 Unauthorized globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      setTimeout(() => {
        window.location.href = "/login";
      }, 300);
    }

    return Promise.reject(error);
  }
);

/**
 * 🚀 Startup Log
 */
// API initialized
