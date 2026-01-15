/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 *
 * PRODUCTION FIX: Added automatic token refresh on 401 errors
 * - When access token expires, refresh token is used to get new access token
 * - Original request is retried after successful refresh
 * - User is only logged out if refresh also fails
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types';
import { useErrorStore } from '@/store/useErrorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCsrfStore } from '@/store/useCsrfStore';
import { logger } from '@/services/logger.service';

// Token refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

// SECURITY FIX: Limit subscriber queue to prevent memory exhaustion
const MAX_REFRESH_SUBSCRIBERS = 50;

// SECURITY FIX: Timeout for token refresh (10 seconds)
const REFRESH_TIMEOUT_MS = 10000;

/**
 * Subscribe to token refresh completion
 * SECURITY FIX: Limits queue size to prevent memory exhaustion
 */
function subscribeToRefresh(callback: (success: boolean) => void): void {
  if (refreshSubscribers.length >= MAX_REFRESH_SUBSCRIBERS) {
    logger.warn('[API] Too many pending refresh subscribers, rejecting request');
    callback(false);
    return;
  }
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers of refresh result
 */
function notifyRefreshSubscribers(success: boolean): void {
  refreshSubscribers.forEach(callback => callback(success));
  refreshSubscribers = [];
}

// PRODUCTION FIX: Validate API URL configuration
const API_BASE_URL = (() => {
  if (import.meta.env.DEV) {
    return ''; // Use proxy in development
  }

  // Production: require explicit config
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    // Log error to console (Sentry won't be initialized yet at module load time)
    console.error(
      '[API] CRITICAL: VITE_API_URL is not set in production build! ' +
      'API calls will fail. Set VITE_API_URL in your .env.production file.'
    );
    // Fall back to same-origin (relative URLs) as last resort
    return '';
  }

  return apiUrl;
})();

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${API_BASE_URL}/api`,
  timeout: 30000, // Increased from 15s to 30s for operations involving external services (email)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session-based auth
});

/**
 * Request interceptor
 * Add CSRF token to mutation requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token to mutation requests (POST, PUT, PATCH, DELETE)
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method || '')) {
      const csrfToken = useCsrfStore.getState().token;
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error('[API Request Error]', error as Error, { context: 'apiClient.request.interceptor' });
    return Promise.reject(error);
  }
);

/**
 * Extended config interface with custom options
 */
export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  suppressErrorToast?: boolean;
}

/**
 * Response interceptor
 * Handle responses and errors globally
 *
 * PRODUCTION FIX: 401 errors now trigger token refresh before logout
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Update CSRF token if returned in response header (token rotation)
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken) {
      useCsrfStore.getState().setToken(newCsrfToken);
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      // PRODUCTION FIX: Check both 'message' and 'error' fields for error message
      // Some controllers return 'error' field, others return 'message' field
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; suppressErrorToast?: boolean };

      // Handle specific status codes
      switch (status) {
        case 401: {
          // Skip refresh for auth endpoints (login, register, refresh itself)
          const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                                 originalRequest?.url?.includes('/auth/register') ||
                                 originalRequest?.url?.includes('/auth/refresh') ||
                                 originalRequest?.url?.includes('/auth/logout');

          // Don't retry if already retried or is an auth endpoint
          if (originalRequest?._retry || isAuthEndpoint) {
            // Clear auth state - ProtectedRoute will handle redirect to login
            useAuthStore.getState().setUser(null);
            useCsrfStore.getState().clearToken();
            break;
          }

          // Mark request as retried to prevent infinite loops
          originalRequest._retry = true;

          // If already refreshing, wait for the refresh to complete
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              subscribeToRefresh((success) => {
                if (success) {
                  // Retry the original request
                  resolve(apiClient(originalRequest));
                } else {
                  reject(error);
                }
              });
            });
          }

          // Start refreshing
          isRefreshing = true;

          try {
            // SECURITY FIX: Attempt to refresh the token with timeout
            // This prevents indefinite hangs if the refresh endpoint doesn't respond
            const refreshPromise = apiClient.post('/auth/refresh');
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Token refresh timeout')), REFRESH_TIMEOUT_MS)
            );
            await Promise.race([refreshPromise, timeoutPromise]);

            // Refresh succeeded
            logger.info('[API] Token refreshed successfully, retrying request');

            // CRITICAL FIX: Notify subscribers BEFORE setting isRefreshing = false
            // This prevents new requests from starting a second refresh before
            // waiting subscribers are notified and can retry with the new token
            notifyRefreshSubscribers(true);

            // Now safe to allow new refresh attempts
            isRefreshing = false;

            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            logger.warn('[API] Token refresh failed, logging out user');

            // CRITICAL FIX: Same ordering - notify before clearing flag
            notifyRefreshSubscribers(false);
            isRefreshing = false;

            useAuthStore.getState().setUser(null);
            useCsrfStore.getState().clearToken();

            return Promise.reject({
              message: 'Session expired. Please log in again.',
              status: 401,
              code: 'SESSION_EXPIRED',
            } as ApiError);
          }
        }
        case 403: {
          // Check if it's a CSRF error - attempt token refresh and retry
          const errorCode = error.response.data?.code;
          if (errorCode === 'CSRF_INVALID' || errorCode === 'CSRF_MISSING') {
            const csrfRequest = error.config as InternalAxiosRequestConfig & { _csrfRetry?: boolean };

            // Only retry once to prevent infinite loops
            if (!csrfRequest?._csrfRetry) {
              csrfRequest._csrfRetry = true;

              // Clear stale token
              useCsrfStore.getState().clearToken();

              // Fetch fresh CSRF token by making a GET request to an authenticated endpoint
              try {
                logger.debug('[API] CSRF token invalid, fetching fresh token...');
                await apiClient.get('/auth/me');

                // Retry the original request with the new CSRF token
                logger.info('[API] CSRF token refreshed, retrying request');
                return apiClient(csrfRequest);
              } catch (csrfError) {
                logger.error('[API] Failed to refresh CSRF token', csrfError as Error);
                // Fall through to error handling
              }
            }
          }
          // Error is added to error store below
          break;
        }
        case 404:
        case 500:
          // Error is added to error store below
          break;
        default:
          // Error is added to error store below
      }

      // Add error to global store for display (except 401 which redirects)
      // PRODUCTION FIX: Allow suppressing error toast for expected errors (e.g., 2FA status check)
      if (status !== 401 && !originalRequest?.suppressErrorToast) {
        useErrorStore.getState().addError({
          message,
          status,
          url: error.config?.url,
        });
      }

      return Promise.reject({
        message,
        status,
        code: error.code,
      } as ApiError);
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error - please check your connection',
        status: 0,
        code: error.code,
      } as ApiError);
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message,
        status: 0,
        code: error.code,
      } as ApiError);
    }
  }
);

/**
 * Helper function to handle API calls
 * @param method - HTTP method
 * @param url - API endpoint
 * @param data - Request body (for POST/PUT/PATCH) or config (for GET/DELETE)
 * @param config - Extended axios config with custom options (e.g., suppressErrorToast)
 */
export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: ExtendedAxiosRequestConfig
): Promise<T> {
  try {
    let response;
    // GET and DELETE don't have request body - config goes in second param
    if (method === 'get' || method === 'delete') {
      // For GET/DELETE: merge data (if any query params) into config
      const mergedConfig = { ...config, ...(data && typeof data === 'object' ? { params: data } : {}) };
      response = await apiClient[method]<ApiResponse<T>>(url, mergedConfig);
    } else {
      // For POST/PUT/PATCH: data is body, config is third param
      response = await apiClient[method]<ApiResponse<T>>(url, data, config);
    }
    return response.data.data as T;
  } catch (error) {
    throw error;
  }
}

// Named export for compatibility
export const api = apiClient;

export default apiClient;
