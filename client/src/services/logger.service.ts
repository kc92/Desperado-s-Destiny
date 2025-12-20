/**
 * Centralized logging service
 * - Development: All logs shown in console
 * - Production: Errors and warnings sent to Sentry, debug/info silent
 *
 * SECURITY: All production errors are now captured by Sentry for monitoring
 */

import { captureException, captureMessage } from '@/config/sentry';

interface LogContext {
  [key: string]: any;
}

class LoggerService {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Debug logging - only in development
   * Use for: Development debugging, state tracking
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logging - only in development
   * Use for: User actions, successful operations
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Warning logging - shown in both dev and production
   * Use for: Recoverable errors, deprecation notices
   *
   * SECURITY: Warnings are captured to Sentry in production for monitoring
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');

    if (this.isProduction) {
      try {
        captureMessage(`[WARN] ${message}`, 'warning');
      } catch {
        // Sentry might not be initialized yet - fail silently
      }
    }
  }

  /**
   * Error logging - always shown and tracked
   * Use for: Exceptions, failed operations, critical issues
   *
   * SECURITY: All production errors are captured to Sentry for monitoring
   */
  error(message: string, error?: Error, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error, context || '');

    if (this.isProduction) {
      try {
        if (error) {
          captureException(error, { message, ...context });
        } else {
          // Create synthetic error for stack trace if no error provided
          captureException(new Error(message), context);
        }
      } catch {
        // Sentry might not be initialized yet - fail silently
      }
    }
  }

  /**
   * Performance logging - measure operation duration
   * Use for: Identifying slow operations
   *
   * SECURITY: Slow operations (>2s) are reported to Sentry in production
   */
  performance(label: string, startTime: number): void {
    const duration = performance.now() - startTime;

    if (this.isDevelopment) {
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    }

    // Track very slow operations in production (>2 seconds)
    if (this.isProduction && duration > 2000) {
      try {
        captureMessage(`[PERF] Slow operation: ${label} took ${duration.toFixed(0)}ms`, 'warning');
      } catch {
        // Sentry might not be initialized yet - fail silently
      }
    }
  }
}

// Export singleton instance
export const logger = new LoggerService();

// Usage examples:
// logger.debug('User clicked button', { userId: '123' });
// logger.info('Character created successfully', { characterName: 'John' });
// logger.warn('API rate limit approaching', { remaining: 5 });
// logger.error('Failed to save character', error, { characterId: '123' });
