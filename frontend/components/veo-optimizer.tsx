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
import { Video, Play } from "lucide-react"

export default function VEOOptimizer() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const optimizeMutation = useMutation({
    mutationFn: optimizerApi.optimizeVEO,
    onSuccess: (data) => {
      setResults(data)
      toast({
        title: "VEO Optimization Complete",
        description: "Your video content has been optimized.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.response?.data?.message || "Failed to optimize video content.",
        variant: "destructive",
      })
    },
  })

  const handleOptimize = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter both title and description.",
        variant: "destructive",
      })
      return
    }

    optimizeMutation.mutate({
      title,
      description,
      video_url: videoUrl || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Video className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">VEO Optimizer</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Content Input</CardTitle>
            <CardDescription>
              Optimize your video titles, descriptions, and metadata for better discoverability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                placeholder="Enter your video title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Video Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter your video description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleOptimize} className="w-full" disabled={optimizeMutation.isPending}>
              {optimizeMutation.isPending ? "Optimizing..." : "Optimize Video Content"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>VEO Recommendations</span>
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
                {results.optimized_title && (
                  <div>
                    <h3 className="font-semibold mb-2">Optimized Title</h3>
                    <p className="text-sm bg-muted p-3 rounded">{results.optimized_title}</p>
                  </div>
                )}

                {results.optimized_description && (
                  <div>
                    <h3 className="font-semibold mb-2">Optimized Description</h3>
                    <div className="text-sm bg-muted p-3 rounded max-h-32 overflow-y-auto">
                      {results.optimized_description}
                    </div>
                  </div>
                )}

                {results.tags && (
                  <div>
                    <h3 className="font-semibold mb-2">Suggested Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.tags.map((tag: string, index: number) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {results.recommendations && (
                  <div>
                    <h3 className="font-semibold mb-2">VEO Recommendations</h3>
                    <ul className="text-sm space-y-1">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-600">▶</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Enter your video title and description, then click "Optimize Video Content" to see VEO recommendations.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
