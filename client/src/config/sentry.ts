/**
 * Sentry Error Tracking Configuration - Client
 * Captures and reports frontend errors for monitoring and debugging
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking for the React application
 * Call this function early in the application lifecycle, before React renders
 */
export function initializeSentry(): void {
  // Only initialize if DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn || dsn === 'YOUR_CLIENT_DSN_HERE') {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  // Get environment and release info
  const environment = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
  const release = import.meta.env.VITE_SENTRY_RELEASE || `desperados-destiny-client@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`;

  Sentry.init({
    dsn,

    // Environment configuration
    environment,
    release,

    // Performance monitoring - Browser tracing
    integrations: [
      Sentry.browserTracingIntegration(),
      // Replay integration for session recording (optional)
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Trace propagation targets
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/api\.desperados-destiny\.com/,
      /^https:\/\/desperados-destiny\.com/,
    ],

    // Performance monitoring sample rates
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Session replay sample rates
    replaysSessionSampleRate: environment === 'production' ? 0.01 : 0.1, // 1% in prod, 10% in dev
    replaysOnErrorSampleRate: environment === 'production' ? 0.5 : 1.0, // 50% in prod, 100% in dev

    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development if configured
      if (environment === 'development' && import.meta.env.VITE_SENTRY_DISABLE_IN_DEV === 'true') {
        return null;
      }

      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore network errors that are expected
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          return null;
        }

        // Ignore browser extension errors
        if (error.message.includes('chrome-extension://') || error.message.includes('moz-extension://')) {
          return null;
        }
      }

      return event;
    },

    // Additional configuration
    debug: environment === 'development',
    enabled: environment !== 'test', // Disable in test environment

    // Normalize URLs to prevent PII leakage
    normalizeDepth: 5,
  });

  console.info('Sentry initialized for environment:', environment);
}

/**
 * Manually capture an exception
 * @param error - The error to capture
 * @param context - Optional context object with additional information
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Manually capture a message
 * @param message - The message to capture
 * @param level - Severity level (error, warning, info, debug)
 */
export function captureMessage(message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 * @param user - User information to attach to error reports
 */
export function setUserContext(user: { id: string; username?: string; email?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for tracking user actions
 * @param message - Description of the action
 * @param category - Category of the action
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

/**
 * Wrap component with Sentry error boundary
 * Use this to create error boundaries with Sentry integration
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

// Re-export Sentry for advanced usage
export { Sentry };
