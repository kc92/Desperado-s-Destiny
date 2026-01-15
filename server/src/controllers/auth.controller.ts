/**
 * Authentication Controller
 *
 * Handles user authentication, registration, and password management
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword } from '@desperados/shared';
import { User } from '../models/User.model';
import { AppError, HttpStatus } from '../types';
import { generateToken, verifyToken } from '../utils/jwt';
import { sendSuccess, sendCreated, sendError } from '../utils/responseHelpers';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EmailService } from '../services/email.service';
import { AccountSecurityService } from '../services/accountSecurity.service';
import { logSecurityEvent, SecurityEvent } from '../services/base';
import { config } from '../config';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new AppError(
      emailValidation.errors[0],
      HttpStatus.BAD_REQUEST,
      true,
      { email: emailValidation.errors }
    );
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new AppError(
      passwordValidation.errors[0],
      HttpStatus.BAD_REQUEST,
      true,
      { password: passwordValidation.errors }
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError(
      'Email address is already registered',
      HttpStatus.CONFLICT
    );
  }

  // Hash password with bcrypt (12 rounds)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // SECURITY FIX: Always require email verification
  // Development convenience: Use explicit DEV_AUTO_VERIFY_EMAIL=true env var if needed
  const autoVerifyInDev = config.isDevelopment && process.env.DEV_AUTO_VERIFY_EMAIL === 'true';

  const user = new User({
    email: email.toLowerCase(),
    passwordHash,
    emailVerified: autoVerifyInDev, // Only auto-verify with explicit opt-in
    isActive: true,
    role: 'user'
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();

  // Save user
  await user.save();

  logger.info(`New user registered: ${user.email} (ID: ${user._id})`);

  // Send verification email (in production) or handle auto-verify (in development with explicit opt-in)
  if (autoVerifyInDev) {
    // SECURITY FIX: Don't log verification tokens
    logger.info(`[DEV] Auto-verified user: ${user.email}`);

    // In development, auto-login for convenience
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    user.lastLogin = new Date();
    await user.save();

    sendCreated(
      res,
      {
        user: user.toSafeObject(),
        token
      },
      'Registration successful. Welcome to Desperados Destiny!'
    );
  } else {
    // Production: Send verification email in background (non-blocking)
    // This prevents registration from timing out if email service is slow
    EmailService.sendVerificationEmail(
      user.email,
      user.email.split('@')[0], // Use email prefix as username placeholder
      verificationToken
    ).then(emailSent => {
      if (!emailSent) {
        logger.warn(`Failed to send verification email to ${user.email}`);
      } else {
        logger.info(`Verification email sent to ${user.email}`);
      }
    }).catch(error => {
      logger.error(`Error sending verification email to ${user.email}:`, error);
    });

    // Return success immediately - don't wait for email
    sendCreated(
      res,
      {
        email: user.email,
        requiresVerification: true
      },
      'Registration successful! Please check your email to verify your account before logging in.'
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Verify user's email with token
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body;

  if (!token) {
    throw new AppError(
      'Verification token is required',
      HttpStatus.BAD_REQUEST
    );
  }

  // Find user by verification token
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() } // Token not expired
  });

  if (!user) {
    throw new AppError(
      'Invalid or expired verification token',
      HttpStatus.BAD_REQUEST
    );
  }

  // Set emailVerified to true
  user.emailVerified = true;
  // Clear verification token and expiry
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;

  await user.save();

  logger.info(`Email verified for user: ${user.email} (ID: ${user._id})`);

  sendSuccess(res, {}, 'Email verified successfully. You can now log in.');
}

/**
 * POST /api/auth/login
 * Login user and return JWT token in cookie
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Validate email and password are present
  if (!email || !password) {
    throw new AppError(
      'Email and password are required',
      HttpStatus.BAD_REQUEST
    );
  }

  // Find user by email (include passwordHash and security fields in query)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw new AppError(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Check if account is locked using AccountSecurityService
  const isLocked = await AccountSecurityService.isAccountLocked(user._id.toString());
  if (isLocked) {
    const lockoutInfo = await AccountSecurityService.getLockoutInfo(user._id.toString());
    const remainingMinutes = lockoutInfo?.minutesRemaining || AccountSecurityService.LOCKOUT_DURATION_MINUTES;
    logger.warn(`[SECURITY] Login attempt on locked account: ${user.email}`);

    // Audit log locked account access attempt
    await logSecurityEvent({
      event: SecurityEvent.ACCOUNT_LOCKOUT,
      userId: user._id.toString(),
      ip: req.ip,
      severity: 'MEDIUM',
      metadata: {
        email: user.email,
        remainingMinutes,
        reason: 'login_attempt_while_locked'
      }
    });

    throw new AppError(
      `Account is temporarily locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`,
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  // Check if email is verified
  if (!user.emailVerified) {
    // Log unverified email login attempt for security monitoring
    await logSecurityEvent({
      event: SecurityEvent.FAILED_LOGIN,
      userId: user._id.toString(),
      ip: req.ip,
      severity: 'LOW',
      metadata: {
        email: user.email,
        reason: 'email_not_verified',
        failureType: 'unverified_email'
      }
    });

    throw new AppError(
      'Please verify your email address before logging in',
      HttpStatus.FORBIDDEN
    );
  }

  // Check if user is active
  if (!user.isActive) {
    // Log inactive account login attempt for security monitoring
    await logSecurityEvent({
      event: SecurityEvent.FAILED_LOGIN,
      userId: user._id.toString(),
      ip: req.ip,
      severity: 'MEDIUM',
      metadata: {
        email: user.email,
        reason: 'account_inactive',
        failureType: 'inactive_account'
      }
    });

    throw new AppError(
      'Account is inactive. Please contact support.',
      HttpStatus.FORBIDDEN
    );
  }

  // Compare password with bcrypt
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Record failed login using AccountSecurityService (handles atomic updates and lockout)
    const result = await AccountSecurityService.recordFailedLogin(user._id.toString());

    // Audit log failed login attempt
    await logSecurityEvent({
      event: SecurityEvent.FAILED_LOGIN,
      userId: user._id.toString(),
      ip: req.ip,
      severity: result.attemptsRemaining === 0 ? 'HIGH' : 'LOW',
      metadata: {
        email: user.email,
        attemptsRemaining: result.attemptsRemaining,
        accountLocked: result.attemptsRemaining === 0
      }
    });

    if (!result.allowed && result.attemptsRemaining === 0) {
      // Also log the lockout event
      await logSecurityEvent({
        event: SecurityEvent.ACCOUNT_LOCKOUT,
        userId: user._id.toString(),
        ip: req.ip,
        severity: 'HIGH',
        metadata: {
          email: user.email,
          reason: 'max_failed_attempts_reached',
          lockoutMinutes: AccountSecurityService.LOCKOUT_DURATION_MINUTES
        }
      });

      throw new AppError(
        result.message || `Account locked due to too many failed login attempts. Try again in ${AccountSecurityService.LOCKOUT_DURATION_MINUTES} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    throw new AppError(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Reset failed login attempts on successful login using AccountSecurityService
  await AccountSecurityService.resetFailedAttempts(user._id.toString());

  // Check if 2FA is enabled for this user
  if (user.twoFactorEnabled) {
    // Generate a temporary token for 2FA verification
    // This token only allows completing the 2FA step, not full access
    const tempToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      purpose: '2fa-pending' // Mark this as a pending 2FA token
    }, { expiresIn: '5m' }); // Short expiry for security

    // Set temporary token in cookie for 2FA verification
    res.cookie('2fa_pending', tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
      path: '/'
    });

    logger.info(`2FA required for user: ${user.email} (ID: ${user._id})`);

    sendSuccess(res, {
      requires2FA: true,
      message: 'Please enter your two-factor authentication code'
    });
    return;
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT with payload: { userId, email }
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email
  });

  // Set JWT in httpOnly cookie
  // SECURITY: Cookie maxAge is 7 days; JWT is refreshed automatically via refresh token
  res.cookie('token', token, {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Strict for CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/' // Explicitly set path to ensure cookie works for all routes
  });

  logger.info(`User logged in: ${user.email} (ID: ${user._id})`);

  // Return user object (safe, no password)
  sendSuccess(res, {
    user: user.toSafeObject()
  });
}

/**
 * POST /api/auth/2fa/complete-login
 * Complete 2FA login by verifying the TOTP code
 */
export async function complete2FALogin(req: Request, res: Response): Promise<void> {
  const { token: totpToken } = req.body;

  if (!totpToken) {
    throw new AppError(
      'Verification code is required',
      HttpStatus.BAD_REQUEST
    );
  }

  // Extract the pending 2FA token from cookie
  const pendingToken = req.cookies?.['2fa_pending'];
  if (!pendingToken) {
    throw new AppError(
      'No pending 2FA session found. Please log in again.',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Verify the pending token
  let decoded: { userId: string; email: string; purpose?: string };
  try {
    decoded = verifyToken(pendingToken) as typeof decoded;
  } catch (error) {
    // Clear the expired cookie
    res.clearCookie('2fa_pending', { httpOnly: true, path: '/' });
    throw new AppError(
      '2FA session expired. Please log in again.',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Verify this is a 2FA pending token
  if (decoded.purpose !== '2fa-pending') {
    throw new AppError(
      'Invalid 2FA session. Please log in again.',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Import TwoFactorService to verify the TOTP
  const { TwoFactorService } = await import('../services/twoFactor.service');
  const result = await TwoFactorService.verifyToken(decoded.userId, totpToken);

  if (!result.success) {
    throw new AppError(
      'Invalid verification code. Please try again.',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Clear the pending 2FA cookie
  res.clearCookie('2fa_pending', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  // Get user and update lastLogin
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  user.lastLogin = new Date();
  await user.save();

  // Generate full access token
  const accessToken = generateToken({
    userId: decoded.userId,
    email: decoded.email
  });

  // Set the access token cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/'
  });

  logger.info(`2FA login completed for user: ${decoded.email} (ID: ${decoded.userId})`);

  const response: Record<string, unknown> = {
    user: user.toSafeObject()
  };

  if (result.backupCodeUsed) {
    response.backupCodeUsed = true;
    response.remainingBackupCodes = result.remainingBackupCodes;
    response.warning = 'You used a backup code. Consider regenerating your backup codes.';
  }

  sendSuccess(res, response);
}

/**
 * POST /api/auth/logout
 * Logout user by clearing JWT cookie and blacklisting token
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // Extract and blacklist the current token to prevent reuse
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  // Try to get userId from request (if authenticated) for audit purposes
  const userId = (req as AuthenticatedRequest).user?._id?.toString();

  if (token) {
    try {
      const { TokenManagementService } = await import('../services/tokenManagement.service');
      const remainingTime = TokenManagementService.getRemainingTokenTime(token);

      if (remainingTime > 0) {
        await TokenManagementService.blacklistAccessToken(token, remainingTime);
        logger.info(`Token blacklisted on logout (TTL: ${remainingTime}s)`);

        // Audit log token invalidation
        await logSecurityEvent({
          event: SecurityEvent.TOKEN_INVALIDATED,
          userId,
          ip: req.ip,
          severity: 'LOW',
          metadata: {
            reason: 'logout',
            tokenTTL: remainingTime
          }
        });
      }
    } catch (error) {
      // Log but don't fail the logout - clearing cookie is sufficient for most cases
      logger.warn('Failed to blacklist token on logout:', error);
    }
  }

  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  logger.info('User logged out');

  sendSuccess(res, {}, 'Logged out successfully');
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(
      'User not authenticated',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Return current user from req.user (set by requireAuth middleware)
  sendSuccess(res, {
    user: req.user
  });
}

/**
 * POST /api/auth/forgot-password
 * Request password reset token
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    throw new AppError(
      'Email is required',
      HttpStatus.BAD_REQUEST
    );
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  // Don't reveal if email exists or not
  if (!user) {
    logger.debug(`Password reset requested for non-existent email: ${email}`);
    sendSuccess(res, {}, 'If the email exists, a password reset link has been sent');
    return;
  }

  // Generate reset token
  const resetToken = user.generateResetToken();

  // Save user with reset token
  await user.save();

  logger.info(`Password reset requested for user: ${user.email} (ID: ${user._id})`);

  // Always return success (don't leak if email exists)
  // SECURITY FIX: Never expose reset token in response, even in development
  sendSuccess(res, {}, 'If the email exists, a password reset link has been sent');
}

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError(
      'Token and new password are required',
      HttpStatus.BAD_REQUEST
    );
  }

  // H4 SECURITY FIX: Use atomic findOneAndUpdate to prevent race condition token reuse
  // This ensures only ONE request can successfully use the token
  // The token is invalidated in the same atomic operation as verification
  const user = await User.findOneAndUpdate(
    {
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() } // Token not expired
    },
    {
      // Immediately invalidate the token to prevent reuse
      $set: {
        resetPasswordExpiry: new Date(0) // Set expiry to past
      }
    },
    {
      new: false // Return the original document (before update) to verify it existed
    }
  ).select('+passwordHash');

  if (!user) {
    logger.warn(`[SECURITY] Invalid/expired/reused password reset token attempted`);
    throw new AppError(
      'Invalid or expired reset token',
      HttpStatus.BAD_REQUEST
    );
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    // If password validation fails, we've already invalidated the token
    // User will need to request a new one - this is safer than allowing retry
    logger.warn(`[SECURITY] Password validation failed during reset for user ${user._id}. Token consumed.`);
    throw new AppError(
      passwordValidation.errors[0],
      HttpStatus.BAD_REQUEST,
      true,
      { password: passwordValidation.errors }
    );
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // Update password hash and clear reset token
  user.passwordHash = newPasswordHash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  // H3 BONUS: Reset any account lockout on successful password reset
  user.failedLoginAttempts = 0;
  user.lastFailedLogin = undefined;
  user.accountLockedUntil = undefined;

  await user.save();

  logger.info(`Password reset for user: ${user.email} (ID: ${user._id})`);

  sendSuccess(res, {}, 'Password reset successfully. You can now log in with your new password.');
}

/**
 * Check if username is available
 * GET /api/auth/check-username?username=xxx
 * Note: Currently we don't store usernames, so we just validate format
 */
export async function checkUsername(req: Request, res: Response): Promise<void> {
  const username = req.query.username as string;

  if (!username || username.trim().length < 3) {
    res.status(400).json({
      success: false,
      error: 'Username must be at least 3 characters'
    });
    return;
  }

  if (username.length > 30) {
    res.status(400).json({
      success: false,
      error: 'Username must be 30 characters or less'
    });
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    res.status(400).json({
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    });
    return;
  }

  // Since we don't actually store usernames, all valid usernames are available
  res.status(200).json({
    success: true,
    available: true,
    username: username.trim()
  });
}

/**
 * POST /api/auth/resend-verification
 * Resend verification email to user
 */
export async function resendVerificationEmail(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    throw new AppError(
      'Email is required',
      HttpStatus.BAD_REQUEST
    );
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    logger.debug(`Resend verification requested for non-existent email: ${email}`);
    sendSuccess(res, {}, 'If the email exists and is unverified, a verification email has been sent');
    return;
  }

  // Check if already verified - return same generic message to prevent enumeration
  if (user.emailVerified) {
    sendSuccess(res, {}, 'If the email exists and is unverified, a verification email has been sent');
    return;
  }

  // Generate new verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();

  // Send verification email
  const emailSent = await EmailService.sendVerificationEmail(
    user.email,
    user.email.split('@')[0],
    verificationToken
  );

  if (!emailSent) {
    logger.warn(`Failed to resend verification email to ${user.email}`);
  }

  logger.info(`Verification email resent to: ${user.email}`);

  sendSuccess(res, {}, 'If the email exists and is unverified, a verification email has been sent');
}

/**
 * Get user preferences
 * GET /api/auth/preferences
 */
export async function getPreferences(req: Request, res: Response): Promise<void> {
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, { preferences: user.preferences });
}

/**
 * Update user preferences
 * PUT /api/auth/preferences
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  const { notifications, privacy } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  // Update notifications if provided
  if (notifications) {
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...notifications
    };
  }

  // Update privacy if provided
  if (privacy) {
    user.preferences.privacy = {
      ...user.preferences.privacy,
      ...privacy
    };
  }

  await user.save();

  logger.info(`Preferences updated for user: ${user.email} (ID: ${user._id})`);

  sendSuccess(res, { preferences: user.preferences }, 'Preferences saved successfully');
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  // Get refresh token from cookie or body
  const refreshTokenValue = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshTokenValue) {
    throw new AppError(
      'Refresh token is required',
      HttpStatus.UNAUTHORIZED
    );
  }

  try {
    const { TokenManagementService } = await import('../services/tokenManagement.service');
    const ipAddress = req.ip;

    const result = await TokenManagementService.refreshAccessToken(refreshTokenValue, ipAddress);

    // Set new access token in httpOnly cookie
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes (matches ACCESS_TOKEN_EXPIRY)
      path: '/'
    });

    logger.info('Access token refreshed successfully');

    sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed successfully');
  } catch (error) {
    // Clear cookies on refresh failure - user must re-login
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    const message = error instanceof Error ? error.message : 'Token refresh failed';
    throw new AppError(message, HttpStatus.UNAUTHORIZED);
  }
}

// Named exports are used above - no default export needed
