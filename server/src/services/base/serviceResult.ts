/**
 * Service Result Types
 * Standardized return types for service methods
 *
 * Phase 1 Foundation - Provides explicit success/failure without throwing exceptions
 *
 * Benefits:
 * - Services can return explicit success/failure
 * - Controllers can handle errors without try/catch
 * - Type-safe error handling
 * - Forces callers to handle both success and failure cases
 *
 * @example
 * // In service:
 * async function transferGold(from: string, to: string, amount: number): Promise<ServiceResult<TransferResult>> {
 *   const fromChar = await Character.findById(from);
 *   if (!fromChar) return fail(new NotFoundError('Source character'));
 *   if (fromChar.gold < amount) return fail(new AppError('Insufficient gold', 400));
 *   // ... perform transfer
 *   return ok({ from: fromChar.name, to: toChar.name, amount });
 * }
 *
 * // In controller:
 * const result = await GoldService.transferGold(fromId, toId, amount);
 * if (!result.success) {
 *   return res.status(result.error.statusCode).json({ error: result.error.message });
 * }
 * res.json({ success: true, data: result.data });
 */

import { AppError } from '../../utils/errors';

/**
 * Result type for service operations
 *
 * This discriminated union forces callers to check `success` before
 * accessing `data` or `error`, providing type-safe error handling.
 */
export type ServiceResult<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create successful result
 *
 * @param data - The successful result data
 * @returns ServiceResult with success=true
 */
export function ok<T>(data: T): ServiceResult<T, never> {
  return { success: true, data };
}

/**
 * Create failure result
 *
 * @param error - The error that caused failure
 * @returns ServiceResult with success=false
 */
export function fail<E = AppError>(error: E): ServiceResult<never, E> {
  return { success: false, error };
}

/**
 * Unwrap result, throwing on failure
 *
 * Use this when you want to convert a ServiceResult back to
 * exception-based flow (e.g., in middleware that catches errors).
 *
 * @param result - ServiceResult to unwrap
 * @returns The data if successful
 * @throws The error if failed
 */
export function unwrap<T>(result: ServiceResult<T>): T {
  if (result.success === false) {
    throw result.error;
  }
  return result.data;
}

/**
 * Unwrap result with default value on failure
 *
 * @param result - ServiceResult to unwrap
 * @param defaultValue - Value to return if failed
 * @returns The data if successful, default value otherwise
 */
export function unwrapOr<T>(result: ServiceResult<T>, defaultValue: T): T {
  if (!result.success) {
    return defaultValue;
  }
  return result.data;
}

/**
 * Map over successful result
 *
 * Transform the data in a successful result without affecting failures.
 *
 * @param result - ServiceResult to map
 * @param fn - Transform function
 * @returns New ServiceResult with transformed data
 */
export function mapResult<T, U, E = AppError>(
  result: ServiceResult<T, E>,
  fn: (data: T) => U
): ServiceResult<U, E> {
  if (result.success === false) {
    return { success: false, error: result.error };
  }
  return ok(fn(result.data));
}

/**
 * Map over error in failed result
 *
 * Transform the error in a failed result without affecting successes.
 *
 * @param result - ServiceResult to map
 * @param fn - Error transform function
 * @returns New ServiceResult with transformed error
 */
export function mapError<T, E1, E2>(
  result: ServiceResult<T, E1>,
  fn: (error: E1) => E2
): ServiceResult<T, E2> {
  if (result.success === true) {
    return { success: true, data: result.data };
  }
  return fail(fn(result.error));
}

/**
 * Chain service operations (flatMap)
 *
 * Execute another service operation only if the first succeeded.
 * The second operation receives the data from the first.
 *
 * @param result - First ServiceResult
 * @param fn - Function that returns another ServiceResult
 * @returns Combined ServiceResult
 */
export async function chain<T, U, E = AppError>(
  result: ServiceResult<T, E>,
  fn: (data: T) => Promise<ServiceResult<U, E>>
): Promise<ServiceResult<U, E>> {
  if (result.success === false) {
    return { success: false, error: result.error };
  }
  return fn(result.data);
}

/**
 * Combine multiple service results
 *
 * Returns success only if all results succeeded, with all data combined.
 * On any failure, returns the first error encountered.
 *
 * @param results - Array of ServiceResults to combine
 * @returns Combined ServiceResult with array of data
 */
export function combineResults<T, E = AppError>(
  results: ServiceResult<T, E>[]
): ServiceResult<T[], E> {
  const data: T[] = [];

  for (const result of results) {
    if (result.success === false) {
      return { success: false, error: result.error };
    }
    data.push(result.data);
  }

  return ok(data);
}

/**
 * Convert a promise that might throw to a ServiceResult
 *
 * Useful for wrapping external libraries or legacy code.
 *
 * @param promise - Promise to convert
 * @param errorMapper - Optional function to map errors to AppError
 * @returns ServiceResult from the promise
 */
export async function fromPromise<T>(
  promise: Promise<T>,
  errorMapper?: (error: unknown) => AppError
): Promise<ServiceResult<T>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error);
    }
    if (errorMapper) {
      return fail(errorMapper(error));
    }
    return fail(
      new AppError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      )
    );
  }
}

/**
 * Type guard to check if result is successful
 */
export function isOk<T, E>(result: ServiceResult<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if result is failed
 */
export function isFail<T, E>(result: ServiceResult<T, E>): result is { success: false; error: E } {
  return !result.success;
}

export default {
  ok,
  fail,
  unwrap,
  unwrapOr,
  mapResult,
  mapError,
  chain,
  combineResults,
  fromPromise,
  isOk,
  isFail
};
