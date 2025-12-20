/**
 * API Types - HTTP Request and Response Types
 *
 * Standard API response formats for Desperados Destiny
 */

/**
 * Standard API response wrapper
 * @template T The type of data being returned
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** The response data (only present on success) */
  data?: T;
  /** Error message (only present on failure) */
  error?: string;
  /** Optional message (can be present on success or failure) */
  message?: string;
  /** Optional metadata (timestamps, request IDs, etc.) */
  meta?: {
    timestamp?: string;
    requestId?: string;
  };
}

/**
 * Paginated response for list endpoints
 * @template T The type of items in the list
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard success response helper
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Standard error response helper
 */
export function createErrorResponse(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    ...(message && { message })
  };
}
