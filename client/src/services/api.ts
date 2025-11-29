/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError } from '@/types';
import { useErrorStore } from '@/store/useErrorStore';
import { useAuthStore } from '@/store/useAuthStore';

// In development, use proxy (relative URLs), in production use absolute URLs
const API_BASE_URL = import.meta.env.DEV
  ? '' // Use proxy in development
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session-based auth
});

/**
 * Request interceptor
 * Add auth token or other headers before request is sent
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add authorization token here if using JWT
    // const token = localStorage.getItem('authToken');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handle responses and errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      // Handle specific status codes
      switch (status) {
        case 401: {
          // Clear auth state - ProtectedRoute will handle redirect to login
          useAuthStore.getState().setUser(null);
          // Don't add 401 to error store since it's expected behavior
          break;
        }
        case 403:
        case 404:
        case 500:
          // Error is added to error store below
          break;
        default:
          // Error is added to error store below
      }

      // Add error to global store for display (except 401 which redirects)
      if (status !== 401) {
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
 */
export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient[method]<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  } catch (error) {
    throw error;
  }
}

// Named export for compatibility
export const api = apiClient;

export default apiClient;
