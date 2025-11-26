import axios from "axios";
import { API } from "./auth"; // Your existing axios instance with credentials

const SEO_API = axios.create({
  baseURL: import.meta.env.VITE_AGENT_URL,
});

export const analyzeSEO = async (url) => {
  try {
    // 1. Call your new Backend endpoint to get the token
    // (The browser automatically sends the HttpOnly cookie to authenticate this request)
    const tokenResponse = await API.get("/auth/token");
    const accessToken = tokenResponse.data.access_token;

    // 2. Send the token in the header to the Python Agent
    const response = await SEO_API.post("/api/ai/ask", 
      { url: url },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data;

  } catch (error) {
    console.error("SEO Analysis Error:", error);
    throw error.response?.data || { message: "SEO analysis failed" };
  }
};