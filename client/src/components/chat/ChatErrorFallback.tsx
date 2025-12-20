/**
 * Chat Error Fallback Component
 * Displays when ChatWindow encounters an error
 * Provides graceful degradation without crashing the entire app
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ChatErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function ChatErrorFallback({ error, resetError }: ChatErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-wood-darker rounded-lg p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-blood-red mb-4" />

      <h3 className="text-xl font-western text-desert-sand mb-2">
        Chat Temporarily Unavailable
      </h3>

      <p className="text-desert-dust mb-6 max-w-md">
        The chat system encountered an error. Your messages are safe, but you may need to refresh.
      </p>

      {error && import.meta.env.DEV && (
        <details className="text-left w-full max-w-md mb-4">
          <summary className="text-sm text-desert-dust cursor-pointer hover:text-desert-sand">
            Error Details (Dev Only)
          </summary>
          <pre className="mt-2 p-3 bg-wood-dark rounded text-xs overflow-auto">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blood-red hover:bg-blood-dark text-desert-sand rounded-lg font-serif transition-colors"
        >
          <RefreshCw className="inline w-4 h-4 mr-2" />
          Reload Page
        </button>

        {resetError && (
          <button
            onClick={resetError}
            className="px-6 py-3 bg-wood-medium hover:bg-wood-dark text-desert-sand rounded-lg font-serif transition-colors"
          >
            Try Again
          </button>
        )}
      </div>

      <p className="text-xs text-desert-dust mt-6">
        If this persists, contact support or try again later.
      </p>
    </div>
  );
}
