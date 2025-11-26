import axios from "axios";
// Remove the import for getAccessToken as it doesn't exist and isn't needed for cookie-based auth
// import { getAccessToken } from "@/api/auth.js"; 

// Agent backend API
const SEO_API = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL,
  withCredentials: true, // This ensures cookies (access_token) are sent with the request
});

// ✅ Removed the interceptor that tried to inject a non-existent token
// The browser will handle sending the cookies automatically.

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