import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async ({ name, email, password }) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};

export const verifyEmailCode = async ({ email, code, type }) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("code", code);
  formData.append("type", type); // "register" or "reset"

  const response = await API.post("/auth/verify-code", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const resendVerificationCode = async (email) => {
  const response = await API.post(`/auth/resend-reset-code`, null, {
    params: { email },
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const formData = new FormData();
  formData.append("email", email);

  const response = await API.post("/auth/forgot-password", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const setNewPassword = async ({ email, newPassword }) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("newPassword", newPassword);

  const response = await API.post("/auth/set-new-password", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
