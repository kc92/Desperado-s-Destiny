/**
 * Authentication Routes
 *
 * Routes for user authentication, registration, and password management
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter
} from '../middleware/rateLimiter';
import { requireAuth } from '../middleware/auth.middleware';
import {
  register,
  verifyEmail,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getPreferences,
  updatePreferences,
  checkUsername
} from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 *
 * Body:
 * - email: string (required)
 * - password: string (required)
 *
 * Response:
 * - 201: User registered successfully
 * - 400: Validation error
 * - 409: Email already exists
 *
 * Rate limited: 3 requests per hour (strict to prevent spam)
 */
/**
 * GET /api/auth/check-username
 * Check if username is available
 *
 * Query:
 * - username: string (required, 3-20 chars, alphanumeric + underscore)
 *
 * Response:
 * - 200: { available: boolean }
 * - 400: Invalid username format
 */
router.get('/check-username', asyncHandler(checkUsername));

router.post('/register', registrationRateLimiter, asyncHandler(register));

/**
 * POST /api/auth/verify-email
 * Verify user's email address with token
 *
 * Body:
 * - token: string (required)
 *
 * Response:
 * - 200: Email verified successfully
 * - 400: Invalid or expired token
 */
router.post('/verify-email', asyncHandler(verifyEmail));

/**
 * POST /api/auth/login
 * Login user and return JWT token in cookie
 *
 * Body:
 * - email: string (required)
 * - password: string (required)
 *
 * Response:
 * - 200: Login successful (sets httpOnly cookie)
 * - 401: Invalid credentials
 * - 403: Email not verified or account inactive
 *
 * Rate limited: 5 requests per 15 minutes (prevents brute force)
 */
router.post('/login', loginRateLimiter, asyncHandler(login));

/**
 * POST /api/auth/logout
 * Logout user by clearing JWT cookie
 *
 * Response:
 * - 200: Logout successful (clears cookie)
 */
router.post('/logout', asyncHandler(logout));

/**
 * GET /api/auth/me
 * Get current authenticated user
 *
 * Headers:
 * - Cookie: token=<jwt> (or Authorization: Bearer <jwt>)
 *
 * Response:
 * - 200: Current user data
 * - 401: Not authenticated
 */
router.get('/me', requireAuth, asyncHandler(getCurrentUser));

/**
 * POST /api/auth/forgot-password
 * Request password reset token
 *
 * Body:
 * - email: string (required)
 *
 * Response:
 * - 200: Reset link sent (always, to prevent email enumeration)
 *
 * Rate limited: 3 requests per hour (prevents spam and enumeration)
 */
router.post('/forgot-password', passwordResetRateLimiter, asyncHandler(forgotPassword));

/**
 * POST /api/auth/reset-password
 * Reset password with token
 *
 * Body:
 * - token: string (required)
 * - newPassword: string (required)
 *
 * Response:
 * - 200: Password reset successfully
 * - 400: Invalid token or password validation failed
 *
 * Rate limited: 3 requests per hour (prevents abuse)
 */
router.post('/reset-password', passwordResetRateLimiter, asyncHandler(resetPassword));

/**
 * GET /api/auth/preferences
 * Get user preferences
 *
 * Headers:
 * - Cookie: token=<jwt>
 *
 * Response:
 * - 200: User preferences
 * - 401: Not authenticated
 */
router.get('/preferences', requireAuth, asyncHandler(getPreferences));

/**
 * PUT /api/auth/preferences
 * Update user preferences
 *
 * Headers:
 * - Cookie: token=<jwt>
 *
 * Body:
 * - notifications: object (optional)
 * - privacy: object (optional)
 *
 * Response:
 * - 200: Preferences updated
 * - 401: Not authenticated
 */
router.put('/preferences', requireAuth, asyncHandler(updatePreferences));

export default router;
