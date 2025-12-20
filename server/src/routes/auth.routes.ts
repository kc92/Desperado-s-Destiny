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
  passwordResetRateLimiter,
  twoFactorRateLimiter,
  emailVerificationRateLimiter
} from '../middleware/rateLimiter';
import { requireAuth } from '../middleware/auth.middleware';
import { validate, AuthSchemas } from '../validation';
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
  checkUsername,
  resendVerificationEmail,
  refreshToken,
  complete2FALogin
} from '../controllers/auth.controller';
import {
  initiateSetup as twoFactorSetup,
  verifySetup as twoFactorVerifySetup,
  verifyToken as twoFactorVerify,
  disable as twoFactorDisable,
  cancelSetup as twoFactorCancelSetup,
  regenerateBackupCodes as twoFactorBackupCodes,
  getStatus as twoFactorStatus
} from '../controllers/twoFactor.controller';
import { getCsrfToken, requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';

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

router.post('/register', registrationRateLimiter, validate(AuthSchemas.register), asyncHandler(register));

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
router.post('/verify-email', emailVerificationRateLimiter, asyncHandler(verifyEmail));

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 *
 * Body:
 * - email: string (required)
 *
 * Response:
 * - 200: If email exists and is unverified, email sent
 *
 * Rate limited: 3 requests per hour (prevents spam)
 */
router.post('/resend-verification', passwordResetRateLimiter, asyncHandler(resendVerificationEmail));

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
router.post('/login', loginRateLimiter, validate(AuthSchemas.login), asyncHandler(login));

/**
 * POST /api/auth/2fa/complete-login
 * Complete 2FA login by verifying TOTP code
 * Called after login returns requires2FA: true
 *
 * Body:
 * - token: string (6-digit TOTP or 8-char backup code)
 *
 * Response:
 * - 200: Login successful with user data
 * - 401: Invalid code or expired session
 */
router.post('/2fa/complete-login', twoFactorRateLimiter, asyncHandler(complete2FALogin));

/**
 * POST /api/auth/logout
 * Logout user by clearing JWT cookie
 *
 * Response:
 * - 200: Logout successful (clears cookie)
 */
router.post('/logout', asyncHandler(logout));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 *
 * Body:
 * - refreshToken: string (optional if sent via cookie)
 *
 * Response:
 * - 200: New access token returned and set in cookie
 * - 401: Invalid or expired refresh token
 */
router.post('/refresh', asyncHandler(refreshToken));

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
router.post('/reset-password', passwordResetRateLimiter, requireCsrfTokenWithRotation, validate(AuthSchemas.resetPassword), asyncHandler(resetPassword));

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
router.put('/preferences', requireAuth, requireCsrfToken, asyncHandler(updatePreferences));

/**
 * GET /api/auth/csrf-token
 * Get a fresh CSRF token for form submissions
 *
 * Headers:
 * - Cookie: token=<jwt>
 *
 * Response:
 * - 200: { csrfToken: string }
 * - 401: Not authenticated
 */
router.get('/csrf-token', requireAuth, getCsrfToken);

// =============================================================================
// Two-Factor Authentication Routes
// =============================================================================

/**
 * GET /api/auth/2fa/status
 * Get 2FA status for current user
 *
 * Response:
 * - 200: { enabled: boolean, pendingSetup: boolean, backupCodesRemaining: number }
 */
router.get('/2fa/status', requireAuth, asyncHandler(twoFactorStatus));

/**
 * GET /api/auth/2fa/setup
 * Initiate 2FA setup - returns QR code and backup codes
 *
 * Response:
 * - 200: { qrCodeUrl: string, secret: string, backupCodes: string[] }
 * - 400: 2FA already enabled
 */
router.get('/2fa/setup', requireAuth, asyncHandler(twoFactorSetup));

/**
 * POST /api/auth/2fa/verify-setup
 * Verify initial 2FA setup with a code from authenticator app
 *
 * Body:
 * - token: string (6-digit TOTP code)
 *
 * Response:
 * - 200: 2FA enabled successfully
 * - 400: Invalid verification code or setup not initiated
 */
router.post('/2fa/verify-setup', requireAuth, twoFactorRateLimiter, requireCsrfToken, asyncHandler(twoFactorVerifySetup));

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA token during login flow
 *
 * Body:
 * - token: string (6-digit TOTP or 8-char backup code)
 *
 * Response:
 * - 200: Verification successful
 * - 401: Invalid verification code
 */
router.post('/2fa/verify', requireAuth, twoFactorRateLimiter, requireCsrfToken, asyncHandler(twoFactorVerify));

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (requires password confirmation)
 *
 * Body:
 * - password: string (current password)
 *
 * Response:
 * - 200: 2FA disabled
 * - 401: Invalid password
 */
router.post('/2fa/disable', requireAuth, requireCsrfToken, asyncHandler(twoFactorDisable));

/**
 * POST /api/auth/2fa/cancel-setup
 * Cancel pending 2FA setup
 *
 * Response:
 * - 200: Setup cancelled
 */
router.post('/2fa/cancel-setup', requireAuth, requireCsrfToken, asyncHandler(twoFactorCancelSetup));

/**
 * POST /api/auth/2fa/backup-codes
 * Regenerate backup codes (invalidates previous codes)
 *
 * Response:
 * - 200: { backupCodes: string[] }
 * - 400: 2FA not enabled
 */
router.post('/2fa/backup-codes', requireAuth, requireCsrfToken, asyncHandler(twoFactorBackupCodes));

export default router;
