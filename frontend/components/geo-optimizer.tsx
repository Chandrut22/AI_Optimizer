"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { optimizerApi } from "../services/optimizer-api"
import { useToast } from "@/hooks/use-toast"
import { Globe, Sparkles } from "lucide-react"

export default function GEOOptimizer() {
  const [content, setContent] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const optimizeMutation = useMutation({
    mutationFn: optimizerApi.optimizeGEO,
    onSuccess: (data) => {
      setResults(data)
      toast({
        title: "GEO Optimization Complete",
        description: "Your content has been optimized for generative engines.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.response?.data?.message || "Failed to optimize content.",
        variant: "destructive",
      })
    },
  })

  const handleOptimize = () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content to optimize.",
        variant: "destructive",
      })
      return
    }

    optimizeMutation.mutate({
      content,
      target_audience: targetAudience || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Globe className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">GEO Optimizer</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Input</CardTitle>
            <CardDescription>
              Optimize your content for generative AI engines like ChatGPT, Bard, and Claude
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience (optional)</Label>
              <Input
                id="audience"
                placeholder="e.g., developers, marketers, students"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <Button onClick={handleOptimize} className="w-full" disabled={optimizeMutation.isPending}>
              {optimizeMutation.isPending ? "Optimizing..." : "Optimize for GEO"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>GEO Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {optimizeMutation.isPending ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : results ? (
              <div className="space-y-4">
                {results.optimized_content && (
                  <div>
                    <h3 className="font-semibold mb-2">Optimized Content</h3>
                    <div className="text-sm bg-muted p-3 rounded max-h-40 overflow-y-auto">
                      {results.optimized_content}
                    </div>
                  </div>
                )}

                {results.key_phrases && (
                  <div>
                    <h3 className="font-semibold mb-2">Key Phrases for AI</h3>
                    <ul className="text-sm space-y-1">
                      {results.key_phrases.map((phrase: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{phrase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.recommendations && (
                  <div>
                    <h3 className="font-semibold mb-2">GEO Recommendations</h3>
                    <ul className="text-sm space-y-1">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter your content and click "Optimize for GEO" to see recommendations for generative AI engines.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
