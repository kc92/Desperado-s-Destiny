/**
 * Authentication Service
 * API methods for user authentication (login, register, logout)
 */

import { apiCall } from './api';
import type { User, LoginCredentials, RegisterCredentials } from '@/types';

/**
 * Login user with credentials
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiCall<{ user: User }>('post', '/auth/login', credentials);

  if (!response.user) {
    throw new Error('Invalid response structure');
  }

  return response.user;
}

/**
 * Register new user
 */
export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await apiCall<{ user: User }>('post', '/auth/register', credentials);
  return response.user;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  return apiCall<void>('post', '/auth/logout');
}

/**
 * Check if user is authenticated and get current user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiCall<{ user: User }>('get', '/auth/me');
  return response.user;
}

/**
 * Verify user session
 */
export async function verifySession(): Promise<{ valid: boolean; user?: User }> {
  try {
    const user = await getCurrentUser();
    return { valid: true, user };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Verify email with verification token
 */
export async function verifyEmail(token: string): Promise<void> {
  return apiCall<void>('post', '/auth/verify-email', { token });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  return apiCall<void>('post', '/auth/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  return apiCall<void>('post', '/auth/reset-password', { token, newPassword });
}

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  verifySession,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};

export default authService;
