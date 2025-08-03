import axios from "axios";

// Create an Axios instance with base URL and cookie support
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // allows HttpOnly cookies to be sent
});

// ✅ 1. Fetch currently logged-in user
export const getCurrentUser = async () => {
    const response = await API.get("/auth/me");
    return response.data; // should contain { id, name, email, ... }
};

// ✅ 2. Login and then fetch user info
export const loginUser = async (email, password) => {
  try {
    // Step 1: Login (cookie set by backend)
    await API.post("/auth/login", { email, password });

    // Step 2: Fetch user using /auth/me
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// ✅ 3. Register user
export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await API.post("/auth/register", { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

// ✅ 4. Verify email code
export const verifyEmailCode = async ({ email, code, type }) => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", code);
    formData.append("type", type); // "register" or "reset"

    const response = await API.post("/auth/verify-code", formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Verification failed" };
  }
};

// ✅ 5. Resend verification code
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

// ✅ 6. Forgot password
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

// ✅ 7. Set new password
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

// ✅ 8. Logout
export const logoutUser = async () => {
  try {
    const response = await API.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};
