/**
 * Game Error Fallback Component
 * Displays when Game page encounters an error
 * Provides navigation back to character select
 */

import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function GameErrorFallback({ error, resetError }: GameErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-wood-darker flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-wood-dark rounded-xl shadow-2xl p-8 border-4 border-wood-medium">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="w-20 h-20 text-blood-red" />
        </div>

        <h1 className="text-3xl font-western text-center text-desert-sand mb-4">
          Game Error
        </h1>

        <p className="text-lg text-desert-dust text-center mb-6">
          Something went wrong while loading the game. Don't worry, your progress is saved.
        </p>

        {error && import.meta.env.DEV && (
          <details className="mb-6 bg-wood-darker rounded p-4">
            <summary className="cursor-pointer text-desert-sand font-serif hover:text-gold-medium">
              Error Details (Development)
            </summary>
            <pre className="mt-4 text-xs text-desert-dust overflow-auto p-3 bg-black bg-opacity-50 rounded">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetError}
            className="px-8 py-3 bg-gold-medium hover:bg-gold-dark text-wood-darker rounded-lg font-serif text-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <button
            onClick={() => navigate('/characters')}
            className="px-8 py-3 bg-wood-medium hover:bg-wood-grain text-desert-sand rounded-lg font-serif text-lg transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Character Select
          </button>
        </div>

        <p className="text-center text-sm text-desert-dust mt-6">
          If this error persists, try refreshing the page or contact support.
        </p>
      </div>
    </div>
  );
}
