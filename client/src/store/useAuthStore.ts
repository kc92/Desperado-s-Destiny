/**
 * Authentication Store
 * Manages user authentication state using Zustand
 */

import { create } from 'zustand';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';
import authService from '@/services/auth.service';
import { socketService } from '@/services/socket.service';

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Zustand store for authentication
 * Note: No localStorage persistence - auth state is validated via cookie on page load
 */
export const useAuthStore = create<AuthStore>()((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: true, // Always true since we're not using persistence

  /**
   * Login user with credentials
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.login(credentials);

      // Initialize socket connection
      socketService.connect();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Login failed',
      });
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.register(credentials);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Registration failed',
      });
      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();

      socketService.disconnect();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      socketService.disconnect();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Logout failed',
      });
    }
  },

  /**
   * Check if user is authenticated on app load
   */
  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const result = await authService.verifySession();

      if (result.valid && result.user) {
        // Initialize socket connection
        socketService.connect();

        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't show error for failed auth check
      });
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Set user directly (useful for updates)
   */
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: user !== null });
  },

  /**
   * Set hydration state
   */
  setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state });
  },

  /**
   * Verify user email with verification token
   */
  verifyEmail: async (token: string) => {
    set({ isLoading: true, error: null });

    try {
      await authService.verifyEmail(token);
      set({
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Email verification failed',
      });
      throw error;
    }
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      await authService.requestPasswordReset(email);
      set({
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to send password reset email',
      });
      throw error;
    }
  },

  /**
   * Reset password with token and new password
   */
  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null });

    try {
      await authService.resetPassword(token, newPassword);
      set({
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Password reset failed',
      });
      throw error;
    }
  },
}));
