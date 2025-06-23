"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Copy, Download, CheckCircle, AlertCircle, TrendingUp, Hash, Eye, Target, Lightbulb, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OptimizationResult {
  id: string
  type: "seo" | "geo" | "veo"
  score: number
  suggestions: string[]
  improvements: string[]
  keywords?: string[]
  hashtags?: string[]
  readabilityScore?: number
  keywordDensity?: number
  aiSummary?: string
  qaPrompts?: string[]
  visualTips?: string[]
  engagementHooks?: string[]
}

interface ResultsPanelProps {
  result: OptimizationResult
  onApplySuggestion: (suggestion: string) => void
}

export function ResultsPanel({ result, onApplySuggestion }: ResultsPanelProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully",
      })
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const getModeColor = () => {
    switch (result.type) {
      case "seo":
        return "text-professional-blue-700 dark:text-professional-blue-400"
      case "geo":
        return "text-professional-emerald-700 dark:text-professional-emerald-400"
      case "veo":
        return "text-professional-violet-700 dark:text-professional-violet-400"
      default:
        return "text-primary"
    }
  }

  const getModeBg = () => {
    switch (result.type) {
      case "seo":
        return "bg-professional-blue-50 dark:bg-professional-blue-950/20"
      case "geo":
        return "bg-professional-emerald-50 dark:bg-professional-emerald-950/20"
      case "veo":
        return "bg-professional-violet-50 dark:bg-professional-violet-950/20"
      default:
        return "bg-muted"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-professional-emerald-700 dark:text-professional-emerald-400"
    if (score >= 60) return "text-professional-amber-700 dark:text-professional-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-professional-emerald-50 dark:bg-professional-emerald-950/20"
    if (score >= 60) return "bg-professional-amber-50 dark:bg-professional-amber-950/20"
    return "bg-red-50 dark:bg-red-950/20"
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 animate-fade-in">
      {/* Header */}
      <div className={`p-6 ${getModeBg()} border-b`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm`}>
              <TrendingUp className={`h-5 w-5 ${getModeColor()}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${getModeColor()}`}>
                {result.type.toUpperCase()} Optimization Results
              </h3>
              <p className="text-sm text-muted-foreground">Analysis completed successfully</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Score */}
        <div className={`p-4 rounded-2xl ${getScoreBg(result.score)} border`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Optimization Score</span>
            <Badge className={`${getScoreColor(result.score)} bg-transparent border-current`}>{result.score}/100</Badge>
          </div>
          <Progress value={result.score} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {result.score >= 80
              ? "Excellent optimization!"
              : result.score >= 60
                ? "Good, with room for improvement"
                : "Needs significant optimization"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="suggestions" className="rounded-lg">
              <Lightbulb className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="improvements" className="rounded-lg">
              <Target className="h-4 w-4 mr-2" />
              Improvements
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg">
              <Star className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-6 space-y-4">
            {result.suggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 rounded-xl border-l-4 border-l-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Suggestion {index + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(suggestion)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion)}
                      className="h-8 px-3 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="improvements" className="mt-6 space-y-4">
            {result.improvements.map((improvement, index) => (
              <Card key={index} className="p-4 rounded-xl border-l-4 border-l-yellow-500">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-sm block mb-1">Improvement {index + 1}</span>
                    <p className="text-sm text-muted-foreground">{improvement}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="mt-6 space-y-6">
            {/* SEO Specific Insights */}
            {result.type === "seo" && (
              <div className="grid gap-4">
                {result.readabilityScore && (
                  <Card className="p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Readability Score</span>
                      <Badge variant="outline">{result.readabilityScore}/100</Badge>
                    </div>
                    <Progress value={result.readabilityScore} className="h-2" />
                  </Card>
                )}

                {result.keywords && (
                  <Card className="p-4 rounded-xl">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Target Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="rounded-lg">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* GEO Specific Insights */}
            {result.type === "geo" && (
              <div className="space-y-4">
                {result.aiSummary && (
                  <Card className="p-4 rounded-xl">
                    <h4 className="font-medium mb-3">AI-Friendly Summary</h4>
                    <p className="text-sm text-muted-foreground">{result.aiSummary}</p>
                  </Card>
                )}

                {result.qaPrompts && (
                  <Card className="p-4 rounded-xl">
                    <h4 className="font-medium mb-3">Q&A Prompts</h4>
                    <div className="space-y-2">
                      {result.qaPrompts.map((prompt, index) => (
                        <div key={index} className="p-2 bg-muted rounded-lg text-sm">
                          {prompt}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* VEO Specific Insights */}
            {result.type === "veo" && (
              <div className="space-y-4">
                {result.hashtags && (
                  <Card className="p-4 rounded-xl">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Recommended Hashtags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((hashtag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="rounded-lg cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => copyToClipboard(hashtag)}
                        >
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {result.engagementHooks && (
                  <Card className="p-4 rounded-xl">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Engagement Hooks
                    </h4>
                    <div className="space-y-2">
                      {result.engagementHooks.map((hook, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                          {hook}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}
