"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Globe, Eye, TrendingUp } from "lucide-react"

interface ModeSelectorProps {
  selectedMode: "seo" | "geo" | "veo"
  onModeChange: (mode: "seo" | "geo" | "veo") => void
}

export function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  const modes = [
    {
      id: "seo" as const,
      name: "SEO",
      title: "Search Engine Optimization",
      description: "Optimize for traditional search engines like Google, Bing",
      icon: Search,
      color: "blue",
      features: ["Keyword Density", "Readability Score", "Meta Tags", "Content Structure"],
      gradient: "from-professional-blue-600 to-professional-blue-700",
      bgColor: "bg-professional-blue-50 dark:bg-professional-blue-950/20",
      textColor: "text-professional-blue-700 dark:text-professional-blue-400",
      borderColor: "border-professional-blue-200 dark:border-professional-blue-800",
    },
    {
      id: "geo" as const,
      name: "GEO",
      title: "Generative Engine Optimization",
      description: "Optimize for AI-powered search engines and chatbots",
      icon: Globe,
      color: "emerald",
      features: ["AI Summaries", "Q&A Format", "Context Rich", "Structured Data"],
      gradient: "from-professional-emerald-600 to-professional-emerald-700",
      bgColor: "bg-professional-emerald-50 dark:bg-professional-emerald-950/20",
      textColor: "text-professional-emerald-700 dark:text-professional-emerald-400",
      borderColor: "border-professional-emerald-200 dark:border-professional-emerald-800",
    },
    {
      id: "veo" as const,
      name: "VEO",
      title: "Visual Engine Optimization",
      description: "Optimize for visual platforms like Instagram, TikTok, YouTube",
      icon: Eye,
      color: "violet",
      features: ["Hashtag Strategy", "Visual Captions", "Engagement Hooks", "Platform Specific"],
      gradient: "from-professional-violet-600 to-professional-violet-700",
      bgColor: "bg-professional-violet-50 dark:bg-professional-violet-950/20",
      textColor: "text-professional-violet-700 dark:text-professional-violet-400",
      borderColor: "border-professional-violet-200 dark:border-professional-violet-800",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Optimization Mode</h2>
        <p className="text-muted-foreground">Select the type of optimization that best fits your content goals</p>
      </div>

      <div className="grid gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isSelected = selectedMode === mode.id

          return (
            <Card
              key={mode.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg rounded-2xl border-2 ${
                isSelected
                  ? `${mode.borderColor} shadow-lg scale-[1.02] ${mode.bgColor}`
                  : "border-border hover:border-primary/30"
              }`}
              onClick={() => onModeChange(mode.id)}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${mode.gradient} text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-xl font-bold ${isSelected ? mode.textColor : ""}`}>{mode.title}</h3>
                      <Badge
                        variant={isSelected ? "default" : "secondary"}
                        className={isSelected ? `bg-gradient-to-r ${mode.gradient} text-white` : ""}
                      >
                        {mode.name}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4">{mode.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {mode.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-xs ${isSelected ? `${mode.textColor} ${mode.borderColor}` : ""}`}
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {isSelected && (
                    <div className={`p-2 rounded-full ${mode.bgColor}`}>
                      <TrendingUp className={`h-5 w-5 ${mode.textColor}`} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
