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

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
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
 */
function parseMongooseValidationError(err: Error): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if ('errors' in err && typeof err.errors === 'object' && err.errors !== null) {
    for (const [field, error] of Object.entries(err.errors)) {
      if (error && typeof error === 'object' && 'message' in error) {
        errors[field] = [String(error.message)];
      }
    }
  }

  return errors;
}

/**
 * Parses MongoDB duplicate key errors
 */
function parseDuplicateKeyError(err: Error & { keyValue?: Record<string, unknown> }): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  if (err.keyValue) {
    for (const field of Object.keys(err.keyValue)) {
      errors[field] = [`${field} already exists`];
    }
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
