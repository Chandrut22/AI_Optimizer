import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const getPriorityBadge = (priority) => {
  if (priority === 'high') return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
  if (priority === 'medium') return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
  return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
};

const getCategoryColor = (category) => {
  const colors = {
    'Technical': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    'On-Page': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'Content': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  };
  return colors[category] || colors['Technical'];
};

const RecommendationItem = ({ recommendation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg p-4 mb-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-shrink-0 mt-0.5">
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground text-sm">{recommendation.recommendation}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${getPriorityBadge(recommendation.priority)}`}>
              {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${getCategoryColor(recommendation.category)}`}>
              {recommendation.category}
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pl-8 border-t border-border pt-3">
          <div className="bg-muted/30 rounded p-3 mb-3">
            <p className="text-sm text-foreground"><strong>Impact:</strong> {recommendation.justification}</p>
          </div>
          {recommendation.actionItems && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Action Items:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                {recommendation.actionItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RecommendationsList = ({ recommendations = [] }) => {
  if (recommendations.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">Strategic Recommendations</h3>
        <p className="text-muted-foreground">No recommendations available.</p>
      </div>
    );
  }

  // Group by priority
  const grouped = {
    high: recommendations.filter(r => r.priority === 'high'),
    medium: recommendations.filter(r => r.priority === 'medium'),
    low: recommendations.filter(r => r.priority === 'low'),
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-foreground mb-6">Strategic Recommendations</h3>

      {grouped.high.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold mb-3 text-red-600 dark:text-red-400">
            High Priority ({grouped.high.length})
          </h4>
          <div className="space-y-3 pl-3 border-l-2 border-red-500 dark:border-red-400">
            {grouped.high.map((rec, idx) => (
              <RecommendationItem key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {grouped.medium.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-semibold mb-3 text-yellow-600 dark:text-yellow-400">
            Medium Priority ({grouped.medium.length})
          </h4>
          <div className="space-y-3 pl-3 border-l-2 border-yellow-500 dark:border-yellow-400">
            {grouped.medium.map((rec, idx) => (
              <RecommendationItem key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {grouped.low.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-blue-600 dark:text-blue-400">
            Low Priority ({grouped.low.length})
          </h4>
          <div className="space-y-3 pl-3 border-l-2 border-blue-500 dark:border-blue-400">
            {grouped.low.map((rec, idx) => (
              <RecommendationItem key={idx} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;
