"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "../components/navigation"
import { ModeSelector } from "../components/mode-selector"
import { TextEditor } from "../components/text-editor"
import { FileUpload } from "../components/file-upload"
import { ResultsPanel } from "../components/results-panel"
import { optimizerApi, type OptimizationResult } from "../services/optimizer-api"
import { Loader2, Sparkles, ArrowRight, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OptimizePage() {
  const [selectedMode, setSelectedMode] = useState<"seo" | "geo" | "veo">("seo")
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)
  const [step, setStep] = useState<"select" | "input" | "results">("select")
  const { toast } = useToast()

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content to optimize",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)

    try {
      let optimizationResult: OptimizationResult

      switch (selectedMode) {
        case "seo":
          optimizationResult = await optimizerApi.optimizeSEO({
            content,
            targetKeywords: ["AI", "optimization", "SEO"],
          })
          break
        case "geo":
          optimizationResult = await optimizerApi.optimizeGEO({
            businessName: "AI Optimizer",
            location: "Global",
            category: "Technology",
            content,
          })
          break
        case "veo":
          optimizationResult = await optimizerApi.optimizeVEO({
            content,
            targetQueries: ["AI tools", "content optimization"],
          })
          break
        default:
          throw new Error("Invalid optimization mode")
      }

      setResult(optimizationResult)
      setStep("results")

      toast({
        title: "Optimization complete!",
        description: `Your ${selectedMode.toUpperCase()} optimization is ready`,
      })
    } catch (error: any) {
      toast({
        title: "Optimization failed",
        description: error.response?.data?.message || "Failed to optimize content",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplySuggestion = (suggestion: string) => {
    setContent((prev) => prev + "\n\n" + suggestion)
    toast({
      title: "Suggestion applied",
      description: "The suggestion has been added to your content",
    })
  }

  const resetOptimization = () => {
    setStep("select")
    setResult(null)
    setContent("")
    setFiles([])
  }

  const getModeGradient = () => {
    switch (selectedMode) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${getModeGradient()} text-white shadow-lg`}>
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Content Optimizer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your content with AI-powered optimization for SEO, GEO, and VEO
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {["select", "input", "results"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step === stepName
                    ? `bg-gradient-to-r ${getModeGradient()} text-white shadow-lg scale-110`
                    : index < ["select", "input", "results"].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {step === "select" && (
            <div className="animate-fade-in">
              <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
              <div className="text-center mt-8">
                <Button
                  onClick={() => setStep("input")}
                  size="lg"
                  className={`rounded-2xl px-8 py-4 bg-gradient-to-r ${getModeGradient()} hover:shadow-lg transition-all duration-300`}
                >
                  Continue with {selectedMode.toUpperCase()}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {step === "input" && (
            <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                <TextEditor
                  value={content}
                  onChange={setContent}
                  mode={selectedMode}
                  placeholder={`Enter your ${selectedMode.toUpperCase()} content here...`}
                />

                {selectedMode === "veo" && (
                  <FileUpload
                    onFileSelect={setFiles}
                    acceptedTypes={["image/*", "video/*"]}
                    maxFiles={5}
                    maxSize={10}
                  />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Mode Info */}
                <Card className="rounded-2xl shadow-lg border-0">
                  <div className={`p-4 bg-gradient-to-r ${getModeGradient()} text-white rounded-t-2xl`}>
                    <h3 className="font-bold text-lg">{selectedMode.toUpperCase()} Mode</h3>
                    <p className="text-sm opacity-90">
                      {selectedMode === "seo" && "Optimize for search engines"}
                      {selectedMode === "geo" && "Optimize for AI engines"}
                      {selectedMode === "veo" && "Optimize for visual platforms"}
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {selectedMode === "seo" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Keyword Density</span>
                            <Badge variant="outline">2.5%</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Readability</span>
                            <Badge variant="outline">Good</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Word Count</span>
                            <Badge variant="outline">{content.split(" ").length}</Badge>
                          </div>
                        </>
                      )}

                      {selectedMode === "geo" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>AI Readiness</span>
                            <Badge variant="outline">High</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Structure Score</span>
                            <Badge variant="outline">85%</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Context Rich</span>
                            <Badge variant="outline">Yes</Badge>
                          </div>
                        </>
                      )}

                      {selectedMode === "veo" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Character Count</span>
                            <Badge variant="outline">{content.length}/2200</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Media Files</span>
                            <Badge variant="outline">{files.length}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Engagement Score</span>
                            <Badge variant="outline">Good</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleOptimize}
                    disabled={isOptimizing || !content.trim()}
                    className={`w-full rounded-2xl py-6 bg-gradient-to-r ${getModeGradient()} hover:shadow-lg transition-all duration-300 text-lg font-semibold`}
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Run {selectedMode.toUpperCase()} Optimization
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={() => setStep("select")} className="w-full rounded-2xl py-3">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Change Mode
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "results" && result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Optimization Results</h2>
                  <p className="text-muted-foreground">Your {selectedMode.toUpperCase()} optimization is complete</p>
                </div>
                <Button variant="outline" onClick={resetOptimization} className="rounded-xl">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start New Optimization
                </Button>
              </div>

              <ResultsPanel result={result} onApplySuggestion={handleApplySuggestion} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
