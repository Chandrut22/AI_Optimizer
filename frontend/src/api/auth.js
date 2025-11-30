import axios from "axios";

// Create an Axios instance
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Response Interceptor for Token Refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      (status === 401 || status === 403) &&
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

// --- User Endpoints ---
export const getCurrentUser = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

// --- Auth Endpoints ---
export const loginUser = async (email, password) => {
  const authResponse = await API.post("/auth/authenticate", { email, password });
  const user = await getCurrentUser();
  return { 
    ...user, 
    hasSelectedTier: authResponse.data.has_selected_tier 
  };
};
export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await API.post("/auth/register", { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

// ✅ FIXED: Support both registration verify and password reset verify
export const verifyEmailCode = async ({ email, code, type }) => {
  try {
    // Uses separate endpoint for reset to avoid "Account already verified" error
    const endpoint = type === "reset" ? "/auth/verify-reset-code" : "/auth/verify";
    const response = await API.post(endpoint, { email, code });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Verification failed" };
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const response = await API.post("/auth/resend-verification", null, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Resend failed" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Request failed" };
  }
};

export const setNewPassword = async ({ email, code, newPassword }) => {
  try {
    const response = await API.post("/auth/reset-password", { 
      email, 
      code, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Reset failed" };
  }
};

export const logoutUser = async () => {
  try {
    const response = await API.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};


export const selectTier = async (tier) => {
  try {
    const response = await API.post("/users/select-tier", { tier });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to select tier" };
  }
};

export const getUsageStatus = async () => {
  try {
    const response = await API.get("/usage/status"); 
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tier data" };
}
};

export const getScanHistory = async () => {
  try {
    const response = await API.get("/users/history"); 
    return response.data;
  } catch (error) {
    console.error("Error fetching scan history:", error);
    throw error;
  }
};
