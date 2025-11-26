import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const ScoreCard = ({ score = 0 }) => {
  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-300', borderColor: 'border-green-300 dark:border-green-700' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300', borderColor: 'border-blue-300 dark:border-blue-700' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-100 dark:bg-yellow-900/20', textColor: 'text-yellow-700 dark:text-yellow-300', borderColor: 'border-yellow-300 dark:border-yellow-700' };
    return { label: 'Poor', color: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300', borderColor: 'border-red-300 dark:border-red-700' };
  };

  const status = getScoreStatus(score);

  const getIcon = () => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />;
    if (score >= 60) return <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
    return <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className={`rounded-lg border-2 ${status.borderColor} ${status.color} p-8 mb-8`}>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Overall SEO Score</h2>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-foreground">{score}</span>
            <span className="text-xl font-semibold text-muted-foreground mb-2">/100</span>
          </div>
          <p className={`text-sm font-medium mt-3 ${status.textColor}`}>{status.label}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
