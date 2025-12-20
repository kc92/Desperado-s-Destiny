/**
 * Page Error Fallback Component
 * Generic error display for any page that encounters an error
 * Provides navigation back to a specified route and retry option
 *
 * PHASE 2 FIX: Created to provide consistent error handling across pages
 */

import { Home, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/services/logger.service';

interface PageErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  pageName?: string;
  backPath?: string;
  backLabel?: string;
}

/**
 * Generic page error fallback that can be customized for any page
 */
export function PageErrorFallback({
  error,
  resetError,
  pageName = 'Page',
  backPath = '/game',
  backLabel = 'Back to Game'
}: PageErrorFallbackProps) {
  const navigate = useNavigate();

  // Log the error for monitoring
  if (error) {
    logger.error(`${pageName} error boundary triggered`, error, { pageName, backPath });
  }

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      // If no resetError provided, refresh the page
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-wood-dark rounded-xl shadow-xl p-6 border-2 border-wood-medium">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-blood-red" />
        </div>

        <h2 className="text-2xl font-western text-center text-desert-sand mb-3">
          {pageName} Error
        </h2>

        <p className="text-desert-dust text-center mb-4">
          Something went wrong loading this page. Your progress is safe.
        </p>

        {error && import.meta.env.DEV && (
          <details className="mb-4 bg-wood-darker rounded p-3">
            <summary className="cursor-pointer text-desert-sand text-sm font-serif hover:text-gold-medium">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 text-xs text-desert-dust overflow-auto p-2 bg-black bg-opacity-50 rounded max-h-32">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-gold-medium hover:bg-gold-dark text-wood-darker rounded-lg font-serif transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>

          <button
            onClick={() => navigate(backPath)}
            className="px-6 py-2 bg-wood-medium hover:bg-wood-grain text-desert-sand rounded-lg font-serif transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </button>
        </div>

        <p className="text-center text-xs text-desert-dust mt-4">
          If this keeps happening, try refreshing or contact support.
        </p>
      </div>
    </div>
  );
}

/**
 * Pre-configured fallback components for specific pages
 */
export function GangErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Gang" backPath="/game" backLabel="Back to Game" />;
}

export function MarketplaceErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Marketplace" backPath="/game" backLabel="Back to Game" />;
}

export function PropertiesErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Properties" backPath="/game" backLabel="Back to Game" />;
}

export function SkillsErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Skills" backPath="/game" backLabel="Back to Game" />;
}

export function ActionsErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Actions" backPath="/game" backLabel="Back to Game" />;
}

export function MailErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Mail" backPath="/game" backLabel="Back to Game" />;
}

export function SettingsErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Settings" backPath="/game" backLabel="Back to Game" />;
}

export function ProfileErrorFallback(props: Omit<PageErrorFallbackProps, 'pageName'>) {
  return <PageErrorFallback {...props} pageName="Profile" backPath="/game" backLabel="Back to Game" />;
}
