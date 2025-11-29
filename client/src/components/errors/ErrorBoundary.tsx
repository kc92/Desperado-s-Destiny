/**
 * Error Boundary Component
 * Catches React rendering errors and displays fallback UI
 * Integrated with Sentry for error tracking and monitoring
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDialog?: boolean; // Show Sentry error dialog
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Capture exception with Sentry and include component stack
    Sentry.withScope((scope) => {
      // Add component stack as extra context
      scope.setExtra('componentStack', errorInfo.componentStack);

      // Add error boundary name if available
      scope.setTag('error_boundary', 'React.ErrorBoundary');

      // Capture the exception and get event ID
      const eventId = Sentry.captureException(error);

      // Store event ID in state for user reporting
      this.setState({ errorInfo, eventId });
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReportFeedback = () => {
    // Show Sentry user feedback dialog if event ID is available
    if (this.state.eventId) {
      Sentry.showReportDialog({
        eventId: this.state.eventId,
        title: 'It looks like we\'re having issues.',
        subtitle: 'Our team has been notified.',
        subtitle2: 'If you\'d like to help, tell us what happened below.',
        labelName: 'Name',
        labelEmail: 'Email',
        labelComments: 'What happened?',
        labelClose: 'Close',
        labelSubmit: 'Submit',
        errorGeneric: 'An error occurred while submitting your report. Please try again.',
        errorFormEntry: 'Some fields were invalid. Please correct them and try again.',
        successMessage: 'Your feedback has been sent. Thank you!',
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with Sentry integration
      return (
        <div
          className="min-h-screen bg-stone-900 flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-stone-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {/* Show event ID for reference */}
            {this.state.eventId && (
              <p className="text-stone-400 text-sm mb-6">
                Error ID: {this.state.eventId.substring(0, 8)}
              </p>
            )}

            <div className="space-y-3">
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.replace('/')}
                  className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors"
                >
                  Go Home
                </button>
              </div>

              {/* Show feedback button if Sentry is configured and showDialog is enabled */}
              {this.state.eventId && this.props.showDialog !== false && (
                <button
                  onClick={this.handleReportFeedback}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
                >
                  Report Feedback
                </button>
              )}
            </div>

            {/* Development mode: Show component stack */}
            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-stone-400 text-sm hover:text-stone-300">
                  Component Stack
                </summary>
                <pre className="mt-2 text-xs text-stone-500 overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
