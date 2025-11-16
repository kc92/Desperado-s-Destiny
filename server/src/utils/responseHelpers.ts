import { Response } from 'express';
import { ApiResponse, PaginatedResponse, HttpStatus } from '../types';

/**
 * Helper functions for sending standardized API responses
 */

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HttpStatus.OK
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message?: string
): Response {
  return sendSuccess(res, data, message || 'Resource created successfully', HttpStatus.CREATED);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = HttpStatus.BAD_REQUEST,
  errors?: Record<string, string[]>
): Response {
  const response: ApiResponse = {
    success: false,
    error,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return res.status(HttpStatus.OK).json(response);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(HttpStatus.NO_CONTENT).send();
}

export default {
  sendSuccess,
  sendCreated,
  sendError,
  sendPaginated,
  sendNoContent,
};
