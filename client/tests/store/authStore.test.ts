/**
 * Auth Store Tests
 * Tests for authentication store functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';
import authService from '@/services/auth.service';

// Mock the auth service
vi.mock('@/services/auth.service');

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.login).mockResolvedValue(mockUser);

      const { login } = useAuthStore.getState();

      await login({ email: 'test@example.com', password: 'Password123' });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle login errors', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(authService.login).mockRejectedValue({ message: errorMessage });

      const { login } = useAuthStore.getState();

      await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should set loading state during login', async () => {
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });

      vi.mocked(authService.login).mockReturnValue(loginPromise as any);

      const { login } = useAuthStore.getState();
      const loginCall = login({ email: 'test@example.com', password: 'Password123' });

      // Check loading state
      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveLogin({ _id: '123', email: 'test@example.com' });
      await loginCall;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = {
        _id: '456',
        email: 'newuser@example.com',
        emailVerified: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.register).mockResolvedValue(mockUser);

      const { register } = useAuthStore.getState();

      await register({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle registration errors', async () => {
      const errorMessage = 'Email already exists';
      vi.mocked(authService.register).mockRejectedValue({ message: errorMessage });

      const { register } = useAuthStore.getState();

      await expect(
        register({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        })
      ).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: {
          _id: '123',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        isAuthenticated: true,
      });

      vi.mocked(authService.logout).mockResolvedValue();

      const { logout } = useAuthStore.getState();
      await logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear state even if logout API fails', async () => {
      useAuthStore.setState({
        user: {
          _id: '123',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        isAuthenticated: true,
      });

      vi.mocked(authService.logout).mockRejectedValue({ message: 'Server error' });

      const { logout } = useAuthStore.getState();
      await logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should verify valid session', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      vi.mocked(authService.verifySession).mockResolvedValue({
        valid: true,
        user: mockUser,
      });

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle invalid session', async () => {
      vi.mocked(authService.verifySession).mockResolvedValue({
        valid: false,
      });

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      vi.mocked(authService.verifyEmail).mockResolvedValue();

      const { verifyEmail } = useAuthStore.getState();
      await verifyEmail('valid-token');

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle verification errors', async () => {
      const errorMessage = 'Invalid or expired token';
      vi.mocked(authService.verifyEmail).mockRejectedValue({ message: errorMessage });

      const { verifyEmail } = useAuthStore.getState();
      await expect(verifyEmail('invalid-token')).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email successfully', async () => {
      vi.mocked(authService.requestPasswordReset).mockResolvedValue();

      const { forgotPassword } = useAuthStore.getState();
      await forgotPassword('test@example.com');

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue();

      const { resetPassword } = useAuthStore.getState();
      await resetPassword('valid-token', 'NewPassword123');

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });

    it('should handle reset errors', async () => {
      const errorMessage = 'Token expired';
      vi.mocked(authService.resetPassword).mockRejectedValue({ message: errorMessage });

      const { resetPassword } = useAuthStore.getState();
      await expect(resetPassword('expired-token', 'NewPassword123')).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      const { clearError } = useAuthStore.getState();
      clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
