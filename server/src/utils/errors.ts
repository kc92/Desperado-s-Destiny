/**
 * Application Error Classes
 *
 * Custom error types for Desperados Destiny backend
 */

import { ErrorCode } from '@desperados/shared';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
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
  toJSON() {
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
