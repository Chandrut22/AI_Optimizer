import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080"

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  name: string
  credits?: number
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await authClient.post("/login", credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await authClient.post("/register", data)
    return response.data
  },

  // Add Google OAuth methods
  googleLogin: async (): Promise<string> => {
    // Returns the Google OAuth URL
    const response = await authClient.get("/google")
    return response.data.url
  },

  handleGoogleCallback: async (code: string): Promise<User> => {
    const response = await authClient.post("/google/callback", { code })
    return response.data
  },

  logout: async (): Promise<void> => {
    await authClient.post("/logout")
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await authClient.get("/me")
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await authClient.put("/profile", data)
    return response.data
  },
}
