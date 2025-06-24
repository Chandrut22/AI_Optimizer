import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_OPTIMIZER_API_URL || "http://localhost:8000"

const optimizerClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
optimizerClient.interceptors.request.use((config) => {
  // The JWT token will be automatically included via cookies
  return config
})

export const optimizerApi = {
  // SEO Optimization
  optimizeSEO: async (data: { content: string; url?: string; keywords?: string[] }) => {
    const response = await optimizerClient.post("/seo/optimize", data)
    return response.data
  },

  getSEOAnalysis: async (url: string) => {
    const response = await optimizerClient.get(`/seo/analyze?url=${encodeURIComponent(url)}`)
    return response.data
  },

  // GEO Optimization
  optimizeGEO: async (data: { content: string; target_audience?: string }) => {
    const response = await optimizerClient.post("/geo/optimize", data)
    return response.data
  },

  // VEO Optimization
  optimizeVEO: async (data: { video_url?: string; title: string; description: string }) => {
    const response = await optimizerClient.post("/veo/optimize", data)
    return response.data
  },

  // Analytics
  getAnalytics: async (timeRange = "30d") => {
    const response = await optimizerClient.get(`/analytics?range=${timeRange}`)
    return response.data
  },

  // Reports
  downloadReport: async (reportId: string) => {
    const response = await optimizerClient.get(`/reports/${reportId}/download`, {
      responseType: "blob",
    })
    return response.data
  },
}
