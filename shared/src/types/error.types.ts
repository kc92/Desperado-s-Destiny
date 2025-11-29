/**
 * Error Types - Application Error Codes and Handling
 *
 * Standard error codes and types for Desperados Destiny
 */

/**
 * Application error codes
 */
export enum ErrorCode {
  /** Validation error (400) */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Authentication error (401) */
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  /** Authorization error (403) */
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  /** Resource not found (404) */
  NOT_FOUND = 'NOT_FOUND',
  /** Duplicate resource (409) */
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  /** Internal server error (500) */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Rate limit exceeded (429) */
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  /** Bad request (400) */
  BAD_REQUEST = 'BAD_REQUEST',
  /** Service unavailable (503) */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

/**
 * Standard API error structure
 */
export interface ApiError {
  /** Error code */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Additional error details (optional) */
  details?: any;
  /** Field-specific validation errors (optional) */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
  /** Invalid value (optional) */
  value?: any;
}

/**
 * Maps error codes to HTTP status codes
 */
export const ErrorCodeToHttpStatus: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.AUTHENTICATION_ERROR]: 401,
  [ErrorCode.AUTHORIZATION_ERROR]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_ERROR]: 409,
  [ErrorCode.RATE_LIMIT_ERROR]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503
};
