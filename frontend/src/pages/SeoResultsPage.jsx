// src/pages/SeoResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  ScoreCard,
  MetricsGrid,
  PerformanceTable,
  IssuesList,
  RecommendationsList,
  ExecutiveSummary,
  ActionPlan,
} from '@/components/SeoResults';
import { Download, Share2, ArrowLeft, RefreshCw } from 'lucide-react';
import { analyzeSEO } from '@/api/seoService'; // ✅ Import the actual API service

const SeoResultsPage = () => {
  const { url } = useParams();
  const navigate = useNavigate();
  
  // State for real data
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safe URL decoding
  const decodedUrl = (() => {
    try {
      return decodeURIComponent(url || '');
    } catch {
      return url || '';
    }
  })();

  // Auth Check
  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!(accessToken && user.email);

  // ✅ Fetch Real Data from Backend
  useEffect(() => {
    const fetchResults = async () => {
      if (!decodedUrl) {
        navigate('/dashboard');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call the API
        const data = await analyzeSEO(decodedUrl);
        
        // Set the data from the backend
        setAnalysis(data);
      } catch (err) {
        console.error("SEO Audit failed:", err);
        setError(err.message || "Failed to analyze the website. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [decodedUrl, navigate]);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">SEO Audit Report</h1>
              <p className="text-muted-foreground mt-1">Analysis for: <span className="font-medium text-primary">{decodedUrl}</span></p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {/* Only show share/download if we have data */}
              {analysis && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-6 text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold">Analyzing Website...</h2>
              <p className="text-muted-foreground">This usually takes 15-30 seconds. Our AI is crawling pages and generating insights.</p>
              
              {/* Skeleton Loaders */}
              <div className="max-w-4xl mx-auto space-y-4 mt-8 opacity-50">
                <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                  <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                  <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-16 bg-card border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Analysis Failed</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleGoBack} variant="outline">Go Back</Button>
                <Button onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && analysis && (
            <div className="space-y-8">
              {/* Executive Summary */}
              {analysis.summary && (
                <ExecutiveSummary summary={analysis.summary} />
              )}

              {/* Overall Score */}
              {analysis.score !== undefined && (
                <ScoreCard score={analysis.score} />
              )}

              {/* Performance Metrics Table */}
              {analysis.metrics && (
                <PerformanceTable metrics={analysis.metrics} />
              )}

              {/* Metrics Grid */}
              {analysis.metrics && (
                <MetricsGrid metrics={analysis.metrics} />
              )}

              {/* Issues/Findings */}
              {analysis.findings && (
                <IssuesList findings={analysis.findings} />
              )}

              {/* Recommendations */}
              {analysis.recommendations && (
                <RecommendationsList recommendations={analysis.recommendations} />
              )}

              {/* Action Plan */}
              {analysis.actionPlan && (
                <ActionPlan actions={analysis.actionPlan} />
              )}

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-900/30 dark:to-slate-900/10 rounded-lg border border-blue-200 dark:border-slate-700 p-6 text-center mt-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">Next Steps</h3>
                <p className="text-muted-foreground mb-4">
                  Start by fixing the high-priority items listed in the action plan above. These will have the biggest impact on your SEO performance.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleGoBack} variant="outline">Analyze Another Site</Button>
                  <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Scroll to Top</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeoResultsPage;