"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "../components/navigation"
import { optimizerApi, type OptimizationResult } from "../services/optimizer-api"
import { MapPin, Loader2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GEOOptimizerPage() {
  const [businessName, setBusinessName] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const { toast } = useToast()

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const optimizationResult = await optimizerApi.optimizeGEO({
        businessName,
        location,
        category,
        content: content || undefined,
      })

      setResult(optimizationResult)
      toast({
        title: "GEO Analysis Complete",
        description: "Your local SEO has been analyzed and optimized.",
      })
    } catch (error: any) {
      toast({
        title: "Optimization Failed",
        description: error.response?.data?.message || "Failed to optimize content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MapPin className="mr-3 h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">GEO Optimizer</h1>
              <p className="text-muted-foreground">
                Optimize your business for local search and attract nearby customers
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Local Business Analysis</CardTitle>
              <CardDescription>Enter your business details to get AI-powered local SEO recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOptimize} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="Your Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, State or Full Address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Business Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Restaurant, Dentist, Plumber"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Business Description (Optional)</Label>
                  <Textarea
                    id="content"
                    placeholder="Describe your business, services, and what makes you unique..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !businessName || !location || !category}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze Local SEO
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Score Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Local SEO Score
                      <Badge className={getScoreBadgeColor(result.score)}>{result.score}/100</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              result.score >= 80 ? "bg-green-600" : result.score >= 60 ? "bg-yellow-600" : "bg-red-600"
                            }`}
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      Local SEO Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.suggestions.map((suggestion, index) => (
                        <Alert key={index}>
                          <TrendingUp className="h-4 w-4" />
                          <AlertDescription>{suggestion}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Improvements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                      Local Optimization Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Optimize</h3>
                  <p className="text-muted-foreground">
                    Enter your business details to get started with local SEO analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
