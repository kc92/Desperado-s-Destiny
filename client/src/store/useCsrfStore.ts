/**
 * CSRF Token Store
 * Manages CSRF token state for secure form submissions
 */

import { create } from 'zustand';

interface CsrfStore {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

/**
 * Zustand store for CSRF token management
 * Token is fetched after login and included in all mutation requests
 */
export const useCsrfStore = create<CsrfStore>((set) => ({
  token: null,

  setToken: (token: string) => set({ token }),

  clearToken: () => set({ token: null }),
}));
