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
    const newError: ApiError = {
      ...error,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    set((state) => ({
      errors: [...state.errors, newError].slice(-5), // Keep last 5 errors
    }));

    // Auto-remove after 8 seconds
    setTimeout(() => {
      set((state) => ({
        errors: state.errors.filter((e) => e.id !== newError.id),
      }));
    }, 8000);
  },

  removeError: (id) =>
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    })),

  clearErrors: () => set({ errors: [] }),
}));
