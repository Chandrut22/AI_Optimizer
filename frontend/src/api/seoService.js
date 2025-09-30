import axios from "axios";
import { getAccessToken } from "@/api/auth.js"; // ✅ Fixed import path

// Agent backend API
const SEO_API = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL,
  withCredentials: true,
});

// ✅ Attach interceptor to inject token
SEO_API.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken(); // always get fresh token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const analyzeSEO = async (url) => {
  try {
    const response = await SEO_API.post("/api/ai/ask", {
      question: url,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "SEO analysis failed" };
  }
};
