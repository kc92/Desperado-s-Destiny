/**
 * Two-Factor Authentication Service
 *
 * Implements TOTP-based 2FA using speakeasy library.
 * Supports backup codes for account recovery.
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { User, IUserDocument } from '../models/User.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

interface TwoFactorSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface TwoFactorVerifyResult {
  success: boolean;
  backupCodeUsed?: boolean;
  remainingBackupCodes?: number;
}

const ISSUER = process.env.TWO_FACTOR_ISSUER || 'Desperados Destiny';
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8; // 8 hex chars = 4 bytes

export class TwoFactorService {
  /**
   * Generate 2FA setup data for a user
   * Returns QR code, secret, and backup codes
   */
  static async generateSetup(userId: string): Promise<TwoFactorSetupResult> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.twoFactorEnabled) {
      throw new AppError('Two-factor authentication is already enabled', 400);
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `${ISSUER}:${user.email}`,
      issuer: ISSUER,
      length: 32,
    });

    if (!secret.otpauth_url) {
      throw new AppError('Failed to generate 2FA secret', 500);
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = backupCodes.map((code) =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Store pending setup (not yet verified)
    user.twoFactorSecret = secret.base32;
    user.twoFactorBackupCodes = hashedBackupCodes;
    user.twoFactorPendingSetup = true;
    await user.save();

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    logger.info(`2FA setup initiated for user ${userId}`);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify and enable 2FA after initial setup
   * User must provide a valid code from their authenticator app
   */
  static async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.twoFactorPendingSetup || !user.twoFactorSecret) {
      throw new AppError('2FA setup not initiated. Please start setup first.', 400);
    }

    if (user.twoFactorEnabled) {
      throw new AppError('2FA is already enabled', 400);
    }

    // Verify the TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), // Remove any spaces
      window: 1, // Allow 1 step variance (30 seconds before/after)
    });

    if (!verified) {
      throw new AppError('Invalid verification code. Please try again.', 400);
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorPendingSetup = false;
    await user.save();

    logger.info(`2FA enabled for user ${userId}`);
    return true;
  }

  /**
   * Verify TOTP token during login
   * Also accepts backup codes
   */
  static async verifyToken(userId: string, token: string): Promise<TwoFactorVerifyResult> {
    const user = await User.findById(userId).select(
      '+twoFactorSecret +twoFactorBackupCodes'
    );
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError('2FA is not enabled for this account', 400);
    }

    const normalizedToken = token.replace(/[\s-]/g, ''); // Remove spaces and dashes

    // Try TOTP verification first (6-digit codes)
    if (normalizedToken.length === 6 && /^\d+$/.test(normalizedToken)) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: normalizedToken,
        window: 1,
      });

      if (verified) {
        return { success: true, backupCodeUsed: false };
      }
    }

    // Try backup codes (8-character hex codes)
    if (normalizedToken.length === BACKUP_CODE_LENGTH) {
      const hashedToken = crypto
        .createHash('sha256')
        .update(normalizedToken.toUpperCase())
        .digest('hex');

      const backupCodes = user.twoFactorBackupCodes || [];
      const backupIndex = backupCodes.findIndex((code) => code === hashedToken);

      if (backupIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(backupIndex, 1);
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        const remaining = backupCodes.length;
        logger.warn(
          `Backup code used for user ${userId}. ${remaining} codes remaining.`
        );

        return {
          success: true,
          backupCodeUsed: true,
          remainingBackupCodes: remaining,
        };
      }
    }

    // No valid code found
    return { success: false };
  }

  /**
   * Disable 2FA for a user
   * Caller must verify password before calling this
   */
  static async disable(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      throw new AppError('2FA is not enabled', 400);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    user.twoFactorPendingSetup = false;
    await user.save();

    logger.info(`2FA disabled for user ${userId}`);
  }

  /**
   * Cancel pending 2FA setup
   */
  static async cancelSetup(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.twoFactorEnabled) {
      throw new AppError('Cannot cancel setup - 2FA is already enabled', 400);
    }

    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = undefined;
    user.twoFactorPendingSetup = false;
    await user.save();

    logger.info(`2FA setup cancelled for user ${userId}`);
  }

  /**
   * Regenerate backup codes
   * Invalidates all previous backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      throw new AppError('2FA must be enabled to regenerate backup codes', 400);
    }

    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = backupCodes.map((code) =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save();

    logger.info(`Backup codes regenerated for user ${userId}`);
    return backupCodes;
  }

  /**
   * Get remaining backup codes count
   */
  static async getBackupCodesCount(userId: string): Promise<number> {
    const user = await User.findById(userId).select('+twoFactorBackupCodes');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.twoFactorBackupCodes?.length || 0;
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isEnabled(userId: string): Promise<boolean> {
    const user = await User.findById(userId).select('twoFactorEnabled');
    return user?.twoFactorEnabled ?? false;
  }

  /**
   * Check if user has pending 2FA setup
   */
  static async hasPendingSetup(userId: string): Promise<boolean> {
    const user = await User.findById(userId).select('twoFactorPendingSetup');
    return user?.twoFactorPendingSetup ?? false;
  }

  /**
   * Get 2FA status for a user
   */
  static async getStatus(
    userId: string
  ): Promise<{ enabled: boolean; pendingSetup: boolean; backupCodesRemaining: number }> {
    const user = await User.findById(userId).select(
      'twoFactorEnabled twoFactorPendingSetup +twoFactorBackupCodes'
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      enabled: user.twoFactorEnabled ?? false,
      pendingSetup: user.twoFactorPendingSetup ?? false,
      backupCodesRemaining: user.twoFactorBackupCodes?.length ?? 0,
    };
  }

  /**
   * Generate random backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      // Generate 4 random bytes = 8 hex characters
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}

export default TwoFactorService;
