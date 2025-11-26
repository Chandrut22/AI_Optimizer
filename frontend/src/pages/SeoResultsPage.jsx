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
import { Download, Share2 } from 'lucide-react';

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
        auditDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        score: 43,
        status: 'Needs Improvement',
        assessment: 'requires immediate attention regarding critical technical SEO factors and content optimization.',

        // Metrics
        metrics: {
          performanceScore: 43,
          lcp: 6.23,
          fid: 54,
          cls: 0.379,
          responseTime: null,
          pageSize: null,
          mobileReady: true,
          httpsStatus: false,
        },

        // Findings grouped by priority
        findings: {
          critical: [
            {
              title: 'Missing HTTPS/SSL Certificate',
              description: 'Your website is using HTTP instead of HTTPS. Browsers will mark your site as "Not Secure."',
              details: [
                'HTTPS is a ranking signal for Google',
                'Significantly hurts trust and conversion rates',
                'Users may abandon your site due to security warnings',
              ],
            },
            {
              title: 'Missing Title Tag',
              description: 'The homepage has no title tag. Title tags are crucial for SEO and user understanding.',
              details: [
                'Character length: 0 (Optimal: 50-60)',
                'Title tags are one of the most important on-page SEO elements',
                'Required for proper search engine display',
              ],
            },
            {
              title: 'Missing Meta Description',
              description: 'No meta description found. This impacts click-through rates from search results.',
              details: [
                'Character length: 0 (Optimal: 150-160)',
                'Google will pull random text if left empty',
                'Compelling descriptions act as a "pitch" to searchers',
              ],
            },
            {
              title: 'High Largest Contentful Paint (LCP)',
              description: 'LCP is 6.23 seconds, which is 2.5x slower than Google\'s recommendation.',
              details: [
                'Benchmark: < 2.5s',
                'Causes high bounce rates as users become frustrated',
                'Focus on optimizing images and reducing JavaScript',
              ],
            },
            {
              title: 'High Cumulative Layout Shift (CLS)',
              description: 'CLS is 0.379, indicating visual instability during page load.',
              details: [
                'Benchmark: < 0.1',
                'Reserve space for images and ads before loading',
                'Avoid inserting content that shifts the layout',
              ],
            },
          ],
          recommended: [
            {
              title: 'Missing H1 Tag',
              description: 'No H1 tag found on the homepage. H1 tags define the main topic of your page.',
              details: [
                'A page should have only one H1 tag',
                'Helps search engine crawlers understand your content',
                'Improves accessibility for screen readers',
              ],
            },
            {
              title: '46 Images Missing Alt Text',
              description: 'Alt text improves accessibility and helps search engines understand images.',
              details: [
                'Screen readers use alt text to describe images to visually impaired users',
                'Search engines use this text to understand image content',
                'Helps you rank in Google Image Search',
              ],
            },
            {
              title: 'Missing Canonical Tag',
              description: 'No canonical tag detected. This puts your site at risk of duplicate content issues.',
              details: [
                'Especially important if using URL parameters for tracking',
                'Tells search engines which version is the main version',
                'Prevents crawl budget waste on duplicates',
              ],
            },
            {
              title: 'Missing Schema Markup',
              description: 'No structured data detected. This limits rich snippet opportunities.',
              details: [
                'Schema markup increases real estate on search results',
                'Enables rich snippets (stars, images, FAQ boxes)',
                'Helps search engines understand your content better',
              ],
            },
          ],
          good: [
            {
              title: 'Good Heading Structure',
              description: 'The page has appropriate H2 and H3 tags that outline logical content flow.',
              details: [
                'H2 tags found: 2 (Vision, Mission)',
                'Proper heading hierarchy improves readability',
                'Helps both users and search engines navigate content',
              ],
            },
          ],
        },

        // Recommendations
        recommendations: [
          {
            priority: 'high',
            category: 'Technical',
            recommendation: 'Implement HTTPS to secure the website.',
            justification: 'HTTPS is a ranking signal and protects user data. Your site currently has insecure connections.',
            actionItems: [
              'Purchase an SSL certificate from a trusted provider',
              'Configure HTTPS on your web server',
              'Set up automatic HTTP to HTTPS redirects',
              'Update internal links to use HTTPS URLs',
              'Submit the new HTTPS version to Google Search Console',
            ],
          },
          {
            priority: 'high',
            category: 'On-Page',
            recommendation: 'Add a title tag to the homepage.',
            justification: 'Title tags are crucial for SEO and user understanding. Current length is 0 characters.',
            actionItems: [
              'Create a unique title (50-60 characters)',
              'Place the primary keyword near the beginning',
              'Include your brand name for recognition',
              'Use compelling language to improve CTR',
            ],
          },
          {
            priority: 'high',
            category: 'On-Page',
            recommendation: 'Add a meta description to the homepage.',
            justification: 'Meta descriptions improve click-through rates from search results. Current length is 0 characters.',
            actionItems: [
              'Write a compelling description (150-160 characters)',
              'Include your primary keyword naturally',
              'Make it action-oriented to encourage clicks',
              'Ensure it accurately reflects page content',
            ],
          },
          {
            priority: 'high',
            category: 'Technical',
            recommendation: 'Optimize images to reduce LCP. Focus on compressing large images and using appropriate formats.',
            justification: 'LCP is a Core Web Vital affecting user experience and ranking. Current LCP is 6.23s vs. benchmark of 2.5s.',
            actionItems: [
              'Compress all images using tools like TinyPNG',
              'Use modern formats like WebP instead of JPEG/PNG',
              'Implement lazy loading for below-fold images',
              'Serve responsive images with srcset attribute',
              'Consider using a CDN to serve images faster',
            ],
          },
          {
            priority: 'high',
            category: 'Technical',
            recommendation: 'Reduce CLS by reserving space for images and ads.',
            justification: 'CLS is a Core Web Vital affecting user experience. Current CLS is 0.379 vs. benchmark of < 0.1.',
            actionItems: [
              'Add explicit width/height attributes to all images',
              'Reserve space for ads using CSS aspect-ratio',
              'Avoid inserting content above the fold without space reservation',
              'Load fonts before rendering text to prevent layout shifts',
            ],
          },
          {
            priority: 'medium',
            category: 'On-Page',
            recommendation: 'Add alt text to all images.',
            justification: 'Alt text improves accessibility and helps search engines understand the image content.',
            actionItems: [
              'Add descriptive alt text to all 46 images',
              'Use keywords naturally where appropriate',
              'Keep alt text concise (max 125 characters)',
              'Avoid keyword stuffing in alt attributes',
            ],
          },
          {
            priority: 'medium',
            category: 'Technical',
            recommendation: 'Implement a canonical tag to the homepage.',
            justification: 'Canonical tags prevent duplicate content issues, especially if you use URL parameters.',
            actionItems: [
              'Add rel="canonical" to the homepage <head>',
              'Point to the preferred version of your URL',
              'Test implementation in Google Search Console',
            ],
          },
          {
            priority: 'medium',
            category: 'Technical',
            recommendation: 'Implement schema markup to provide more context to search engines.',
            justification: 'Schema markup can enhance search engine results with rich snippets.',
            actionItems: [
              'Implement Organization schema for your business',
              'Add LocalBusiness schema if you have a physical location',
              'Use BreadcrumbList schema for navigation',
              'Validate with Google Schema Markup Validator',
            ],
          },
          {
            priority: 'low',
            category: 'Content',
            recommendation: 'Perform keyword analysis to identify relevant keywords for the website.',
            justification: 'Keyword research informs content strategy and helps target the right audience.',
            actionItems: [
              'Use tools like Google Keyword Planner or Ahrefs',
              'Analyze competitor keywords in your niche',
              'Identify high-volume, low-competition keywords',
              'Create a keyword map for your site structure',
            ],
          },
          {
            priority: 'low',
            category: 'Content',
            recommendation: 'Perform a content gap analysis to identify content opportunities.',
            justification: 'Content gap analysis helps create content that fills user needs and attracts traffic.',
            actionItems: [
              'Compare your content to top-ranking competitors',
              'Identify topics covered by competitors but not you',
              'Create content to fill these gaps',
              'Expand existing content to be more comprehensive',
            ],
          },
        ],

        // Action Plan
        actionPlan: {
          high: [
            {
              recommendation: 'Implement HTTPS to secure the website.',
              category: 'Technical',
              priority: 'High',
              justification: 'HTTPS is a ranking signal and protects user data. Your site currently uses insecure HTTP connections.',
              actionItems: [
                'Purchase SSL certificate from trusted provider',
                'Configure HTTPS on your web server',
                'Set up automatic HTTP to HTTPS redirects',
                'Update all internal links to HTTPS',
              ],
            },
            {
              recommendation: 'Add a title tag to the homepage.',
              category: 'On-Page',
              priority: 'High',
              justification: 'Title tags are crucial for SEO and user understanding. They appear in search results as the clickable headline.',
              actionItems: [
                'Create unique title (50-60 characters)',
                'Place primary keyword near the beginning',
                'Include brand name for recognition',
                'Use compelling language for better CTR',
              ],
            },
            {
              recommendation: 'Add a meta description to the homepage.',
              category: 'On-Page',
              priority: 'High',
              justification: 'Meta descriptions improve click-through rates from search results by acting as an advertisement for your content.',
              actionItems: [
                'Write compelling description (150-160 characters)',
                'Include primary keyword naturally',
                'Make it action-oriented to encourage clicks',
                'Ensure accuracy to reduce bounce rates',
              ],
            },
            {
              recommendation: 'Optimize images to reduce LCP (6.23s → < 2.5s).',
              category: 'Technical',
              priority: 'High',
              justification: 'LCP is a Core Web Vital directly affecting user experience and search rankings. Current performance is 2.5x too slow.',
              actionItems: [
                'Compress all images using TinyPNG or similar',
                'Use modern WebP format instead of JPEG/PNG',
                'Implement lazy loading for below-fold images',
                'Serve responsive images with srcset',
              ],
            },
          ],
          medium: [
            {
              recommendation: 'Add alt text to all 46 images.',
              category: 'On-Page',
              priority: 'Medium',
              justification: 'Alt text improves accessibility and helps search engines understand image content, improving visibility in Image Search.',
              actionItems: [
                'Add descriptive alt text to all images',
                'Keep descriptions concise (max 125 chars)',
                'Use keywords naturally where appropriate',
                'Avoid keyword stuffing in alt attributes',
              ],
            },
            {
              recommendation: 'Implement canonical tag to prevent duplicate content issues.',
              category: 'Technical',
              priority: 'Medium',
              justification: 'Canonical tags signal the preferred version to search engines, preventing crawl budget waste on duplicates.',
              actionItems: [
                'Add rel="canonical" to <head> section',
                'Point to the preferred URL version',
                'Test in Google Search Console',
              ],
            },
            {
              recommendation: 'Implement schema markup for rich snippets.',
              category: 'Technical',
              priority: 'Medium',
              justification: 'Schema markup enables rich snippets in search results, increasing click-through rates and user engagement.',
              actionItems: [
                'Implement Organization schema',
                'Add LocalBusiness schema if applicable',
                'Use BreadcrumbList for navigation',
                'Validate with Schema Validator',
              ],
            },
          ],
          low: [
            {
              recommendation: 'Perform keyword analysis to identify target keywords.',
              category: 'Content',
              priority: 'Low',
              justification: 'Keyword research informs your content strategy and helps you target the right audience effectively.',
              actionItems: [
                'Use Google Keyword Planner or Ahrefs',
                'Analyze competitor keywords',
                'Identify high-volume, low-competition keywords',
              ],
            },
            {
              recommendation: 'Perform content gap analysis.',
              category: 'Content',
              priority: 'Low',
              justification: 'Gap analysis reveals topics your competitors cover that you don\'t, presenting growth opportunities.',
              actionItems: [
                'Compare content against competitors',
                'Identify missing topics',
                'Create content to fill gaps',
              ],
            },
          ],
        },
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

  const handleDownload = () => {
    // Placeholder for download functionality
    console.log('Downloading audit report...');
  };

  const handleShare = () => {
    // Placeholder for share functionality
    console.log('Sharing audit report...');
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
              <p className="text-muted-foreground mt-1">Comprehensive analysis and recommendations</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={handleShare} variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Executive Summary */}
              <ExecutiveSummary
                summary={{
                  url: analysis.url,
                  auditDate: analysis.auditDate,
                  score: analysis.score,
                  status: analysis.status,
                  assessment: analysis.assessment,
                  findingsCount: {
                    good: analysis.findings.good.length,
                    recommended: analysis.findings.recommended.length,
                    critical: analysis.findings.critical.length,
                  },
                }}
              />

              {/* Overall Score */}
              <ScoreCard score={analysis.score} />

              {/* Performance Metrics Table */}
              <PerformanceTable metrics={analysis.metrics} />

              {/* Metrics Grid */}
              <MetricsGrid metrics={analysis.metrics} />

              {/* Issues/Findings */}
              <IssuesList findings={analysis.findings} />

              {/* Recommendations */}
              <RecommendationsList recommendations={analysis.recommendations} />

              {/* Action Plan */}
              <ActionPlan
                actions={{
                  high: analysis.actionPlan.high,
                  medium: analysis.actionPlan.medium,
                  low: analysis.actionPlan.low,
                }}
              />

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-900/30 dark:to-slate-900/10 rounded-lg border border-blue-200 dark:border-slate-700 p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Next Steps</h3>
                <p className="text-muted-foreground mb-4">
                  Start by fixing the high-priority items listed in the action plan above. These will have the biggest impact on your SEO performance.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleGoBack} variant="outline">Back to Dashboard</Button>
                  <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>View Full Report</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-card border border-border rounded-lg">
              <p className="text-lg text-muted-foreground">Could not retrieve analysis for this URL.</p>
              <Button onClick={handleGoBack} variant="outline" className="mt-4">Back to Dashboard</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeoResultsPage;
