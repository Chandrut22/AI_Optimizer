"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAuth } from "../context/auth-context"
import { authApi } from "../services/auth-api"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const error = searchParams.get("error")

      if (error) {
        toast({
          title: "Authentication failed",
          description: "Google authentication was cancelled or failed.",
          variant: "destructive",
        })
        navigate("/login")
        return
      }

      if (code) {
        try {
          await authApi.handleGoogleCallback(code)
          await refreshUser()
          toast({
            title: "Welcome!",
            description: "You have been logged in successfully with Google.",
          })
          navigate("/dashboard")
        } catch (error) {
          toast({
            title: "Authentication failed",
            description: "Failed to complete Google authentication.",
            variant: "destructive",
          })
          navigate("/login")
        }
      } else {
        navigate("/login")
      }
    }

    handleCallback()
  }, [searchParams, navigate, refreshUser, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h2 className="text-lg font-semibold mb-2">Completing authentication...</h2>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we complete your Google authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
