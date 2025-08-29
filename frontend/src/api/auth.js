// src/api/index.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. "https://api.example.com"
  withCredentials: true,                      // send/receive cookies
});

// ---------------------------
// CSRF handling
// ---------------------------
let csrfToken = null;
let isFetching = false;

function getCookie(name) {
  // Minimal cookie reader for non-HTTPOnly cookies
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

async function fetchCsrfToken(force = false) {
  if (csrfToken && !force) return csrfToken;
  if (isFetching) return csrfToken;

  isFetching = true;
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/csrf-token`,
      { withCredentials: true }
    );
    // Prefer body; fallback to cookie if needed
    csrfToken = data?.token || getCookie("XSRF-TOKEN") || null;
    return csrfToken;
  } finally {
    isFetching = false;
  }
}

// ---------------------------
// Request interceptor
// ---------------------------
API.interceptors.request.use(
  async (config) => {
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      if (!csrfToken) await fetchCsrfToken();
      if (csrfToken) {
        config.headers = config.headers || {};
        config.headers["X-CSRF-TOKEN"] = csrfToken;  // matches SecurityConfig
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------
// Response interceptor
// ---------------------------
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const resp = error.response;
    const original = error.config;

    // If no response (network error), just bubble up
    if (!resp || !original) return Promise.reject(error);

    // Avoid infinite loops
    if (original._retry) return Promise.reject(error);

    // Helper to replay exactly the same request
    const replay = () =>
      API.request({
        url: original.url,
        method: original.method,
        headers: original.headers,
        params: original.params,
        data: original.data,
        withCredentials: true,
      });

    // 401 → try refresh (POST, never GET)
    if (resp.status === 401 && original.url !== "/auth/refresh-token") {
      original._retry = true;
      try {
        // Ensure CSRF header for refresh
        if (!csrfToken) await fetchCsrfToken(true);
        await API.post("/auth/refresh-token", null, {
          headers: csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {},
          withCredentials: true,
        });
        // Optionally re-fetch CSRF (not strictly required)
        await fetchCsrfToken(true);
        return replay();
      } catch (e) {
        return Promise.reject(e);
      }
    }

    // 403 → CSRF mismatch → refresh token then replay once
    if (resp.status === 403 && !original._csrfRetry) {
      original._csrfRetry = true;
      await fetchCsrfToken(true);
      // ensure header present on replay if it’s a mutating call
      const method = (original.method || "get").toLowerCase();
      if (["post", "put", "patch", "delete"].includes(method) && csrfToken) {
        original.headers = original.headers || {};
        original.headers["X-CSRF-TOKEN"] = csrfToken;
      }
      return replay();
    }

    return Promise.reject(error);
  }
);

// ---------------------------
// API helpers
// ---------------------------
export const getCurrentUser = async () => {
  const { data } = await API.get("/auth/me");
  return data;
};

export const loginUser = async (email, password) => {
  // fetch CSRF first to avoid the very first POST failing
  await fetchCsrfToken();
  await API.post("/auth/login", { email, password });
  return getCurrentUser();
};

export const registerUser = async ({ name, email, password }) => {
  await fetchCsrfToken();
  const { data } = await API.post("/auth/register", { name, email, password });
  return data;
};

export const verifyEmailCode = async ({ email, code, type }) => {
  await fetchCsrfToken();
  const form = new FormData();
  form.append("email", email);
  form.append("code", code);
  form.append("type", type);
  const { data } = await API.post("/auth/verify-code", form);
  return data;
};

export const resendVerificationCode = async (email) => {
  await fetchCsrfToken();
  const { data } = await API.post("/auth/resend-reset-code", null, { params: { email } });
  return data;
};

export const forgotPassword = async (email) => {
  await fetchCsrfToken();
  const form = new FormData();
  form.append("email", email);
  const { data } = await API.post("/auth/forgot-password", form);
  return data;
};

export const setNewPassword = async ({ email, newPassword }) => {
  await fetchCsrfToken();
  const form = new FormData();
  form.append("email", email);
  form.append("newPassword", newPassword);
  const { data } = await API.post("/auth/set-new-password", form);
  return data;
};

export const logoutUser = async () => {
  await fetchCsrfToken();
  const { data } = await API.post("/auth/logout");
  return data;
};

export default API;
