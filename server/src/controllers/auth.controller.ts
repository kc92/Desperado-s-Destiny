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
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendCreated, sendError } from '../utils/responseHelpers';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

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

  // Create user with emailVerified: false
  const user = new User({
    email: email.toLowerCase(),
    passwordHash,
    emailVerified: false,
    isActive: true,
    role: 'user'
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();

  // Save user
  await user.save();

  logger.info(`New user registered: ${user.email} (ID: ${user._id})`);

  // TODO: Send verification email
  // For now, we'll just log the token
  logger.debug(`Verification token for ${user.email}: ${verificationToken}`);

  // Return success response (do NOT auto-login)
  const responseData: any = {};
  if (process.env.NODE_ENV === 'development') {
    responseData.verificationToken = verificationToken;
  }

  sendCreated(
    res,
    responseData,
    'Registration successful. Please check your email for verification link.'
  );
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

  // Find user by email (include passwordHash in query)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw new AppError(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new AppError(
      'Please verify your email address before logging in',
      HttpStatus.FORBIDDEN
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(
      'Account is inactive. Please contact support.',
      HttpStatus.FORBIDDEN
    );
  }

  // Compare password with bcrypt
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new AppError(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED
    );
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
  res.cookie('token', token, {
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  logger.info(`User logged in: ${user.email} (ID: ${user._id})`);

  // Return user object (safe, no password)
  sendSuccess(res, {
    user: user.toSafeObject()
  });
}

/**
 * POST /api/auth/logout
 * Logout user by clearing JWT cookie
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
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

  // TODO: Send reset email
  // For now, we'll just log the token
  logger.debug(`Password reset token for ${user.email}: ${resetToken}`);

  // Always return success (don't leak if email exists)
  const resetResponseData: any = {};
  if (process.env.NODE_ENV === 'development') {
    resetResponseData.resetToken = resetToken;
  }

  sendSuccess(res, resetResponseData, 'If the email exists, a password reset link has been sent');
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

  // Find user by reset token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() } // Token not expired
  }).select('+passwordHash');

  if (!user) {
    throw new AppError(
      'Invalid or expired reset token',
      HttpStatus.BAD_REQUEST
    );
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
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

  // Update password hash
  user.passwordHash = newPasswordHash;
  // Clear reset token and expiry
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  logger.info(`Password reset for user: ${user.email} (ID: ${user._id})`);

  sendSuccess(res, {}, 'Password reset successfully. You can now log in with your new password.');
}

export default {
  register,
  verifyEmail,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
