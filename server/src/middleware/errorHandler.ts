import { Request, Response, NextFunction } from 'express';
import { AppError, HttpStatus, ApiResponse } from '../types';
import logger from '../utils/logger';
import { config } from '../config';

/**
 * Centralized error handling middleware
 * Catches all errors thrown in the application and returns a standardized error response
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 Internal Server Error
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let errors: Record<string, string[]> | undefined;
  let isOperational = false;

  // Check if it's our custom AppError (instanceof or duck typing)
  if (err instanceof AppError || ('statusCode' in err && 'isOperational' in err)) {
    statusCode = (err as any).statusCode || 500;
    message = err.message;
    errors = (err as any).errors || (err as any).fieldErrors;
    isOperational = (err as any).isOperational;
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation error';
    errors = parseMongooseValidationError(err);
  }
  // Handle Mongoose duplicate key errors
  else if (err.name === 'MongoServerError' && 'code' in err && err.code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    message = 'Duplicate field value entered';
    errors = parseDuplicateKeyError(err);
  }
  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  else if (err.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid data format';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error details
  if (!isOperational || statusCode >= 500) {
    logger.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Operational error:', {
      message: err.message,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Build error response
  const errorResponse: ApiResponse = {
    success: false,
    error: message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  // Include stack trace in development
  if (config.isDevelopment && errorResponse.meta) {
    errorResponse.meta = {
      timestamp: errorResponse.meta.timestamp,
      stack: err.stack,
      originalError: err.message,
    };
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Parses Mongoose validation errors into a structured format
 * SECURITY: Returns generic field identifiers to prevent information disclosure
 */
function parseMongooseValidationError(err: Error): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if ('errors' in err && typeof err.errors === 'object' && err.errors !== null) {
    const fieldErrors = Object.entries(err.errors);

    // Log actual field names server-side for debugging
    logger.debug('Validation error details:', {
      fields: fieldErrors.map(([field, error]) => ({
        field,
        message: error && typeof error === 'object' && 'message' in error ? error.message : 'unknown'
      }))
    });

    // Return sanitized errors to client (don't expose internal field names)
    fieldErrors.forEach(([, error], index) => {
      if (error && typeof error === 'object' && 'message' in error) {
        // Use generic field identifier instead of actual field name
        const sanitizedMessage = sanitizeValidationMessage(String(error.message));
        errors[`field_${index + 1}`] = [sanitizedMessage];
      }
    });
  }

  return errors;
}

/**
 * Sanitizes validation error messages to remove internal field names
 */
function sanitizeValidationMessage(message: string): string {
  // Remove common Mongoose patterns that leak field names
  // e.g., "Path `email` is required" -> "This field is required"
  // e.g., "Cast to ObjectId failed for value..." -> "Invalid value provided"

  if (message.includes('is required')) {
    return 'This field is required';
  }
  if (message.includes('Cast to')) {
    return 'Invalid value provided';
  }
  if (message.includes('is not a valid')) {
    return 'Invalid format';
  }
  if (message.includes('must be')) {
    return 'Value does not meet requirements';
  }
  if (message.includes('minimum') || message.includes('maximum')) {
    return 'Value is out of allowed range';
  }

  // For any other message, return a generic error
  return 'Validation failed for this field';
}

/**
 * Parses MongoDB duplicate key errors
 * SECURITY: Returns generic message to prevent information disclosure
 */
function parseDuplicateKeyError(err: Error & { keyValue?: Record<string, unknown> }): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (err.keyValue) {
    // Log actual field names server-side for debugging
    logger.debug('Duplicate key error details:', {
      fields: Object.keys(err.keyValue),
      values: Object.entries(err.keyValue).map(([k, v]) => ({
        field: k,
        // Truncate value to avoid logging sensitive data
        value: typeof v === 'string' ? `${v.substring(0, 10)}...` : '[non-string]'
      }))
    });

    // Return generic error to client (don't expose which field or value)
    errors['duplicate'] = ['A record with this value already exists'];
  }

  return errors;
}

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    HttpStatus.NOT_FOUND
  );
  next(error);
}

export default {
  errorHandler,
  notFoundHandler,
};
