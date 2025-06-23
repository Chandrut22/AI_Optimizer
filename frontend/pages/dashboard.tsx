"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "../components/navigation"
import { useAuth } from "../context/auth-context"
import { optimizerApi, type OptimizationResult } from "../services/optimizer-api"
import { Search, Globe, Eye, TrendingUp, Clock, Sparkles, ArrowRight, BarChart3, Zap, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentOptimizations, setRecentOptimizations] = useState<OptimizationResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOptimizations: 0,
    avgScore: 0,
    thisWeek: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const history = await optimizerApi.getOptimizationHistory()
      setRecentOptimizations(history.slice(0, 5))

      // Calculate stats
      const totalOptimizations = history.length
      const avgScore =
        history.length > 0 ? Math.round(history.reduce((sum, opt) => sum + opt.score, 0) / history.length) : 0
      const thisWeek = history.filter((opt) => {
        const optDate = new Date(opt.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return optDate > weekAgo
      }).length

      setStats({ totalOptimizations, avgScore, thisWeek })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModeIcon = (type: string) => {
    switch (type) {
      case "seo":
        return <Search className="h-4 w-4" />
      case "geo":
        return <Globe className="h-4 w-4" />
      case "veo":
        return <Eye className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getModeColor = (type: string) => {
    switch (type) {
      case "seo":
        return "bg-professional-blue-50 text-professional-blue-800 dark:bg-professional-blue-900/20 dark:text-professional-blue-300"
      case "geo":
        return "bg-professional-emerald-50 text-professional-emerald-800 dark:bg-professional-emerald-900/20 dark:text-professional-emerald-300"
      case "veo":
        return "bg-professional-violet-50 text-professional-violet-800 dark:bg-professional-violet-900/20 dark:text-professional-violet-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getModeGradient = (type: string) => {
    switch (type) {
      case "seo":
        return "from-professional-blue-600 to-professional-blue-700"
      case "geo":
        return "from-professional-emerald-600 to-professional-emerald-700"
      case "veo":
        return "from-professional-violet-600 to-professional-violet-700"
      default:
        return "from-primary to-primary"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-professional-emerald-700 dark:text-professional-emerald-400"
    if (score >= 60) return "text-professional-amber-700 dark:text-professional-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <div className="container mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xl text-muted-foreground">Ready to optimize your content with AI-powered insights?</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Optimizations</CardTitle>
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.totalOptimizations}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/20">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.avgScore}/100</div>
              <p className="text-xs text-muted-foreground">Optimization quality</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Recent activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
            <Link to="/optimize" state={{ mode: "seo" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">SEO Optimizer</CardTitle>
                    <CardDescription>Search Engine Optimization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize your content for traditional search engines like Google and Bing
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                  Start Optimizing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
            <Link to="/optimize" state={{ mode: "geo" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">GEO Optimizer</CardTitle>
                    <CardDescription>Generative Engine Optimization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize for AI-powered search engines and chatbots like ChatGPT and Bard
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                  Start Optimizing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
            <Link to="/optimize" state={{ mode: "veo" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">VEO Optimizer</CardTitle>
                    <CardDescription>Visual Engine Optimization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Optimize for visual platforms like Instagram, TikTok, and YouTube
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                  Start Optimizing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Optimizations */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Recent Optimizations</CardTitle>
                  <CardDescription>Your latest optimization results and reports</CardDescription>
                </div>
              </div>
              <Button variant="outline" asChild className="rounded-xl">
                <Link to="/history">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : recentOptimizations.length > 0 ? (
              <div className="space-y-4">
                {recentOptimizations.map((optimization) => (
                  <div
                    key={optimization.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${getModeGradient(optimization.type)} text-white shadow-lg`}
                      >
                        {getModeIcon(optimization.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getModeColor(optimization.type)}>{optimization.type.toUpperCase()}</Badge>
                          <span className={`font-semibold ${getScoreColor(optimization.score)}`}>
                            Score: {optimization.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(optimization.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-4">
                  <TrendingUp className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No optimizations yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start optimizing your content with our AI-powered tools to see your results here
                </p>
                <Button asChild className="rounded-xl">
                  <Link to="/optimize">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Your First Optimization
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
