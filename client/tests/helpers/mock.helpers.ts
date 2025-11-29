/**
 * Mock Test Helpers
 *
 * Helper functions for creating mock data and API responses
 */

import { vi } from 'vitest';
import {
  mockUser,
  mockCharacter,
  mockCard,
  ApiResponse,
  createSuccessResponse,
  createErrorResponse
} from '@desperados/shared';

/**
 * Creates a mock API success response
 */
export function mockApiSuccess<T>(data: T, message?: string): ApiResponse<T> {
  return createSuccessResponse(data, message);
}

/**
 * Creates a mock API error response
 */
export function mockApiError(error: string, message?: string): ApiResponse {
  return createErrorResponse(error, message);
}

/**
 * Creates a mock fetch response
 */
export function mockFetchResponse<T>(data: T, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    statusText: 'OK',
  } as Response;
}

/**
 * Mocks the global fetch function
 */
export function mockFetch<T>(data: T, status: number = 200) {
  return vi.fn(() => Promise.resolve(mockFetchResponse(data, status)));
}

/**
 * Creates a mock axios response
 */
export function mockAxiosResponse<T>(data: T, status: number = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

/**
 * Mocks localStorage
 */
export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  };
}

/**
 * Mocks sessionStorage
 */
export const mockSessionStorage = mockLocalStorage;

/**
 * Waits for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Waits for the next tick
 */
export function waitForNextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Creates a mock timer
 */
export function useFakeTimers() {
  vi.useFakeTimers();
  return {
    advance: (ms: number) => vi.advanceTimersByTime(ms),
    runAll: () => vi.runAllTimers(),
    restore: () => vi.useRealTimers(),
  };
}

// Re-export commonly used mocks from shared package
export { mockUser, mockCharacter, mockCard };
