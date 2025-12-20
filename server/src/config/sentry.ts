/**
 * Sentry Error Tracking Configuration - Server
 * Captures and reports backend errors for monitoring and debugging
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Try loading from server/.env first, then fall back to project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Application, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Initialize Sentry error tracking for the Node.js application
 * Call this function at the very top of your server entry point
 */
export function initializeSentry(): void {
  // Only initialize if DSN is provided
  const dsn = process.env.SENTRY_DSN;

  if (!dsn || dsn === 'YOUR_SERVER_DSN_HERE') {
    logger.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  // Get environment and release info
  const environment = process.env.NODE_ENV || 'development';
  const release = process.env.SENTRY_RELEASE || `desperados-destiny-server@1.0.0`;

  Sentry.init({
    dsn,

    // Environment configuration
    environment,
    release,

    // Server name for identification
    serverName: process.env.SERVER_NAME || `dd-server-${process.pid}`,

    // Performance monitoring integrations
    integrations: [
      // Enable profiling
      nodeProfilingIntegration(),
    ],

    // Performance monitoring sample rates
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development if configured
      if (environment === 'development' && process.env.SENTRY_DISABLE_IN_DEV === 'true') {
        return null;
      }

      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore MongoDB connection timeout errors (usually temporary)
        if (error.message.includes('MongoServerSelectionError')) {
          return null;
        }

        // Ignore Redis connection errors (usually temporary)
        if (error.message.includes('Redis') && error.message.includes('ECONNREFUSED')) {
          return null;
        }
      }

      return event;
    },

    // Additional configuration
    debug: environment === 'development',
    enabled: environment !== 'test', // Disable in test environment

    // Normalize depth for data normalization
    normalizeDepth: 5,

    // Maximum breadcrumbs
    maxBreadcrumbs: 50,

    // Capture console logs as breadcrumbs
    attachStacktrace: true,
  });

  logger.info('Sentry initialized', { environment });
}

/**
 * Sentry request handler middleware
 * Add this early in your Express middleware chain
 * @param app - Express application instance
 */
export function setupSentryRequestHandler(app: Application): void {
  if (!process.env.SENTRY_DSN || process.env.SENTRY_DSN === 'YOUR_SERVER_DSN_HERE') {
    return;
  }

  // Use Sentry's Express instrumentation
  Sentry.setupExpressErrorHandler(app);
}

/**
 * Sentry error handler middleware
 * Add this after all other middleware but before your custom error handlers
 * @param _app - Express application instance (not used in new API, kept for compatibility)
 */
export function setupSentryErrorHandler(_app: Application): void {
  // In the new Sentry SDK, setupExpressErrorHandler handles both request and error handling
  // This function is kept for API compatibility but the work is done in setupSentryRequestHandler
}

/**
 * Manually capture an exception
 * @param error - The error to capture
 * @param context - Optional context object with additional information
 */
export function captureException(error: Error, context?: {
  user?: { id: string; username?: string; email?: string };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: Sentry.SeverityLevel;
}): void {
  if (context) {
    Sentry.withScope((scope) => {
      if (context.user) {
        scope.setUser(context.user);
      }
      if (context.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      if (context.level) {
        scope.setLevel(context.level);
      }
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Manually capture a message
 * @param message - The message to capture
 * @param level - Severity level
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
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
 * Add breadcrumb for tracking events
 * @param message - Description of the event
 * @param category - Category of the event
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level?: Sentry.SeverityLevel
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level: level || 'info',
    data,
  });
}

/**
 * Wrap async middleware/route handlers with Sentry error catching
 * @param fn - Async function to wrap
 */
export function wrapAsync<T extends Request = Request, U extends Response = Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Close Sentry and flush remaining events
 * Call this during graceful shutdown
 * @param timeout - Maximum time to wait for events to flush (ms)
 */
export async function closeSentry(timeout = 2000): Promise<void> {
  if (!process.env.SENTRY_DSN || process.env.SENTRY_DSN === 'YOUR_SERVER_DSN_HERE') {
    return;
  }

  try {
    await Sentry.close(timeout);
    logger.info('Sentry closed successfully');
  } catch (error) {
    logger.error('Error closing Sentry', error as Error);
  }
}

// Re-export Sentry for advanced usage
export { Sentry };
