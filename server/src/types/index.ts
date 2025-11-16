import { Request, Response } from 'express';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP status codes enum
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Request with user authentication data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * Async request handler type
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response
) => Promise<void | Response>;

/**
 * Environment types
 */
export type NodeEnvironment = 'development' | 'production' | 'test';

/**
 * Log levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

/**
 * Database connection states
 */
export enum DatabaseConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTING = 'disconnecting',
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
    redis: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
  };
  version: string;
  environment: NodeEnvironment;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Service result wrapper for error handling
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

export default {
  AppError,
  HttpStatus,
  DatabaseConnectionState,
};
