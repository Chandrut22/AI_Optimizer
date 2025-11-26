import axios from "axios";

// Create an Axios instance
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Important for sending HttpOnly cookies
});

// ✅ Add interceptor to handle token refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Check for 401 (Unauthorized) OR 403 (Forbidden)
    // Spring Security returns 403 for missing tokens by default
    if (
      (status === 401 || status === 403) && 
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh-token"
    ) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token using the HttpOnly refresh_token cookie
        await API.post("/auth/refresh-token"); 

        // Retry the original request with the new access token
        return API(originalRequest); 
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, let the error bubble up (AuthContext will redirect to login)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export const getCurrentUser = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const loginUser = async (email, password) => {
    await API.post("/auth/authenticate", { email, password });
    const user = await getCurrentUser();
    return user;
};

export const registerUser = async ({ name, email, password }) => {
    const response = await API.post("/auth/register", { name, email, password });
    return response.data;
};

export const verifyEmailCode = async ({ email, code }) => {
  try {
    // If the type is 'register', we call the account verification endpoint.
    // The backend expects { email: "...", code: "..." }
    const response = await API.post("/auth/verify", { email, code });
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
    const response = await API.post("/auth/forgot-password", { email });
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

export const getAccessToken = async () => {
  try {
    const response = await API.get("/auth/access-token");
    return response.data.access_token; // assuming { accessToken: "..." }
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch access token" };
  }
};
