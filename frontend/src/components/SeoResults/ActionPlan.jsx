import React from 'react';
import { CheckCircle2, Zap, TrendingUp } from 'lucide-react';

const ActionItem = ({ action, index }) => {
  const getPriorityStyles = () => {
    if (action.priority === 'High') {
      return {
        bg: 'bg-red-50 dark:bg-red-900/10',
        border: 'border-l-4 border-l-red-500',
        badge: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
        icon: 'text-red-600 dark:text-red-400',
      };
    } else if (action.priority === 'Medium') {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/10',
        border: 'border-l-4 border-l-yellow-500',
        badge: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
        icon: 'text-yellow-600 dark:text-yellow-400',
      };
    } else {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'border-l-4 border-l-blue-500',
        badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        icon: 'text-blue-600 dark:text-blue-400',
      };
    }
  };

  const styles = getPriorityStyles();

  return (
    <div className={`${styles.bg} ${styles.border} rounded-lg p-4 mb-4`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-current flex-col">
          <span className="text-sm font-bold text-foreground">{index}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h4 className="font-semibold text-foreground text-sm flex-1">{action.recommendation}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${styles.badge}`}>
              {action.priority}
            </span>
          </div>

          <p className="text-xs font-medium text-muted-foreground mb-2">{action.category}</p>

          <p className="text-sm text-foreground mb-3">
            {action.justification}
          </p>

          {action.actionItems && action.actionItems.length > 0 && (
            <div className="mt-3 bg-white dark:bg-slate-800/50 rounded p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Suggested Actions:</p>
              <ul className="space-y-1">
                {action.actionItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionPlan = ({ actions = {} }) => {
  const {
    high = [],
    medium = [],
    low = [],
  } = actions;

  // Combine all actions in priority order
  const allActions = [
    ...high.map(a => ({ ...a, priority: 'High' })),
    ...medium.map(a => ({ ...a, priority: 'Medium' })),
    ...low.map(a => ({ ...a, priority: 'Low' })),
  ];

  if (allActions.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-4">Strategic Action Plan</h3>
        <p className="text-muted-foreground">No action plan available.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-foreground">Strategic Action Plan</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Prioritized roadmap based on impact (High to Low). Executing the High Priority items will yield the fastest results.
        </p>
      </div>

      {/* High Priority Section */}
      {high.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-200 dark:border-red-900/30">
            <div className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400"></div>
            <h4 className="font-semibold text-foreground text-sm">High Priority (Critical Fixes)</h4>
          </div>
          {high.map((action, idx) => (
            <ActionItem key={idx} action={action} index={idx + 1} />
          ))}
        </div>
      )}

      {/* Medium Priority Section */}
      {medium.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-yellow-200 dark:border-yellow-900/30">
            <div className="h-2 w-2 rounded-full bg-yellow-600 dark:bg-yellow-400"></div>
            <h4 className="font-semibold text-foreground text-sm">Medium Priority (Optimization)</h4>
          </div>
          {medium.map((action, idx) => (
            <ActionItem key={idx} action={action} index={high.length + idx + 1} />
          ))}
        </div>
      )}

      {/* Low Priority Section */}
      {low.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200 dark:border-blue-900/30">
            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            <h4 className="font-semibold text-foreground text-sm">Low Priority (Maintenance)</h4>
          </div>
          {low.map((action, idx) => (
            <ActionItem key={idx} action={action} index={high.length + medium.length + idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionPlan;
