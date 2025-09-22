// src/services/seoService.js
import axios from "axios";

const SEO_API = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL,
  withCredentials: true,
});

export const analyzeSEO = async (url) => {
  try {
    const response = await SEO_API.post("/ai/ai/ask", {
      question: url,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "SEO analysis failed" };
  }
};
