/**
 * ServiceResult Type
 * Standardized return type for service layer operations
 *
 * PURPOSE: Unifies error handling across all services to provide consistent
 * API responses and eliminate the mix of throws/returns patterns.
 *
 * MIGRATION: Services should gradually adopt this pattern:
 * - business.service.ts: Already uses similar pattern (keep)
 * - gang.service.ts: Convert throws to results
 * - energy.service.ts: Standardize error format
 * - combat.service.ts: Convert throws to results
 */

/**
 * Standard error codes for common failure scenarios
 */
export enum ServiceErrorCode {
  // Generic errors
  UNKNOWN = 'UNKNOWN',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Resource errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_ENERGY = 'INSUFFICIENT_ENERGY',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',

  // State errors
  INVALID_STATE = 'INVALID_STATE',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  EXPIRED = 'EXPIRED',
  LOCKED = 'LOCKED',

  // Concurrency errors
  CONFLICT = 'CONFLICT',
  RACE_CONDITION = 'RACE_CONDITION',

  // External errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Structured error information
 */
export interface ServiceError {
  /** Machine-readable error code */
  code: ServiceErrorCode | string;
  /** Human-readable error message */
  message: string;
  /** Additional context for debugging (not exposed to client in production) */
  details?: Record<string, unknown>;
}

/**
 * Generic service result type
 * @template T - The type of data returned on success
 */
export interface ServiceResult<T = void> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The result data (only present on success) */
  data?: T;
  /** Error information (only present on failure) */
  error?: ServiceError;
}

/**
 * Create a successful result
 * @param data - The result data
 * @returns A successful ServiceResult
 *
 * @example
 * return success({ character, leveledUp: true });
 */
export function success<T>(data?: T): ServiceResult<T> {
  return { success: true, data };
}

/**
 * Create a failure result
 * @param code - The error code
 * @param message - Human-readable error message
 * @param details - Additional context (optional)
 * @returns A failed ServiceResult
 *
 * @example
 * return failure(ServiceErrorCode.INSUFFICIENT_FUNDS, 'Not enough dollars', { required: 100, current: 50 });
 */
export function failure(
  code: ServiceErrorCode | string,
  message: string,
  details?: Record<string, unknown>
): ServiceResult<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}

/**
 * Create a not found failure
 * @param resource - The resource type that wasn't found
 * @param identifier - The identifier used to search (optional)
 * @returns A failed ServiceResult with NOT_FOUND code
 *
 * @example
 * return notFound('Character', characterId);
 */
export function notFound(
  resource: string,
  identifier?: string | number
): ServiceResult<never> {
  const message = identifier
    ? `${resource} not found: ${identifier}`
    : `${resource} not found`;
  return failure(ServiceErrorCode.NOT_FOUND, message, { resource, identifier });
}

/**
 * Create a validation failure
 * @param message - Description of the validation error
 * @param fields - Map of field names to their specific errors
 * @returns A failed ServiceResult with VALIDATION_FAILED code
 *
 * @example
 * return validationError('Invalid input', { name: 'Name is required', amount: 'Must be positive' });
 */
export function validationError(
  message: string,
  fields?: Record<string, string>
): ServiceResult<never> {
  return failure(ServiceErrorCode.VALIDATION_FAILED, message, { fields });
}

/**
 * Create an insufficient funds failure
 * @param required - The amount required
 * @param current - The current balance
 * @param currency - The currency type (default: 'dollars')
 * @returns A failed ServiceResult with INSUFFICIENT_FUNDS code
 *
 * @example
 * return insufficientFunds(100, 50);
 */
export function insufficientFunds(
  required: number,
  current: number,
  currency: string = 'dollars'
): ServiceResult<never> {
  return failure(
    ServiceErrorCode.INSUFFICIENT_FUNDS,
    `Insufficient ${currency}: need ${required}, have ${current}`,
    { required, current, currency }
  );
}

/**
 * Create an insufficient energy failure
 * @param required - The energy cost
 * @param current - The current energy
 * @returns A failed ServiceResult with INSUFFICIENT_ENERGY code
 *
 * @example
 * return insufficientEnergy(10, 5);
 */
export function insufficientEnergy(
  required: number,
  current: number
): ServiceResult<never> {
  return failure(
    ServiceErrorCode.INSUFFICIENT_ENERGY,
    `Insufficient energy: need ${required}, have ${current}`,
    { required, current }
  );
}

/**
 * Wrap an async operation with standardized error handling
 * Converts thrown errors into ServiceResult failures
 *
 * @param operation - The async operation to wrap
 * @param errorCode - The error code to use on failure (default: UNKNOWN)
 * @returns The operation result wrapped in a ServiceResult
 *
 * @example
 * return wrapAsync(async () => {
 *   const result = await someOperation();
 *   return result;
 * });
 */
export async function wrapAsync<T>(
  operation: () => Promise<T>,
  errorCode: ServiceErrorCode = ServiceErrorCode.UNKNOWN
): Promise<ServiceResult<T>> {
  try {
    const data = await operation();
    return success(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return failure(errorCode, message, { originalError: String(err) });
  }
}

/**
 * Type guard to check if a result is successful
 * Narrows the type to include data
 *
 * @example
 * const result = await someService.doThing();
 * if (isSuccess(result)) {
 *   console.log(result.data); // TypeScript knows data exists
 * }
 */
export function isSuccess<T>(result: ServiceResult<T>): result is ServiceResult<T> & { data: T } {
  return result.success && result.data !== undefined;
}

/**
 * Type guard to check if a result is a failure
 * Narrows the type to include error
 *
 * @example
 * const result = await someService.doThing();
 * if (isFailure(result)) {
 *   console.log(result.error.message); // TypeScript knows error exists
 * }
 */
export function isFailure<T>(result: ServiceResult<T>): result is ServiceResult<T> & { error: ServiceError } {
  return !result.success && result.error !== undefined;
}

export default {
  success,
  failure,
  notFound,
  validationError,
  insufficientFunds,
  insufficientEnergy,
  wrapAsync,
  isSuccess,
  isFailure,
  ServiceErrorCode,
};
