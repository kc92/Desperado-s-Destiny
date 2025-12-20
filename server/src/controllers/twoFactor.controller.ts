/**
 * Two-Factor Authentication Controller
 *
 * Handles 2FA setup, verification, and management endpoints
 */

import { Response } from 'express';
import { TwoFactorService } from '../services/twoFactor.service';
import { User } from '../models/User.model';
import { AppError, HttpStatus } from '../types';
import { sendSuccess, sendError } from '../utils/responseHelpers';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

// Validation schemas
const verifyTokenSchema = z.object({
  token: z.string().min(6).max(10).regex(/^[\d\s\-A-Fa-f]+$/, 'Invalid token format'),
});

const disableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

/**
 * GET /api/auth/2fa/setup
 * Initiate 2FA setup - returns QR code and backup codes
 */
export async function initiateSetup(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  const result = await TwoFactorService.generateSetup(userId);

  sendSuccess(res, {
    qrCodeUrl: result.qrCodeUrl,
    secret: result.secret, // For manual entry in authenticator apps
    backupCodes: result.backupCodes,
    message: 'Scan the QR code with your authenticator app, then verify with a code',
  });
}

/**
 * POST /api/auth/2fa/verify-setup
 * Verify initial 2FA setup with a code from authenticator app
 */
export async function verifySetup(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  const validation = verifyTokenSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(
      validation.error.errors[0].message,
      HttpStatus.BAD_REQUEST
    );
  }

  const { token } = validation.data;
  await TwoFactorService.verifyAndEnable(userId, token);

  logger.info(`2FA enabled for user ${userId}`);

  sendSuccess(res, {
    enabled: true,
    message: 'Two-factor authentication has been enabled successfully',
  });
}

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA token during login flow
 * This endpoint is called after initial password verification
 */
export async function verifyToken(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  const validation = verifyTokenSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(
      validation.error.errors[0].message,
      HttpStatus.BAD_REQUEST
    );
  }

  const { token } = validation.data;
  const result = await TwoFactorService.verifyToken(userId, token);

  if (!result.success) {
    throw new AppError(
      'Invalid verification code. Please try again.',
      HttpStatus.UNAUTHORIZED
    );
  }

  const response: Record<string, unknown> = {
    verified: true,
    message: '2FA verified successfully',
  };

  if (result.backupCodeUsed) {
    response.backupCodeUsed = true;
    response.remainingBackupCodes = result.remainingBackupCodes;
    response.warning = 'You used a backup code. Consider regenerating your backup codes.';
  }

  sendSuccess(res, response);
}

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (requires password confirmation)
 */
export async function disable(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  const validation = disableSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError(
      validation.error.errors[0].message,
      HttpStatus.BAD_REQUEST
    );
  }

  const { password } = validation.data;

  // Verify password before disabling
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new AppError(
      'Invalid password. Please enter your current password to disable 2FA.',
      HttpStatus.UNAUTHORIZED
    );
  }

  await TwoFactorService.disable(userId);

  logger.info(`2FA disabled for user ${userId}`);

  sendSuccess(res, {
    enabled: false,
    message: 'Two-factor authentication has been disabled',
  });
}

/**
 * POST /api/auth/2fa/cancel-setup
 * Cancel pending 2FA setup
 */
export async function cancelSetup(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  await TwoFactorService.cancelSetup(userId);

  sendSuccess(res, {
    message: '2FA setup has been cancelled',
  });
}

/**
 * POST /api/auth/2fa/backup-codes
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  const backupCodes = await TwoFactorService.regenerateBackupCodes(userId);

  logger.info(`Backup codes regenerated for user ${userId}`);

  sendSuccess(res, {
    backupCodes,
    message: 'New backup codes have been generated. Store them securely - you won\'t be able to see them again.',
  });
}

/**
 * GET /api/auth/2fa/status
 * Check 2FA status for current user
 */
export async function getStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user!._id.toString();

  const status = await TwoFactorService.getStatus(userId);

  sendSuccess(res, status);
}
