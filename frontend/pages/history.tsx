"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Navigation } from "../components/navigation"
import { optimizerApi, type OptimizationResult } from "../services/optimizer-api"
import { Search, Globe, Eye, Download, Filter, Calendar, TrendingUp, FileText, BarChart3 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function HistoryPage() {
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([])
  const [filteredOptimizations, setFilteredOptimizations] = useState<OptimizationResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadOptimizations()
  }, [])

  useEffect(() => {
    filterOptimizations()
  }, [optimizations, searchTerm, typeFilter, dateFilter])

  const loadOptimizations = async () => {
    try {
      const history = await optimizerApi.getOptimizationHistory()
      setOptimizations(history)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load optimization history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterOptimizations = () => {
    let filtered = [...optimizations]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (opt) =>
          opt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.suggestions.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((opt) => opt.type === typeFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((opt) => new Date(opt.createdAt) >= filterDate)
    }

    setFilteredOptimizations(filtered)
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "geo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "veo":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const stats = {
    total: optimizations.length,
    avgScore:
      optimizations.length > 0
        ? Math.round(optimizations.reduce((sum, opt) => sum + opt.score, 0) / optimizations.length)
        : 0,
    seoCount: optimizations.filter((opt) => opt.type === "seo").length,
    geoCount: optimizations.filter((opt) => opt.type === "geo").length,
    veoCount: optimizations.filter((opt) => opt.type === "veo").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Optimization History
              </h1>
              <p className="text-xl text-muted-foreground">Track your optimization progress and download reports</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}/100</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">SEO</p>
                  <p className="text-2xl font-bold">{stats.seoCount}</p>
                </div>
                <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">GEO</p>
                  <p className="text-2xl font-bold">{stats.geoCount}</p>
                </div>
                <Globe className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">VEO</p>
                  <p className="text-2xl font-bold">{stats.veoCount}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl shadow-lg border-0 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search optimizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="geo">GEO</SelectItem>
                    <SelectItem value="veo">VEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => {
                    setSearchTerm("")
                    setTypeFilter("all")
                    setDateFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Optimization Results ({filteredOptimizations.length})</span>
            </CardTitle>
            <CardDescription>View and manage your optimization history</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredOptimizations.length > 0 ? (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Suggestions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOptimizations.map((optimization) => (
                      <TableRow key={optimization.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getModeIcon(optimization.type)}
                              <Badge className={getModeColor(optimization.type)}>
                                {optimization.type.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getScoreBadge(optimization.score)}>{optimization.score}/100</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(optimization.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {optimization.suggestions.length} suggestions
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(optimization.id)}
                              className="rounded-lg"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 rounded-2xl bg-muted/50 w-fit mx-auto mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  {optimizations.length === 0
                    ? "You haven't created any optimizations yet"
                    : "No optimizations match your current filters"}
                </p>
                {optimizations.length === 0 && (
                  <Button asChild className="rounded-xl">
                    <Link to="/optimize">Start Your First Optimization</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
