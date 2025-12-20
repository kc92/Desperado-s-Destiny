/**
 * Application Error Classes
 *
 * Custom error types for Desperados Destiny backend
 */

import { ErrorCode } from '@desperados/shared';

/**
 * Error context for additional debugging information
 */
export interface ErrorContext {
  /** User ID involved in the error */
  userId?: string;
  /** Character ID involved in the error */
  characterId?: string;
  /** Resource ID (e.g., item, gang, listing) */
  resourceId?: string;
  /** Resource type */
  resourceType?: string;
  /** Service that threw the error */
  service?: string;
  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;
  public override readonly cause?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this);
  }

  /**
   * Create a new error with additional context
   */
  withContext(context: ErrorContext): AppError {
    return new AppError(
      this.message,
      this.statusCode,
      this.code,
      this.isOperational,
      { ...this.context, ...context }
    );
  }

  /**
   * Create a new error with a cause
   */
  withCause(cause: Error): AppError {
    const err = new AppError(
      this.message,
      this.statusCode,
      this.code,
      this.isOperational,
      this.context
    );
    (err as any).cause = cause;
    return err;
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      error: true,
      code: this.code,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && this.context
        ? { context: this.context }
        : {})
    };
  }

  // ============================================
  // STATIC FACTORY METHODS
  // ============================================

  /**
   * Resource not found error
   */
  static notFound(resource: string, id?: string): AppError {
    const message = id
      ? `${resource} not found: ${id}`
      : `${resource} not found`;
    return new AppError(message, 404, ErrorCode.NOT_FOUND, true, {
      resourceType: resource,
      resourceId: id
    });
  }

  /**
   * Unauthorized error (not logged in)
   */
  static unauthorized(reason?: string): AppError {
    return new AppError(
      reason || 'Authentication required',
      401,
      ErrorCode.AUTHENTICATION_ERROR
    );
  }

  /**
   * Forbidden error (logged in but not allowed)
   */
  static forbidden(reason?: string): AppError {
    return new AppError(
      reason || 'You do not have permission to perform this action',
      403,
      ErrorCode.AUTHORIZATION_ERROR
    );
  }

  /**
   * Ownership violation (IDOR protection)
   */
  static ownershipViolation(resource: string, context?: ErrorContext): AppError {
    return new AppError(
      `You do not own this ${resource}`,
      403,
      ErrorCode.OWNERSHIP_VIOLATION,
      true,
      context
    );
  }

  /**
   * Insufficient gold error
   */
  static insufficientGold(required: number, current: number): AppError {
    return new AppError(
      `Insufficient gold. Required: ${required}, Available: ${current}`,
      400,
      ErrorCode.INSUFFICIENT_GOLD,
      true,
      { required, current, deficit: required - current }
    );
  }

  /**
   * Insufficient energy error
   */
  static insufficientEnergy(required: number, current: number): AppError {
    return new AppError(
      `Insufficient energy. Required: ${required}, Available: ${current}`,
      400,
      ErrorCode.INSUFFICIENT_ENERGY,
      true,
      { required, current, deficit: required - current }
    );
  }

  /**
   * Cooldown active error
   */
  static cooldownActive(action: string, remainingMs: number): AppError {
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return new AppError(
      `${action} is on cooldown. Try again in ${remainingSeconds} seconds`,
      429,
      ErrorCode.COOLDOWN_ACTIVE,
      true,
      { action, remainingMs, remainingSeconds }
    );
  }

  /**
   * Level requirement not met
   */
  static levelRequired(required: number, current: number): AppError {
    return new AppError(
      `Level ${required} required. Your level: ${current}`,
      400,
      ErrorCode.LEVEL_REQUIREMENT,
      true,
      { required, current }
    );
  }

  /**
   * Invalid state for action
   */
  static invalidState(message: string, context?: ErrorContext): AppError {
    return new AppError(message, 400, ErrorCode.INVALID_STATE, true, context);
  }

  /**
   * Race condition detected
   */
  static raceCondition(resource: string): AppError {
    return new AppError(
      `Race condition detected for ${resource}. Please try again.`,
      409,
      ErrorCode.RACE_CONDITION,
      true,
      { resourceType: resource }
    );
  }

  /**
   * Lock acquisition failed
   */
  static lockFailed(resource: string): AppError {
    return new AppError(
      `Could not acquire lock for ${resource}. Please try again.`,
      503,
      ErrorCode.LOCK_FAILED,
      true,
      { resourceType: resource }
    );
  }

  /**
   * Validation error
   */
  static validation(message: string, fieldErrors?: Record<string, string[]>): AppError {
    const err = new AppError(message, 400, ErrorCode.VALIDATION_ERROR, true, { fieldErrors });
    return err;
  }

  /**
   * Duplicate resource error
   */
  static duplicate(resource: string, field?: string): AppError {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    return new AppError(message, 409, ErrorCode.DUPLICATE_ERROR, true, {
      resourceType: resource,
      field
    });
  }

  /**
   * Internal server error
   */
  static internal(message?: string): AppError {
    return new AppError(
      message || 'An unexpected error occurred',
      500,
      ErrorCode.INTERNAL_ERROR,
      false
    );
  }

  /**
   * Service unavailable error
   */
  static serviceUnavailable(service?: string): AppError {
    return new AppError(
      service
        ? `${service} is temporarily unavailable`
        : 'Service temporarily unavailable',
      503,
      ErrorCode.SERVICE_UNAVAILABLE,
      true,
      { service }
    );
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, ErrorCode.AUTHENTICATION_ERROR);
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, ErrorCode.AUTHORIZATION_ERROR);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }
}

/**
 * Duplicate error (409)
 */
export class DuplicateError extends AppError {
  constructor(resource: string = 'Resource', field?: string) {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    super(message, 409, ErrorCode.DUPLICATE_ERROR);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, ErrorCode.RATE_LIMIT_ERROR);
  }
}

/**
 * Insufficient Energy Error (400)
 *
 * Thrown when a character attempts an action without sufficient energy
 */
export class InsufficientEnergyError extends AppError {
  public readonly current: number;
  public readonly required: number;
  public readonly deficit: number;
  public readonly timeUntilAvailable: string;
  public readonly isPremium: boolean;

  constructor(
    current: number,
    required: number,
    deficit: number,
    timeUntilAvailable: string,
    isPremium: boolean = false
  ) {
    const premiumMessage = isPremium
      ? ''
      : ' Wait for energy to regenerate or upgrade to Premium for 250 max energy and faster regeneration.';

    const message = `Insufficient energy. You need ${required} energy but only have ${current}. Wait ${timeUntilAvailable} for energy to regenerate.${premiumMessage}`;

    super(message, 400, ErrorCode.BAD_REQUEST);

    this.current = current;
    this.required = required;
    this.deficit = deficit;
    this.timeUntilAvailable = timeUntilAvailable;
    this.isPremium = isPremium;
  }

  /**
   * Convert to JSON response format
   */
  override toJSON() {
    return {
      error: 'Insufficient energy',
      code: this.code,
      message: this.message,
      current: this.current,
      required: this.required,
      deficit: this.deficit,
      timeUntilAvailable: this.timeUntilAvailable,
      isPremium: this.isPremium,
    };
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, ErrorCode.SERVICE_UNAVAILABLE);
  }
}

/**
 * Sanitize error messages for client responses
 *
 * In production, internal error details are hidden.
 * AppError messages are always shown (they're designed for users).
 * In development, all error messages are shown for debugging.
 *
 * @param error - The error to sanitize
 * @returns A safe error message for the client
 */
export const sanitizeErrorMessage = (error: unknown): string => {
  // AppError messages are designed for users - always show them
  if (error instanceof AppError) {
    return error.message;
  }

  // In development, show the full error message for debugging
  if (process.env['NODE_ENV'] === 'development') {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // In production, hide internal error details
  return 'An unexpected error occurred';
};
