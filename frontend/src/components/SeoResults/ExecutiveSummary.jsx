import React from 'react';
import { Calendar, Globe, AlertCircle } from 'lucide-react';

const ExecutiveSummary = ({ summary = {} }) => {
  const {
    url = 'N/A',
    auditDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    score = 0,
    status = 'Needs Improvement',
    findingsCount = { good: 0, recommended: 0, critical: 0 },
    assessment = '',
  } = summary;

  const totalFindings = findingsCount.good + findingsCount.recommended + findingsCount.critical;

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900/30 dark:to-slate-900/10 rounded-lg border border-blue-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-foreground mb-4">Executive Summary</h2>

      <div className="space-y-4">
        {/* URL and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Target Website</p>
              <p className="text-sm font-medium text-foreground break-all">{url}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Audit Date</p>
              <p className="text-sm font-medium text-foreground">{auditDate}</p>
            </div>
          </div>
        </div>

        {/* Health Assessment */}
        <div className="mt-6 pt-4 border-t border-blue-200 dark:border-slate-700">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">Current Health Assessment</p>
              <p className="text-sm text-foreground">
                The website is currently performing at a score of <strong className="text-blue-600 dark:text-blue-400">{score}/100</strong> and {assessment || 'requires attention regarding critical technical SEO factors and content optimization.'}
              </p>
            </div>
          </div>
        </div>

        {/* Findings Overview */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-slate-600">
            <p className="text-xs font-medium text-muted-foreground">Good Results</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{findingsCount.good}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-slate-600">
            <p className="text-xs font-medium text-muted-foreground">Recommended</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{findingsCount.recommended}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-slate-600">
            <p className="text-xs font-medium text-muted-foreground">Critical Issues</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{findingsCount.critical}</p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-800">
          <p className="text-xs text-foreground">
            <strong>Total Findings:</strong> {totalFindings} items identified during this audit. The sections below detail every aspect of the site's performance, contrasting current metrics against industry standards and Google's Core Web Vitals benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
