import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const getStatusIcon = (status) => {
  if (status === 'good') return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
  if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
  return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
};

const getStatusBadge = (status) => {
  if (status === 'good') return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
  if (status === 'warning') return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
  return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
};

const PerformanceTable = ({ metrics = {} }) => {
  const rows = [
    {
      metric: 'Largest Contentful Paint (LCP)',
      value: metrics.lcp ? `${metrics.lcp}s` : 'N/A',
      benchmark: '< 2.5s',
      status: metrics.lcp ? (metrics.lcp < 2.5 ? 'good' : metrics.lcp < 4 ? 'warning' : 'critical') : null,
      description: 'Measures loading performance'
    },
    {
      metric: 'First Input Delay (FID)',
      value: metrics.fid ? `${metrics.fid}ms` : 'N/A',
      benchmark: '< 100ms',
      status: metrics.fid ? (metrics.fid < 100 ? 'good' : metrics.fid < 300 ? 'warning' : 'critical') : null,
      description: 'Measures interactivity'
    },
    {
      metric: 'Cumulative Layout Shift (CLS)',
      value: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
      benchmark: '< 0.1',
      status: metrics.cls ? (metrics.cls < 0.1 ? 'good' : metrics.cls < 0.25 ? 'warning' : 'critical') : null,
      description: 'Measures visual stability'
    },
    {
      metric: 'Overall Performance Score',
      value: metrics.performanceScore ? `${metrics.performanceScore}/100` : 'N/A',
      benchmark: '> 90',
      status: metrics.performanceScore ? (metrics.performanceScore >= 90 ? 'good' : metrics.performanceScore >= 50 ? 'warning' : 'critical') : null,
      description: 'General health indicator'
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-4">Performance Metrics</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Metric</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Value</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Benchmark</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Assessment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-foreground text-sm">{row.metric}</p>
                    <p className="text-xs text-muted-foreground mt-1">{row.description}</p>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-foreground">{row.value}</td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{row.benchmark}</td>
                <td className="py-4 px-4">
                  {row.status && (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(row.status)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${getStatusBadge(row.status)}`}>
                        {row.status === 'good' ? 'Good' : row.status === 'warning' ? 'Needs Improvement' : 'Critical'}
                      </span>
                    </div>
                  )}
                  {!row.status && <span className="text-xs text-muted-foreground">Not Available</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceTable;
