import axios from "axios";

// Access environment variable injected by Vite
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default API;