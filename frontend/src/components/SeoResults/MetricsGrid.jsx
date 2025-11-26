import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const MetricItem = ({ label, value, unit, benchmark, status }) => {
  const getStatusIcon = () => {
    if (status === 'good') return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    if (status === 'critical') return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    return null;
  };

  const getStatusColor = () => {
    if (status === 'good') return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
    if (status === 'warning') return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
    if (status === 'critical') return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
    return 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800';
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {getStatusIcon()}
      </div>
      <div className="mb-3">
        <p className="text-2xl font-bold text-foreground">
          {value}
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </p>
      </div>
      {benchmark && (
        <p className="text-xs text-muted-foreground">
          Benchmark: {benchmark}
        </p>
      )}
    </div>
  );
};

const MetricsGrid = ({ metrics = {} }) => {
  const {
    lcp = null,
    fid = null,
    cls = null,
    responseTime = null,
    pageSize = null,
  } = metrics;

  const renderMetric = (label, value, unit, benchmark, status) => {
    if (value === null || value === undefined) return null;
    return <MetricItem key={label} label={label} value={value} unit={unit} benchmark={benchmark} status={status} />;
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-4">Site Performance & Core Web Vitals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lcp !== null && renderMetric(
          'Largest Contentful Paint',
          lcp,
          's',
          '< 2.5s',
          lcp < 2.5 ? 'good' : lcp < 4 ? 'warning' : 'critical'
        )}
        {fid !== null && renderMetric(
          'First Input Delay',
          fid,
          'ms',
          '< 100ms',
          fid < 100 ? 'good' : fid < 300 ? 'warning' : 'critical'
        )}
        {cls !== null && renderMetric(
          'Cumulative Layout Shift',
          cls.toFixed(3),
          '',
          '< 0.1',
          cls < 0.1 ? 'good' : cls < 0.25 ? 'warning' : 'critical'
        )}
        {responseTime !== null && renderMetric(
          'Response Time',
          responseTime,
          's',
          'varies',
          responseTime < 1 ? 'good' : responseTime < 2 ? 'warning' : 'critical'
        )}
        {pageSize !== null && renderMetric(
          'Page Size',
          (pageSize / 1024).toFixed(1),
          'KB',
          '< 3000 KB',
          pageSize < 3000 * 1024 ? 'good' : pageSize < 5000 * 1024 ? 'warning' : 'critical'
        )}
      </div>
    </div>
  );
};

export default MetricsGrid;
