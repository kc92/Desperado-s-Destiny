/**
 * Error Handling Utilities
 *
 * Standardized error handling for service methods.
 * Replaces ad-hoc console.error() calls with proper logging and monitoring.
 */

import logger from './logger';
import { captureException } from '../config/sentry';
import { AppError } from './errors';

/**
 * Context for service error handling
 */
export interface ServiceErrorContext {
  /** Service name (e.g., 'IllegalMiningService') */
  service: string;
  /** Method name (e.g., 'stakeIllegalClaim') */
  method: string;
  /** Additional context data */
  [key: string]: unknown;
}

/**
 * Handle service-level errors consistently.
 *
 * This utility:
 * 1. Logs the error with full context using Winston
 * 2. Captures non-operational errors in Sentry for monitoring
 * 3. Returns a standardized error message for the caller
 *
 * Usage:
 * ```typescript
 * try {
 *   // service logic
 * } catch (error) {
 *   handleServiceError(error, { service: 'MyService', method: 'myMethod', userId });
 *   return { success: false, error: 'Operation failed' };
 * }
 * ```
 *
 * @param error - The caught error
 * @param context - Service and method context for logging
 */
export function handleServiceError(
  error: unknown,
  context: ServiceErrorContext
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Log with full context
  logger.error(`[${context.service}] ${context.method} error: ${errorMessage}`, {
    ...context,
    errorMessage,
    errorStack,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  });

  // Capture non-operational errors in Sentry
  // AppError with isOperational=true are expected errors (validation, not found, etc.)
  // Only capture unexpected errors for monitoring
  if (error instanceof Error) {
    const isOperational = error instanceof AppError && error.isOperational;

    if (!isOperational) {
      captureException(error, {
        tags: {
          service: context.service,
          method: context.method,
        },
        extra: context,
      });
    }
  }
}

/**
 * Create a bound error handler for a specific service.
 *
 * Usage:
 * ```typescript
 * const handleError = createServiceErrorHandler('MyService');
 *
 * try {
 *   // service logic
 * } catch (error) {
 *   handleError(error, 'myMethod', { additionalContext });
 * }
 * ```
 *
 * @param serviceName - The service name to bind
 * @returns A function that handles errors for that service
 */
export function createServiceErrorHandler(serviceName: string) {
  return (
    error: unknown,
    methodName: string,
    additionalContext?: Record<string, unknown>
  ): void => {
    handleServiceError(error, {
      service: serviceName,
      method: methodName,
      ...additionalContext,
    });
  };
}

/**
 * Wrap an async function with standardized error handling.
 *
 * This is useful for service methods that need consistent error handling
 * without repeating try/catch blocks.
 *
 * Usage:
 * ```typescript
 * const safeOperation = withErrorHandling(
 *   async () => { /* operation *\/ },
 *   { service: 'MyService', method: 'myMethod' },
 *   { success: false, error: 'Operation failed' } // default return on error
 * );
 * ```
 *
 * @param fn - The async function to wrap
 * @param context - Service error context
 * @param defaultReturn - Value to return if an error occurs
 * @returns The wrapped function
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ServiceErrorContext,
  defaultReturn: T
): Promise<T> {
  return fn().catch((error) => {
    handleServiceError(error, context);
    return defaultReturn;
  });
}

/**
 * Log a warning for non-critical issues that don't need Sentry capture.
 *
 * Use this for expected edge cases that should be logged but aren't errors.
 *
 * @param context - Service and method context
 * @param message - Warning message
 * @param data - Additional data to log
 */
export function logServiceWarning(
  context: { service: string; method: string },
  message: string,
  data?: Record<string, unknown>
): void {
  logger.warn(`[${context.service}] ${context.method}: ${message}`, {
    ...context,
    ...data,
  });
}
