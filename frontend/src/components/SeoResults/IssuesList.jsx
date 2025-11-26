import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const IssueCard = ({ issue }) => {
  const getIcon = () => {
    if (issue.priority === 'critical') return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    if (issue.priority === 'recommended') return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
  };

  const getBorderColor = () => {
    if (issue.priority === 'critical') return 'border-l-4 border-l-red-500 dark:border-l-red-400';
    if (issue.priority === 'recommended') return 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400';
    return 'border-l-4 border-l-green-500 dark:border-l-green-400';
  };

  const getBackgroundColor = () => {
    if (issue.priority === 'critical') return 'bg-red-50 dark:bg-red-900/10';
    if (issue.priority === 'recommended') return 'bg-yellow-50 dark:bg-yellow-900/10';
    return 'bg-green-50 dark:bg-green-900/10';
  };

  return (
    <div className={`${getBorderColor()} ${getBackgroundColor()} rounded-lg p-4 mb-3`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground text-sm">{issue.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
          {issue.details && (
            <ul className="list-disc list-inside mt-2 text-xs text-muted-foreground space-y-1">
              {issue.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const IssuesList = ({ findings = {} }) => {
  const { critical = [], recommended = [], good = [] } = findings;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-6">Audit Findings</h3>

      {/* Critical Issues */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h4 className="font-semibold text-foreground">
            Critical Issues <span className="text-sm font-normal text-muted-foreground">({critical.length})</span>
          </h4>
        </div>
        {critical.length > 0 ? (
          <div className="space-y-3 ml-7">
            {critical.map((issue, idx) => (
              <IssueCard key={idx} issue={{ ...issue, priority: 'critical' }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground ml-7">No critical issues found.</p>
        )}
      </div>

      {/* Recommended Improvements */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h4 className="font-semibold text-foreground">
            Recommended Improvements <span className="text-sm font-normal text-muted-foreground">({recommended.length})</span>
          </h4>
        </div>
        {recommended.length > 0 ? (
          <div className="space-y-3 ml-7">
            {recommended.map((issue, idx) => (
              <IssueCard key={idx} issue={{ ...issue, priority: 'recommended' }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground ml-7">No recommended improvements at this time.</p>
        )}
      </div>

      {/* Good Results */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h4 className="font-semibold text-foreground">
            Good Results <span className="text-sm font-normal text-muted-foreground">({good.length})</span>
          </h4>
        </div>
        {good.length > 0 ? (
          <div className="space-y-3 ml-7">
            {good.map((issue, idx) => (
              <IssueCard key={idx} issue={{ ...issue, priority: 'good' }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground ml-7">No good results recorded.</p>
        )}
      </div>
    </div>
  );
};

export default IssuesList;
