/**
 * Error Store
 * Global state management for API and application errors
 */

import { create } from 'zustand';

export interface ApiError {
  id: string;
  message: string;
  status: number;
  timestamp: number;
  url?: string;
}

interface ErrorState {
  errors: ApiError[];
  addError: (error: Omit<ApiError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],

  addError: (error) => {
    // Deduplication: Check if same error already exists within last 2 seconds
    const isDuplicate = (existingErrors: ApiError[]) => {
      const now = Date.now();
      return existingErrors.some(
        (e) =>
          e.message === error.message &&
          e.status === error.status &&
          now - e.timestamp < 2000 // Within 2 seconds
      );
    };

    set((state) => {
      // Skip if duplicate error already exists
      if (isDuplicate(state.errors)) {
        return state;
      }

      const newError: ApiError = {
        ...error,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Auto-remove after 8 seconds
      setTimeout(() => {
        set((currentState) => ({
          errors: currentState.errors.filter((e) => e.id !== newError.id),
        }));
      }, 8000);

      return {
        errors: [...state.errors, newError].slice(-5), // Keep last 5 errors
      };
    });
  },

  removeError: (id) =>
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    })),

  clearErrors: () => set({ errors: [] }),
}));
