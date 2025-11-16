/**
 * Authentication Routes
 *
 * Routes for user authentication, registration, and password management
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import { requireAuth } from '../middleware/auth.middleware';
import {
  register,
  verifyEmail,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';

const router = Router();

/**
 * Apply rate limiting to all auth routes
 * 5 requests per 15 minutes per IP
 */
router.use(authRateLimiter);

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
 */
router.post('/register', asyncHandler(register));

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
 */
router.post('/login', asyncHandler(login));

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
 */
router.post('/forgot-password', asyncHandler(forgotPassword));

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
 */
router.post('/reset-password', asyncHandler(resetPassword));

export default router;
