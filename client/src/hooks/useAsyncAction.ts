/**
 * useAsyncAction Hook
 * Standardized hook for handling async operations with loading, error, and success states
 *
 * Phase 1: UI Polish - Foundation & Design System
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error, data, reset } = useAsyncAction(
 *   async (id: string) => await api.deleteItem(id),
 *   {
 *     onSuccess: (data) => toast.success('Item deleted'),
 *     onError: (error) => toast.error(error.message),
 *   }
 * );
 *
 * // Usage
 * <Button onClick={() => execute('123')} isLoading={isLoading}>
 *   Delete
 * </Button>
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/services/logger.service';

// =============================================================================
// TYPES
// =============================================================================

export type AsyncActionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseAsyncActionOptions<TData, TError = Error> {
  /** Callback fired on successful execution */
  onSuccess?: (data: TData) => void;
  /** Callback fired on error */
  onError?: (error: TError) => void;
  /** Callback fired when execution completes (success or error) */
  onSettled?: (data: TData | undefined, error: TError | undefined) => void;
  /** Reset to idle after success (in ms). 0 = no reset */
  resetOnSuccessDelay?: number;
  /** Reset to idle after error (in ms). 0 = no reset */
  resetOnErrorDelay?: number;
  /** Whether to throw errors or swallow them */
  throwOnError?: boolean;
  /** Custom error transformer */
  transformError?: (error: unknown) => TError;
  /** Log errors to logger service */
  logErrors?: boolean;
  /** Context for error logging */
  errorContext?: string;
}

export interface UseAsyncActionReturn<TData, TArgs extends unknown[], TError = Error> {
  /** Execute the async action */
  execute: (...args: TArgs) => Promise<TData | undefined>;
  /** Current status of the action */
  status: AsyncActionStatus;
  /** Whether action is currently loading */
  isLoading: boolean;
  /** Whether action completed successfully */
  isSuccess: boolean;
  /** Whether action resulted in error */
  isError: boolean;
  /** Whether action is idle (not started or reset) */
  isIdle: boolean;
  /** The error if action failed */
  error: TError | null;
  /** The data if action succeeded */
  data: TData | null;
  /** Reset to initial idle state */
  reset: () => void;
}

// =============================================================================
// DEFAULT ERROR TRANSFORMER
// =============================================================================

const defaultTransformError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  return new Error('An unexpected error occurred');
};

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Hook for handling async operations with standardized state management
 *
 * @param asyncFn - The async function to execute
 * @param options - Configuration options
 * @returns Object containing execute function and state
 */
export function useAsyncAction<TData, TArgs extends unknown[] = [], TError = Error>(
  asyncFn: (...args: TArgs) => Promise<TData>,
  options: UseAsyncActionOptions<TData, TError> = {}
): UseAsyncActionReturn<TData, TArgs, TError> {
  const {
    onSuccess,
    onError,
    onSettled,
    resetOnSuccessDelay = 0,
    resetOnErrorDelay = 0,
    throwOnError = false,
    transformError = defaultTransformError as (error: unknown) => TError,
    logErrors = true,
    errorContext = 'AsyncAction',
  } = options;

  const [status, setStatus] = useState<AsyncActionStatus>('idle');
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<TError | null>(null);

  // Track component mount state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setStatus('idle');
      setData(null);
      setError(null);
    }
  }, []);

  /**
   * Schedule reset after delay
   */
  const scheduleReset = useCallback((delay: number) => {
    if (delay > 0) {
      resetTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          reset();
        }
      }, delay);
    }
  }, [reset]);

  /**
   * Execute the async action
   */
  const execute = useCallback(
    async (...args: TArgs): Promise<TData | undefined> => {
      // Clear any pending reset
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }

      // Set loading state
      if (isMountedRef.current) {
        setStatus('loading');
        setError(null);
      }

      try {
        const result = await asyncFn(...args);

        if (isMountedRef.current) {
          setStatus('success');
          setData(result);
          onSuccess?.(result);
          onSettled?.(result, undefined);
          scheduleReset(resetOnSuccessDelay);
        }

        return result;
      } catch (err) {
        const transformedError = transformError(err);

        if (logErrors) {
          logger.error(
            `${errorContext}: Action failed`,
            err instanceof Error ? err : new Error(String(err)),
            { context: errorContext }
          );
        }

        if (isMountedRef.current) {
          setStatus('error');
          setError(transformedError);
          onError?.(transformedError);
          onSettled?.(undefined, transformedError);
          scheduleReset(resetOnErrorDelay);
        }

        if (throwOnError) {
          throw transformedError;
        }

        return undefined;
      }
    },
    [
      asyncFn,
      onSuccess,
      onError,
      onSettled,
      resetOnSuccessDelay,
      resetOnErrorDelay,
      throwOnError,
      transformError,
      logErrors,
      errorContext,
      scheduleReset,
    ]
  );

  return {
    execute,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
    error,
    data,
    reset,
  };
}

// =============================================================================
// CONVENIENCE WRAPPER FOR MUTATIONS
// =============================================================================

/**
 * Convenience wrapper for mutation-style async actions
 * Automatically resets after success
 */
export function useAsyncMutation<TData, TArgs extends unknown[] = [], TError = Error>(
  mutationFn: (...args: TArgs) => Promise<TData>,
  options: UseAsyncActionOptions<TData, TError> = {}
): UseAsyncActionReturn<TData, TArgs, TError> {
  return useAsyncAction(mutationFn, {
    resetOnSuccessDelay: 3000, // Auto-reset after 3 seconds by default
    ...options,
  });
}

export default useAsyncAction;
