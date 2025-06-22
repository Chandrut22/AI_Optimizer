"use client"

import { useEffect } from "react"
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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export default function App() {
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === "undefined") return
  }, [])

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
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
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
