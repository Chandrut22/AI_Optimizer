"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { optimizerApi } from "../services/optimizer-api"
import { useToast } from "@/hooks/use-toast"
import { Search, Lightbulb, Tag } from "lucide-react"

export default function SEOOptimizer() {
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [keywords, setKeywords] = useState("")
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const optimizeMutation = useMutation({
    mutationFn: optimizerApi.optimizeSEO,
    onSuccess: (data) => {
      setResults(data)
      toast({
        title: "SEO Analysis Complete",
        description: "Your content has been analyzed and optimized.",
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
      url: url || undefined,
      keywords: keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">SEO Optimizer</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Input</CardTitle>
            <CardDescription>Enter your content and optional parameters for SEO optimization</CardDescription>
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
              <Label htmlFor="url">URL (optional)</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords (optional)</Label>
              <Input
                id="keywords"
                placeholder="keyword1, keyword2, keyword3"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Separate keywords with commas</p>
            </div>
            <Button onClick={handleOptimize} className="w-full" disabled={optimizeMutation.isPending}>
              {optimizeMutation.isPending ? "Optimizing..." : "Optimize Content"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>SEO Recommendations</span>
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
                {results.keywords && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Suggested Keywords</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {results.title && (
                  <div>
                    <h3 className="font-semibold mb-2">Optimized Title</h3>
                    <p className="text-sm bg-muted p-3 rounded">{results.title}</p>
                  </div>
                )}

                {results.meta_description && (
                  <div>
                    <h3 className="font-semibold mb-2">Meta Description</h3>
                    <p className="text-sm bg-muted p-3 rounded">{results.meta_description}</p>
                  </div>
                )}

                {results.suggestions && (
                  <div>
                    <h3 className="font-semibold mb-2">Improvement Suggestions</h3>
                    <ul className="text-sm space-y-1">
                      {results.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter your content and click "Optimize Content" to see SEO recommendations.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
