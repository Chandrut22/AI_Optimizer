"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "../components/navigation"
import { useAuth } from "../context/auth-context"
import { optimizerApi, type OptimizationResult } from "../services/optimizer-api"
import { Search, MapPin, Mic, TrendingUp, Download, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentOptimizations, setRecentOptimizations] = useState<OptimizationResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadRecentOptimizations()
  }, [])

  const loadRecentOptimizations = async () => {
    try {
      const history = await optimizerApi.getOptimizationHistory()
      setRecentOptimizations(history.slice(0, 5)) // Show last 5
    } catch (error) {
      console.error("Failed to load optimization history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = async (optimizationId: string) => {
    try {
      const blob = await optimizerApi.downloadReport(optimizationId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `optimization-report-${optimizationId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Report downloaded",
        description: "Your optimization report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "seo":
        return <Search className="h-4 w-4" />
      case "geo":
        return <MapPin className="h-4 w-4" />
      case "veo":
        return <Mic className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "seo":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "geo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "veo":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's an overview of your optimization activities and tools.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/seo-optimizer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Search className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <CardTitle className="text-lg">SEO Optimizer</CardTitle>
                  <CardDescription>Improve search rankings</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analyze and optimize your content for better search engine visibility
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/geo-optimizer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <CardTitle className="text-lg">GEO Optimizer</CardTitle>
                  <CardDescription>Local search optimization</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Boost your local presence and attract nearby customers</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/veo-optimizer">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Mic className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <CardTitle className="text-lg">VEO Optimizer</CardTitle>
                  <CardDescription>Voice search optimization</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Optimize for voice queries and conversational search</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Optimizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Recent Optimizations
            </CardTitle>
            <CardDescription>Your latest optimization results and reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOptimizations.length > 0 ? (
              <div className="space-y-4">
                {recentOptimizations.map((optimization) => (
                  <div key={optimization.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(optimization.type)}
                        <Badge className={getTypeColor(optimization.type)}>{optimization.type.toUpperCase()}</Badge>
                      </div>
                      <div>
                        <p className="font-medium">Score: {optimization.score}/100</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(optimization.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadReport(optimization.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No optimizations yet</h3>
                <p className="text-muted-foreground mb-4">Start optimizing your content with our AI-powered tools</p>
                <div className="flex justify-center space-x-2">
                  <Button asChild>
                    <Link to="/seo-optimizer">Try SEO Optimizer</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
