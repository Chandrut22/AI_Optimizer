"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  authApi,
  type User,
  type LoginCredentials,
  type RegisterData,
  type VerificationData,
  type ForgotPasswordData,
  type ResetPasswordData,
} from "../services/auth-api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ user: User; message: string }>
  register: (data: RegisterData) => Promise<{ message: string }>
  verify: (data: VerificationData) => Promise<{ user: User; message: string }>
  resendVerification: (email: string) => Promise<{ message: string }>
  forgotPassword: (data: ForgotPasswordData) => Promise<{ message: string }>
  resetPassword: (data: ResetPasswordData) => Promise<{ message: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      checkAuthStatus()
    }
  }, [isClient])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      localStorage.removeItem("access_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    setUser(response.user)
    return { user: response.user, message: response.message }
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    return response
  }

  const verify = async (data: VerificationData) => {
    const response = await authApi.verify(data)
    setUser(response.user)
    return { user: response.user, message: response.message }
  }

  const resendVerification = async (email: string) => {
    const response = await authApi.resendVerification(email)
    return response
  }

  const forgotPassword = async (data: ForgotPasswordData) => {
    const response = await authApi.forgotPassword(data)
    return response
  }

  const resetPassword = async (data: ResetPasswordData) => {
    const response = await authApi.resetPassword(data)
    return response
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      setUser(userData)
    } catch (error) {
      setUser(null)
    }
  }

  const isAdmin = user?.role === "ADMIN"

  // Don't render children until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        verify,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
