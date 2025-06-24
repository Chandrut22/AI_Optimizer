import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080"

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await authClient.post("/login", credentials)
    return response.data
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await authClient.post("/register", userData)
    return response.data
  },

  logout: async () => {
    await authClient.post("/logout")
  },

  getCurrentUser: async () => {
    const response = await authClient.get("/me")
    return response.data
  },

  updateProfile: async (userData: { name?: string; email?: string }) => {
    const response = await authClient.put("/profile", userData)
    return response.data
  },
}
