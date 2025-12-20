/**
 * Account Security Service
 * Handles account lockout after failed login attempts
 * Prevents brute-force attacks by locking accounts after repeated failures
 */

import { User } from '../models/User.model';
import logger from '../utils/logger';

// =============================================================================
// CONSTANTS (configurable via environment variables)
// =============================================================================

const MAX_FAILED_ATTEMPTS = parseInt(process.env.ACCOUNT_MAX_FAILED_ATTEMPTS || '10', 10);
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES || '30', 10);

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining?: number;
  resetAt?: Date;
  message?: string;
}

// =============================================================================
// SERVICE
// =============================================================================

export class AccountSecurityService {
  static readonly MAX_FAILED_ATTEMPTS = MAX_FAILED_ATTEMPTS;
  static readonly LOCKOUT_DURATION_MINUTES = LOCKOUT_DURATION_MINUTES;

  /**
   * Record failed login attempt
   * Locks account after MAX_FAILED_ATTEMPTS failures
   *
   * @param userId - User ID or email
   * @returns Object with lockout status and attempts remaining
   */
  static async recordFailedLogin(userId: string): Promise<RateLimitResult> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          allowed: false,
          message: 'Invalid credentials',
        };
      }

      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();

      if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.accountLockedUntil = new Date(
          Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000
        );

        await user.save();

        logger.warn(
          `Account locked due to ${user.failedLoginAttempts} failed login attempts: ${user.email}`
        );

        return {
          allowed: false,
          attemptsRemaining: 0,
          resetAt: user.accountLockedUntil,
          message: `Account locked for ${this.LOCKOUT_DURATION_MINUTES} minutes due to too many failed login attempts`,
        };
      }

      await user.save();

      const remaining = this.MAX_FAILED_ATTEMPTS - user.failedLoginAttempts;

      logger.debug(
        `Failed login attempt ${user.failedLoginAttempts}/${this.MAX_FAILED_ATTEMPTS} for user ${user.email}`
      );

      return {
        allowed: true,
        attemptsRemaining: remaining,
        message: `Invalid credentials. ${remaining} attempt(s) remaining before account lockout.`,
      };
    } catch (error) {
      logger.error('Error recording failed login:', error);
      throw error;
    }
  }

  /**
   * Record failed login by email (when user ID not yet known)
   *
   * @param email - User email
   * @returns Object with lockout status and attempts remaining
   */
  static async recordFailedLoginByEmail(email: string): Promise<RateLimitResult> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          allowed: false,
          message: 'Invalid credentials',
        };
      }

      return this.recordFailedLogin(user._id.toString());
    } catch (error) {
      logger.error('Error recording failed login by email:', error);
      throw error;
    }
  }

  /**
   * Reset failed login attempts on successful login
   *
   * @param userId - User ID
   */
  static async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await User.updateOne(
        { _id: userId },
        {
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          accountLockedUntil: null,
        }
      );

      logger.debug(`Reset failed login attempts for user ${userId}`);
    } catch (error) {
      logger.error('Error resetting failed attempts:', error);
      throw error;
    }
  }

  /**
   * Check if account is currently locked
   * Automatically clears expired lockouts
   *
   * @param userId - User ID
   * @returns true if account is locked
   */
  static async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.accountLockedUntil) {
        return false;
      }

      const now = new Date();

      // Check if lockout has expired
      if (user.accountLockedUntil > now) {
        // Still locked
        return true;
      }

      // Lockout expired - clear it
      user.accountLockedUntil = null;
      user.failedLoginAttempts = 0;
      user.lastFailedLogin = null;
      await user.save();

      logger.info(`Account lockout expired and cleared for user ${user.email}`);

      return false;
    } catch (error) {
      logger.error('Error checking account lockout:', error);
      throw error;
    }
  }

  /**
   * Check if account is locked by email
   *
   * @param email - User email
   * @returns true if account is locked
   */
  static async isAccountLockedByEmail(email: string): Promise<boolean> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return false;
      }

      return this.isAccountLocked(user._id.toString());
    } catch (error) {
      logger.error('Error checking account lockout by email:', error);
      throw error;
    }
  }

  /**
   * Get lockout information for a user
   *
   * @param userId - User ID
   * @returns Lockout details or null if not locked
   */
  static async getLockoutInfo(userId: string): Promise<{
    isLocked: boolean;
    lockedUntil?: Date;
    failedAttempts: number;
    minutesRemaining?: number;
  } | null> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return null;
      }

      const isLocked = await this.isAccountLocked(userId);

      if (!isLocked) {
        return {
          isLocked: false,
          failedAttempts: user.failedLoginAttempts,
        };
      }

      const minutesRemaining = user.accountLockedUntil
        ? Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / (60 * 1000))
        : 0;

      return {
        isLocked: true,
        lockedUntil: user.accountLockedUntil,
        failedAttempts: user.failedLoginAttempts,
        minutesRemaining: Math.max(0, minutesRemaining),
      };
    } catch (error) {
      logger.error('Error getting lockout info:', error);
      throw error;
    }
  }

  /**
   * Manually unlock an account (admin function)
   *
   * @param userId - User ID
   */
  static async unlockAccount(userId: string): Promise<void> {
    try {
      await User.updateOne(
        { _id: userId },
        {
          accountLockedUntil: null,
          failedLoginAttempts: 0,
          lastFailedLogin: null,
        }
      );

      logger.info(`Manually unlocked account for user ${userId}`);
    } catch (error) {
      logger.error('Error unlocking account:', error);
      throw error;
    }
  }

  /**
   * Clean up expired lockouts (maintenance task)
   * Usually not needed as isAccountLocked auto-clears, but useful for batch cleanup
   */
  static async cleanupExpiredLockouts(): Promise<number> {
    try {
      const result = await User.updateMany(
        {
          accountLockedUntil: { $lt: new Date() },
        },
        {
          accountLockedUntil: null,
          failedLoginAttempts: 0,
          lastFailedLogin: null,
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`Cleaned up ${result.modifiedCount} expired account lockouts`);
      }

      return result.modifiedCount;
    } catch (error) {
      logger.error('Error cleaning up expired lockouts:', error);
      throw error;
    }
  }
}
