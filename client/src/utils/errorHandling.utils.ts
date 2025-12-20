/**
 * Error Handling Utilities
 * Centralized error handling with user notifications
 */

import { logger } from '@/services/logger.service';
import { useToastStore } from '@/store/useToastStore';

export interface ErrorHandlingOptions {
  /** Custom error title for toast */
  title?: string;

  /** Custom error message for toast */
  message?: string;

  /** Whether to show toast notification (default: true) */
  showToast?: boolean;

  /** Whether to log error (default: true) */
  logError?: boolean;

  /** Additional context for logging */
  context?: Record<string, any>;

  /** Toast duration in milliseconds (default: 5000) */
  duration?: number;

  /** Whether to throw error after handling (default: false) */
  rethrow?: boolean;
}

/**
 * Centralized error handling utility
 * Handles logging, user notifications, and error tracking
 */
export class ErrorHandlingService {
  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(
    error: any,
    operation: string,
    options: ErrorHandlingOptions = {}
  ): void {
    const {
      title = 'Operation Failed',
      message,
      showToast = true,
      logError = true,
      context = {},
      duration = 5000,
      rethrow = false
    } = options;

    // Extract error message from various formats
    const errorMessage = this.extractErrorMessage(error);
    const userMessage = message || errorMessage || 'An unexpected error occurred. Please try again.';

    // Log error
    if (logError) {
      logger.error(`${operation} failed`, error, {
        operation,
        statusCode: error?.response?.status,
        ...context
      });
    }

    // Show toast notification
    if (showToast) {
      useToastStore.getState().addToast({
        type: 'error',
        title,
        message: userMessage,
        duration
      });
    }

    // Rethrow if requested
    if (rethrow) {
      throw error;
    }
  }

  /**
   * Handle form validation errors
   */
  static handleValidationError(
    fieldErrors: Record<string, string[]>,
    options: ErrorHandlingOptions = {}
  ): void {
    const {
      title = 'Validation Error',
      showToast = true,
      duration = 5000
    } = options;

    // Get first error message
    const firstField = Object.keys(fieldErrors)[0];
    const firstError = fieldErrors[firstField]?.[0];
    const message = firstError || 'Please check your input and try again.';

    if (showToast) {
      useToastStore.getState().addToast({
        type: 'error',
        title,
        message,
        duration
      });
    }

    logger.warn('Form validation failed', { fieldErrors });
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(
    error: any,
    options: ErrorHandlingOptions = {}
  ): void {
    const {
      title = 'Connection Error',
      message = 'Unable to connect to server. Please check your internet connection.',
      showToast = true,
      duration = 5000
    } = options;

    if (showToast) {
      useToastStore.getState().addToast({
        type: 'error',
        title,
        message,
        duration
      });
    }

    logger.error('Network error occurred', error);
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(
    error: any,
    options: ErrorHandlingOptions = {}
  ): void {
    const {
      title = 'Authentication Error',
      message = 'Your session has expired. Please log in again.',
      showToast = true,
      duration = 5000
    } = options;

    if (showToast) {
      useToastStore.getState().addToast({
        type: 'error',
        title,
        message,
        duration
      });
    }

    logger.warn('Authentication error', { error });

    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }

  /**
   * Handle permission errors
   */
  static handlePermissionError(
    resource: string,
    options: ErrorHandlingOptions = {}
  ): void {
    const {
      title = 'Permission Denied',
      message = `You don't have permission to access ${resource}.`,
      showToast = true,
      duration = 5000
    } = options;

    if (showToast) {
      useToastStore.getState().addToast({
        type: 'error',
        title,
        message,
        duration
      });
    }

    logger.warn('Permission denied', { resource });
  }

  /**
   * Extract user-friendly error message from various error formats
   */
  private static extractErrorMessage(error: any): string {
    // Axios error response
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    // Axios error response (alternative format)
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }

    // Standard Error object
    if (error?.message) {
      return error.message;
    }

    // String error
    if (typeof error === 'string') {
      return error;
    }

    return '';
  }

  /**
   * Wrap async operation with error handling
   */
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: ErrorHandlingOptions = {}
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handleApiError(error, operationName, options);
      return null;
    }
  }
}

// Convenience exports
export const handleApiError = ErrorHandlingService.handleApiError.bind(ErrorHandlingService);
export const handleValidationError = ErrorHandlingService.handleValidationError.bind(ErrorHandlingService);
export const handleNetworkError = ErrorHandlingService.handleNetworkError.bind(ErrorHandlingService);
export const handleAuthError = ErrorHandlingService.handleAuthError.bind(ErrorHandlingService);
export const handlePermissionError = ErrorHandlingService.handlePermissionError.bind(ErrorHandlingService);
export const wrapAsync = ErrorHandlingService.wrapAsync.bind(ErrorHandlingService);

/**
 * Usage Examples:
 *
 * // API Error:
 * try {
 *   await api.post('/character', data);
 * } catch (error) {
 *   handleApiError(error, 'Create character', {
 *     title: 'Character Creation Failed',
 *     context: { characterName: data.name }
 *   });
 * }
 *
 * // Validation Error:
 * if (!isValid) {
 *   handleValidationError({
 *     username: ['Username must be at least 3 characters'],
 *     email: ['Invalid email format']
 *   });
 * }
 *
 * // Network Error:
 * if (!navigator.onLine) {
 *   handleNetworkError(null);
 * }
 *
 * // Wrap async operation:
 * const character = await wrapAsync(
 *   () => characterService.getCharacter(id),
 *   'Fetch character',
 *   { title: 'Could not load character' }
 * );
 */
