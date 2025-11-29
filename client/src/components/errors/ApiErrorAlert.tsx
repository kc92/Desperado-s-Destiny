/**
 * API Error Alert Component
 * Displays individual API error notifications
 */

import React from 'react';
import type { ApiError } from '@/store/useErrorStore';

interface ApiErrorAlertProps {
  error: ApiError;
  onDismiss: (id: string) => void;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({ error, onDismiss }) => {
  const getStatusIcon = (status: number) => {
    if (status >= 500) return '🔥';
    if (status === 429) return '⏱️';
    if (status === 404) return '🔍';
    if (status === 403) return '🚫';
    if (status === 401) return '🔐';
    return '⚠️';
  };

  const getStatusLabel = (status: number) => {
    if (status >= 500) return 'Server Error';
    if (status === 429) return 'Rate Limited';
    if (status === 404) return 'Not Found';
    if (status === 403) return 'Forbidden';
    if (status === 401) return 'Unauthorized';
    if (status === 0) return 'Network Error';
    return `Error ${status}`;
  };

  return (
    <div
      className="bg-red-900/90 border border-red-500 rounded-lg p-4 shadow-lg animate-slide-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{getStatusIcon(error.status)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-red-300 text-xs font-medium uppercase tracking-wide">
              {getStatusLabel(error.status)}
            </span>
            <button
              onClick={() => onDismiss(error.id)}
              className="text-red-300 hover:text-white transition-colors"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
          <p className="text-white text-sm mt-1 break-words">{error.message}</p>
        </div>
      </div>
    </div>
  );
};
