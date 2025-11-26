import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // ✅ Import this
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
import { Download, Share2, ArrowLeft, RefreshCw, FileText } from 'lucide-react'; // Added FileText icon
import { analyzeSEO } from '@/api/seoService';

const SeoResultsPage = () => {
  const { url } = useParams();
  const navigate = useNavigate();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodedUrl = (() => {
    try {
      return decodeURIComponent(url || '');
    } catch {
      return url || '';
    }
  })();

  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!(accessToken && user.email);

  // --- DATA TRANSFORMATION HELPER ---
  const transformBackendData = (data) => {
    if (!data) return null;

    const tech = data.technicalAuditResult || {};
    const strategy = data.strategyResult || {};
    const recs = strategy.recommendations || [];

    // ✅ Extract the Markdown Report from messages
    // We look for the message of type 'ai' or one that contains the specific header
    const reportMessage = data.messages?.find(m => 
      m.type === 'ai' || m.content?.includes("# COMPREHENSIVE SEO AUDIT REPORT")
    );
    const fullReport = reportMessage ? reportMessage.content : null;

    const getRecsByPriority = (priority) => 
      recs.filter(r => r.priority?.toLowerCase() === priority.toLowerCase());

    return {
      url: data.url,
      auditDate: new Date().toLocaleDateString(),
      score: tech.performance_score || 0,
      status: tech.performance_score >= 80 ? 'Good' : (tech.performance_score >= 50 ? 'Fair' : 'Needs Improvement'),
      
      // ✅ Attach the full report to the state
      fullReport: fullReport,

      summary: {
        url: data.url,
        auditDate: new Date().toLocaleDateString(),
        score: tech.performance_score || 0,
        status: tech.performance_score >= 80 ? 'Good' : (tech.performance_score >= 50 ? 'Fair' : 'Needs Improvement'),
        findingsCount: {
          critical: getRecsByPriority('High').length,
          recommended: getRecsByPriority('Medium').length,
          good: getRecsByPriority('Low').length
        }
      },

      metrics: {
        performanceScore: tech.performance_score,
        lcp: tech.core_web_vitals?.lcp || 0,
        fid: tech.core_web_vitals?.fid || 0,
        cls: tech.core_web_vitals?.cls || 0,
        mobileReady: tech.mobile_friendly,
        httpsStatus: tech.uses_https,
      },

      findings: {
        critical: getRecsByPriority('High').map(r => ({
          title: r.recommendation,
          description: r.justification,
          details: ["Priority: High", `Category: ${r.category}`]
        })),
        recommended: getRecsByPriority('Medium').map(r => ({
          title: r.recommendation,
          description: r.justification,
          details: ["Priority: Medium", `Category: ${r.category}`]
        })),
        good: getRecsByPriority('Low').map(r => ({
          title: r.recommendation,
          description: r.justification,
          details: ["Priority: Low", `Category: ${r.category}`]
        })),
      },

      recommendations: recs.map(r => ({
        priority: r.priority?.toLowerCase() || 'low',
        category: r.category,
        recommendation: r.recommendation,
        justification: r.justification,
        actionItems: ["Review site settings", "Apply fix based on category"]
      })),

      actionPlan: {
        high: getRecsByPriority('High').map(r => ({
          recommendation: r.recommendation,
          category: r.category,
          priority: 'High',
          justification: r.justification,
          actionItems: ["Immediate attention required"]
        })),
        medium: getRecsByPriority('Medium').map(r => ({
          recommendation: r.recommendation,
          category: r.category,
          priority: 'Medium',
          justification: r.justification,
          actionItems: ["Schedule for next sprint"]
        })),
        low: getRecsByPriority('Low').map(r => ({
          recommendation: r.recommendation,
          category: r.category,
          priority: 'Low',
          justification: r.justification,
          actionItems: ["Review when time permits"]
        })),
      },
    };
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!decodedUrl) {
        navigate('/dashboard');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rawData = await analyzeSEO(decodedUrl);
        const uiData = transformBackendData(rawData);
        setAnalysis(uiData);
      } catch (err) {
        console.error("SEO Audit failed:", err);
        setError(err.message || "Failed to analyze the website. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [decodedUrl, navigate]);

  const handleGoBack = () => navigate('/dashboard');
  const handleRetry = () => window.location.reload();

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

          {loading && (
            <div className="space-y-6 text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold">Analyzing Website...</h2>
              <p className="text-muted-foreground">This usually takes 15-30 seconds. Our AI is crawling pages and generating insights.</p>
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

          {!loading && !error && analysis && (
            <div className="space-y-8">
              {/* Executive Summary */}
              {analysis.summary && <ExecutiveSummary summary={analysis.summary} />}

              {/* Overall Score */}
              {analysis.score !== undefined && <ScoreCard score={analysis.score} />}

              {/* Performance Metrics Table */}
              {analysis.metrics && <PerformanceTable metrics={analysis.metrics} />}

              {/* Metrics Grid */}
              {analysis.metrics && <MetricsGrid metrics={analysis.metrics} />}

              {/* Issues/Findings */}
              {analysis.findings && <IssuesList findings={analysis.findings} />}

              {/* Recommendations */}
              {analysis.recommendations && <RecommendationsList recommendations={analysis.recommendations} />}

              {/* Action Plan */}
              {analysis.actionPlan && <ActionPlan actions={analysis.actionPlan} />}

              {/* ✅ Detailed AI Analysis Report Section (New) */}
              {analysis.fullReport && (
                <div className="bg-card dark:bg-[#1E293B] rounded-xl shadow-sm border border-border p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Detailed AI Analysis</h2>
                  </div>
                  
                  <div className="prose dark:prose-invert max-w-none text-foreground">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b text-foreground" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-6 mb-3 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 leading-7 text-muted-foreground" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground bg-muted/30 p-4 rounded-r" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border"><table className="w-full text-sm text-left" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-muted/50 uppercase text-xs" {...props} />,
                        th: ({node, ...props}) => <th className="px-6 py-3 font-semibold" {...props} />,
                        td: ({node, ...props}) => <td className="px-6 py-4 border-t border-border" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-8 border-border" {...props} />,
                      }}
                    >
                      {analysis.fullReport}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-900/30 dark:to-slate-900/10 rounded-lg border border-blue-200 dark:border-slate-700 p-6 text-center mt-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">Next Steps</h3>
                <p className="text-muted-foreground mb-4">
                  Start by fixing the high-priority items listed in the action plan above.
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