import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080"

const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle token refresh
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await authClient.post("/refresh-token")
        const { accessToken } = response.data
        localStorage.setItem("access_token", accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return authClient(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("access_token")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

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
  role: "USER" | "ADMIN"
  verified: boolean
  credits?: number
  createdAt: string
}

export interface VerificationData {
  email: string
  code: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  email: string
  code: string
  newPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  message: string
}

export const authApi = {
  // Registration
  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await authClient.post("/register", data)
    return response.data
  },

  // Email Verification
  verify: async (data: VerificationData): Promise<AuthResponse> => {
    const response = await authClient.post("/verify", data)
    if (response.data.accessToken) {
      localStorage.setItem("access_token", response.data.accessToken)
    }
    return response.data
  },

  // Resend verification code
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await authClient.post("/resend-verification", { email })
    return response.data
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authClient.post("/login", credentials)
    if (response.data.accessToken) {
      localStorage.setItem("access_token", response.data.accessToken)
    }
    return response.data
  },

  // Google OAuth2
  googleLogin: async (): Promise<string> => {
    const response = await authClient.get("/google")
    return response.data.url
  },

  handleGoogleCallback: async (code: string): Promise<AuthResponse> => {
    const response = await authClient.post("/google/callback", { code })
    if (response.data.accessToken) {
      localStorage.setItem("access_token", response.data.accessToken)
    }
    return response.data
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await authClient.post("/forgot-password", data)
    return response.data
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await authClient.post("/reset-password", data)
    return response.data
  },

  // Token Refresh
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await authClient.post("/refresh-token")
    return response.data
  },

  // Logout
  logout: async (): Promise<void> => {
    await authClient.post("/logout")
    localStorage.removeItem("access_token")
  },

  // Get Current User
  getCurrentUser: async (): Promise<User> => {
    const response = await authClient.get("/me")
    return response.data
  },

  // Update Profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await authClient.put("/profile", data)
    return response.data
  },
}

// Admin API
const adminClient = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for admin client
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await adminClient.get("/users")
    return response.data
  },

  // Promote user to admin
  promoteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await adminClient.post(`/promote/${userId}`)
    return response.data
  },

  // Delete user
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await adminClient.delete(`/delete/${userId}`)
    return response.data
  },
}
