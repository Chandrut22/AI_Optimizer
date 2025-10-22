import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const SeoResultsPage = () => {
  const { url } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockResults = {
        url: decodedUrl,
        score: Math.floor(Math.random() * 30) + 70,
        issues: [
          { type: 'warning', message: 'Missing meta description', impact: 'medium' },
          { type: 'error', message: 'Title tag too long (65+ characters)', impact: 'high' },
          { type: 'success', message: 'Good use of heading structure', impact: 'low' },
          { type: 'warning', message: 'Images missing alt attributes', impact: 'medium' },
        ],
        recommendations: [
          'Add meta description (150-160 characters)',
          'Optimize title tag length',
          'Add alt text to images',
          'Improve page loading speed',
        ],
      };
      setAnalysis(mockResults);
      setLoading(false);
    };

    if (url) {
      fetchResults();
    } else {
      navigate('/dashboard');
    }
  }, [url, navigate]);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">SEO Analysis Results</h1>
            <Button onClick={handleGoBack} variant="outline">Back to Dashboard</Button>
          </div>

          <h2 className="text-xl font-semibold text-muted-foreground mb-4">
            Analysis for: <span className="text-foreground font-medium">{decodedUrl}</span>
          </h2>

          {loading ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <p className="text-lg text-muted-foreground">Analyzing your URL...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6 p-6 bg-card border border-border rounded-lg">
              <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-semibold text-foreground">Overall Score</h2>
                <p className="mt-2 text-3xl font-bold text-foreground">{analysis.score}<span className="text-muted-foreground text-xl">/100</span></p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">Key Issues Found:</h3>
                {analysis.issues.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-foreground">
                    {analysis.issues.map((issue, index) => (
                      <li key={index}>{issue.message}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No critical issues found.</p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">Recommendations:</h3>
                {analysis.recommendations.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-foreground">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No specific recommendations at this time.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-card border border-border rounded-lg">
              <p className="text-lg text-muted-foreground">Could not retrieve analysis for this URL.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeoResultsPage;
