"use client"

import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "../context/auth-context"
import { useTheme } from "@/components/theme-provider"
import { Moon, Sun, User, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Navigation() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isActive = (path: string) => location.pathname === path

  if (!mounted) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="text-2xl font-bold text-primary">AI Optimizer</div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:bg-navy-900/95 dark:supports-[backdrop-filter]:bg-navy-900/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-professional-blue-600 to-professional-blue-700 bg-clip-text text-transparent"
            >
              AI Optimizer
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-professional-blue-600 ${
                    isActive("/dashboard") ? "text-professional-blue-600" : "text-navy-600 dark:text-navy-300"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seo-optimizer"
                  className={`text-sm font-medium transition-colors hover:text-professional-blue-600 ${
                    isActive("/seo-optimizer") ? "text-professional-blue-600" : "text-navy-600 dark:text-navy-300"
                  }`}
                >
                  SEO
                </Link>
                <Link
                  to="/geo-optimizer"
                  className={`text-sm font-medium transition-colors hover:text-professional-emerald-600 ${
                    isActive("/geo-optimizer") ? "text-professional-emerald-600" : "text-navy-600 dark:text-navy-300"
                  }`}
                >
                  GEO
                </Link>
                <Link
                  to="/veo-optimizer"
                  className={`text-sm font-medium transition-colors hover:text-professional-violet-600 ${
                    isActive("/veo-optimizer") ? "text-professional-violet-600" : "text-navy-600 dark:text-navy-300"
                  }`}
                >
                  VEO
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-sm font-medium transition-colors hover:text-professional-blue-600 ${
                      isActive("/admin") ? "text-professional-blue-600" : "text-navy-600 dark:text-navy-300"
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="hover:bg-navy-100 dark:hover:bg-navy-800"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-navy-100 dark:hover:bg-navy-800"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-professional-blue-100 text-professional-blue-700 dark:bg-professional-blue-900/20 dark:text-professional-blue-400">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild className="hover:bg-navy-100 dark:hover:bg-navy-800">
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-professional-blue-600 to-professional-blue-700 hover:from-professional-blue-700 hover:to-professional-blue-800"
                >
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
