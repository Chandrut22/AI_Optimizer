import axios from "axios";

// Create an Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Important for sending HttpOnly cookies
});

// ✅ Add interceptor to handle token refresh on 401
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
        await API.post("/auth/refresh-token"); // ✅ FIXED

        return API(originalRequest); // retry original request
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

export const loginUser = async (email, password) => {
  try {
    await API.post("/auth/login", { email, password });
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await API.post("/auth/register", { name, email, password });
    return response.data;
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

    const response = await API.post("/auth/verify-code", formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Verification failed" };
  }
};

export const resendVerificationCode = async (email) => {
  try {
    const response = await API.post("/auth/resend-reset-code", null, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Resend failed" };
  }
};

export const forgotPassword = async (email) => {
  try {
    const formData = new FormData();
    formData.append("email", email);

    const response = await API.post("/auth/forgot-password", formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Request failed" };
  }
};

export const setNewPassword = async ({ email, newPassword }) => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("newPassword", newPassword);

    const response = await API.post("/auth/set-new-password", formData);
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
