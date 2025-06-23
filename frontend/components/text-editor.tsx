"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bold, Italic, List, Link, Type, FileText } from "lucide-react"

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  mode: "seo" | "geo" | "veo"
}

export function TextEditor({ value, onChange, placeholder, mode }: TextEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    const chars = value.length
    setWordCount(words)
    setCharCount(chars)
  }, [value])

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const getModeColor = () => {
    switch (mode) {
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
    switch (mode) {
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

  return (
    <Card className="rounded-2xl overflow-hidden shadow-lg border-0 bg-card">
      {/* Toolbar */}
      <div className={`p-4 border-b ${getModeBg()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className={`h-5 w-5 ${getModeColor()}`} />
            <span className={`font-semibold ${getModeColor()}`}>{mode.toUpperCase()} Content Editor</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-xs">
              {wordCount} words
            </Badge>
            <Badge variant="outline" className="text-xs">
              {charCount} characters
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => insertText("**", "**")} className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertText("*", "*")} className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertText("- ")} className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertText("[", "](url)")} className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <Button variant="ghost" size="sm" onClick={() => insertText("# ")} className="h-8 w-8 p-0">
            <Type className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Enter your ${mode.toUpperCase()} content here...`}
          className="w-full min-h-[400px] p-6 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground text-base leading-relaxed custom-scrollbar"
        />

        {/* Character limit indicator for different modes */}
        {mode === "veo" && (
          <div className="absolute bottom-4 right-4">
            <Badge variant={charCount > 2200 ? "destructive" : "secondary"} className="text-xs">
              {charCount}/2200 (Instagram)
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}
