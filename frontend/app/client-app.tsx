"use client"

import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../context/auth-context"
import { ProtectedRoute } from "../components/protected-route"
import HomePage from "../pages/home"
import LoginPage from "../pages/login"
import RegisterPage from "../pages/register"
import DashboardPage from "../pages/dashboard"
import ProfilePage from "../pages/profile"
import SEOOptimizerPage from "../pages/seo-optimizer"
import GEOOptimizerPage from "../pages/geo-optimizer"
import VEOOptimizerPage from "../pages/veo-optimizer"
import AuthCallbackPage from "../pages/auth-callback"
import VerifyPage from "../pages/verify"
import ForgotPasswordPage from "../pages/forgot-password"
import ResetPasswordPage from "../pages/reset-password"
import AdminPage from "../pages/admin"
import OptimizePage from "../pages/optimize"
import HistoryPage from "../pages/history"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export function ClientApp() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading screen during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="ai-optimizer-theme">
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/optimize"
                  element={
                    <ProtectedRoute>
                      <OptimizePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seo-optimizer"
                  element={
                    <ProtectedRoute>
                      <SEOOptimizerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/geo-optimizer"
                  element={
                    <ProtectedRoute>
                      <GEOOptimizerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/veo-optimizer"
                  element={
                    <ProtectedRoute>
                      <VEOOptimizerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
