import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_OPTIMIZER_API_URL || "http://localhost:8000"

const optimizerClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface SEOOptimizationRequest {
  content?: string
  url?: string
  targetKeywords?: string[]
}

export interface GEOOptimizationRequest {
  businessName: string
  location: string
  category: string
  content?: string
}

export interface VEOOptimizationRequest {
  content: string
  targetQueries?: string[]
}

export interface OptimizationResult {
  id: string
  type: "seo" | "geo" | "veo"
  suggestions: string[]
  score: number
  improvements: string[]
  createdAt: string
}

export const optimizerApi = {
  // SEO Optimization
  optimizeSEO: async (data: SEOOptimizationRequest): Promise<OptimizationResult> => {
    const response = await optimizerClient.post("/seo/optimize", data)
    return response.data
  },

  // GEO Optimization
  optimizeGEO: async (data: GEOOptimizationRequest): Promise<OptimizationResult> => {
    const response = await optimizerClient.post("/geo/optimize", data)
    return response.data
  },

  // VEO Optimization
  optimizeVEO: async (data: VEOOptimizationRequest): Promise<OptimizationResult> => {
    const response = await optimizerClient.post("/veo/optimize", data)
    return response.data
  },

  // Get optimization history
  getOptimizationHistory: async (): Promise<OptimizationResult[]> => {
    const response = await optimizerClient.get("/optimizations/history")
    return response.data
  },

  // Download report
  downloadReport: async (optimizationId: string): Promise<Blob> => {
    const response = await optimizerClient.get(`/optimizations/${optimizationId}/report`, {
      responseType: "blob",
    })
    return response.data
  },
}
