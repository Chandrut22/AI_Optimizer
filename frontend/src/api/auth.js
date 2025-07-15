import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });
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

export const verifyEmail = async ({ email, code }) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("code", code);

  const response = await API.post("/auth/verify", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const resendVerificationCode = async (email) => {
  const response = await API.post(`/auth/resend-verification-code`, null, {
    params: { email },
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const formData = new FormData();
  formData.append("email", email);
  const response = await API.post("/auth/forgot-password", formData);
  return response.data;
};