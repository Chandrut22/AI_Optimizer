// src/api/index.js
import axios from "axios";

// ---------------------------
// Base API instance with creds
// ---------------------------
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// ---------------------------
// ✅ CSRF Token Handling
// ---------------------------
let csrfToken = null;
let isFetchingCsrf = false;

async function fetchCsrfToken() {
  if (csrfToken || isFetchingCsrf) return csrfToken;
  isFetchingCsrf = true;

  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/csrf-token`,
      { withCredentials: true }
    );
    csrfToken = data.token;
    return csrfToken;
  } catch (err) {
    console.error("❌ Failed to fetch CSRF token:", err.response?.status);
    // return null instead of retrying forever
    return null;
  } finally {
    isFetchingCsrf = false;
  }
}


// ---------------------------
// ✅ Request Interceptor
// ---------------------------
API.interceptors.request.use(
  async (config) => {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    if (
      csrfToken &&
      ["post", "put", "delete"].includes(config.method?.toLowerCase())
    ) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------
// ✅ Response Interceptor (Token Refresh)
// ---------------------------
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;
      try {
        await API.post("/auth/refresh-token");
        return API(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------
// ✅ Exported API functions
// ---------------------------
export const getCurrentUser = async () => {
  const { data } = await API.get("/auth/me");
  return data;
};

export const loginUser = async (email, password) => {
  try {
    await API.post("/auth/login", { email, password });
    return await getCurrentUser();
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async ({ name, email, password }) => {
  try {
    const { data } = await API.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const verifyEmailCode = async ({ email, code, type }) => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", code);
    formData.append("type", type);

    const { data } = await API.post("/auth/verify-code", formData);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Verification failed" };
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const { data } = await API.post("/auth/resend-reset-code", null, {
      params: { email },
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Resend failed" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const formData = new FormData();
    formData.append("email", email);

    const { data } = await API.post("/auth/forgot-password", formData);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Request failed" };
  }
};

export const setNewPassword = async ({ email, newPassword }) => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("newPassword", newPassword);

    const { data } = await API.post("/auth/set-new-password", formData);
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Reset failed" };
  }
};

export const logoutUser = async () => {
  try {
    const { data } = await API.post("/auth/logout");
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};

export default API;
