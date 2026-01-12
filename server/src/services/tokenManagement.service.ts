/**
 * Token Management Service
 * Handles JWT access tokens and refresh tokens
 * Implements token blacklist in Redis for immediate revocation
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import { RefreshToken, IRefreshToken } from '../models/RefreshToken.model';
import { User } from '../models/User.model';
import { generateToken, verifyToken } from '../utils/jwt';
import logger from '../utils/logger';
import { config } from '../config';

// Redis client will be imported dynamically to avoid circular dependencies
let redisClientGetter: (() => any) | null = null;

function getRedisClient() {
  if (!redisClientGetter) {
    // Dynamically import Redis client getter
    try {
      const redis = require('../config/redis');
      // Use the getClient function, not a direct client reference
      redisClientGetter = redis.getClient || redis.default?.getClient;
      if (!redisClientGetter) {
        throw new Error('Redis getClient function not found');
      }
    } catch (error) {
      logger.error('Failed to load Redis client:', error);
      throw new Error('Redis not available');
    }
  }
  // Call the getter each time to get the current client instance
  return redisClientGetter();
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 days

// H1 SECURITY FIX: Limit concurrent sessions to prevent unlimited device proliferation
const MAX_CONCURRENT_SESSIONS = 5;

// =============================================================================
// SERVICE
// =============================================================================

export class TokenManagementService {
  /**
   * Generate access + refresh token pair
   *
   * @param userId - User ID
   * @param email - User email
   * @param ipAddress - Client IP address
   * @param userAgent - Client user agent
   * @returns Object with accessToken and refreshToken
   */
  static async generateTokenPair(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // H1 SECURITY FIX: Enforce concurrent session limit
    // Count existing active refresh tokens for this user
    const existingTokens = await RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastUsedAt: 1 }); // Sort oldest first

    // If at or over limit, revoke oldest tokens to make room
    if (existingTokens.length >= MAX_CONCURRENT_SESSIONS) {
      const tokensToRevoke = existingTokens.slice(0, existingTokens.length - MAX_CONCURRENT_SESSIONS + 1);
      const tokenIdsToRevoke = tokensToRevoke.map(t => t._id);

      await RefreshToken.updateMany(
        { _id: { $in: tokenIdsToRevoke } },
        { isRevoked: true, lastUsedAt: new Date() }
      );

      logger.info(`Revoked ${tokensToRevoke.length} oldest sessions for user ${userId} (session limit: ${MAX_CONCURRENT_SESSIONS})`);
    }

    // Short-lived access token (15 minutes)
    const accessToken = generateToken({ userId, email }, { expiresIn: ACCESS_TOKEN_EXPIRY });

    // Long-lived refresh token (30 days)
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Store refresh token in database
    await RefreshToken.create({
      userId,
      token: refreshTokenValue,
      expiresAt,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    logger.info(`Generated token pair for user ${userId}`);

    return { accessToken, refreshToken: refreshTokenValue };
  }

  /**
   * Refresh access token using refresh token
   * Uses atomic findOneAndUpdate to prevent race conditions
   *
   * @param refreshTokenValue - Refresh token from client
   * @param ipAddress - Client IP address (for security monitoring)
   * @returns New access token
   */
  static async refreshAccessToken(
    refreshTokenValue: string,
    ipAddress?: string
  ): Promise<{ accessToken: string }> {
    // RACE CONDITION FIX: Use atomic findOneAndUpdate to both validate and update in one operation
    // This prevents multiple concurrent requests from racing to refresh the same token
    const refreshToken = await RefreshToken.findOneAndUpdate(
      {
        token: refreshTokenValue,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { lastUsedAt: new Date() }
      },
      { new: true }
    );

    if (!refreshToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // H2 SECURITY FIX: Enforce IP binding - revoke token on suspicious IP change
    // This prevents token theft where attacker uses token from different location
    if (ipAddress && refreshToken.ipAddress !== ipAddress && refreshToken.ipAddress !== 'unknown') {
      logger.warn(
        `[SECURITY] Refresh token used from different IP: ${ipAddress} vs ${refreshToken.ipAddress} for user ${refreshToken.userId}`
      );

      // Revoke this specific token atomically - it may have been stolen
      await RefreshToken.findByIdAndUpdate(refreshToken._id, {
        isRevoked: true,
        lastUsedAt: new Date()
      });

      logger.warn(
        `[SECURITY] Token revoked due to IP mismatch for user ${refreshToken.userId}. User must re-authenticate.`
      );

      throw new Error('Session invalidated due to suspicious activity. Please log in again.');
    }

    // Load user
    const user = await User.findById(refreshToken.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token
    const accessToken = generateToken(
      { userId: user._id.toString(), email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    logger.debug(`Refreshed access token for user ${user._id}`);

    return { accessToken };
  }

  /**
   * Revoke all refresh tokens for a user (logout all devices)
   *
   * @param userId - User ID
   */
  static async revokeAllTokens(userId: string): Promise<void> {
    const result = await RefreshToken.updateMany(
      { userId, isRevoked: false },
      { isRevoked: true, lastUsedAt: new Date() }
    );

    logger.info(`Revoked ${result.modifiedCount} refresh tokens for user ${userId}`);
  }

  /**
   * Revoke single refresh token (logout current device)
   *
   * @param refreshTokenValue - Refresh token to revoke
   */
  static async revokeToken(refreshTokenValue: string): Promise<void> {
    const result = await RefreshToken.updateOne(
      { token: refreshTokenValue },
      { isRevoked: true, lastUsedAt: new Date() }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Revoked refresh token: ${refreshTokenValue.substring(0, 10)}...`);
    }
  }

  /**
   * Blacklist access token in Redis (for immediate invalidation)
   * Used during logout to ensure current access token can't be used
   *
   * @param token - Access token to blacklist
   * @param expiresInSeconds - TTL for blacklist entry (should match token expiry)
   */
  static async blacklistAccessToken(token: string, expiresInSeconds: number): Promise<void> {
    if (expiresInSeconds <= 0) {
      throw new Error('expiresInSeconds must be positive');
    }

    try {
      const redis = getRedisClient();
      const key = `blacklist:${token}`;

      // Store in Redis with TTL matching token expiry
      // Value doesn't matter, we just check existence
      await redis.setEx(key, expiresInSeconds, '1');

      logger.debug(`Blacklisted access token (TTL: ${expiresInSeconds}s)`);
    } catch (error) {
      logger.error('Failed to blacklist access token:', error);
      throw new Error('Token blacklist failed');
    }
  }

  /**
   * Check if access token is blacklisted
   * - Production: Fail closed (treat as blacklisted on Redis failure for security)
   * - Development/Test: Fail open (allow requests to continue for easier local development)
   *
   * @param token - Access token to check
   * @returns true if blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = `blacklist:${token}`;
      const result = await redis.get(key);

      return result !== null;
    } catch (error) {
      logger.error('Redis failure in token blacklist check:', error);

      // C6 SECURITY FIX: ALWAYS fail closed - treat as blacklisted for security
      // This is critical to prevent authentication bypass if Redis becomes unavailable
      // Set ALLOW_REDIS_BYPASS=true explicitly in dev if you need to bypass (NOT recommended)
      if (process.env.ALLOW_REDIS_BYPASS === 'true' && !config.isProduction) {
        logger.warn('[TOKEN] SECURITY WARNING: Redis unavailable, bypass enabled in non-prod - allowing request');
        return false;
      }

      logger.error('[TOKEN] Failing closed - token treated as blacklisted due to Redis unavailability');
      return true;
    }
  }

  /**
   * Get all active refresh tokens for a user
   * Useful for showing user their active sessions
   *
   * @param userId - User ID
   * @returns Array of active refresh tokens
   */
  static async getActiveTokens(userId: string): Promise<IRefreshToken[]> {
    return RefreshToken.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastUsedAt: -1 });
  }

  /**
   * Clean up expired tokens (usually handled by TTL index, but useful for manual cleanup)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} expired refresh tokens`);
    }

    return result.deletedCount;
  }

  /**
   * Calculate remaining time for access token
   * Used to determine TTL for blacklist entry
   *
   * @param token - JWT access token
   * @returns Remaining seconds until expiry (or 0 if expired/invalid)
   */
  static getRemainingTokenTime(token: string): number {
    try {
      const decoded = verifyToken(token) as any;

      if (!decoded || !decoded.exp) {
        return 0;
      }

      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const remainingMs = expiryTime - Date.now();

      return Math.max(0, Math.ceil(remainingMs / 1000)); // Convert to seconds
    } catch (error) {
      return 0;
    }
  }

  /**
   * Force logout user from all devices
   * Revokes all refresh tokens and blacklists current access token
   *
   * @param userId - User ID
   * @param currentAccessToken - Current access token to blacklist
   */
  static async forceLogoutAllDevices(
    userId: string,
    currentAccessToken?: string
  ): Promise<void> {
    // Revoke all refresh tokens
    await this.revokeAllTokens(userId);

    // Blacklist current access token if provided
    if (currentAccessToken) {
      const remainingTime = this.getRemainingTokenTime(currentAccessToken);
      if (remainingTime > 0) {
        await this.blacklistAccessToken(currentAccessToken, remainingTime);
      }
    }

    logger.info(`Force logged out user ${userId} from all devices`);
  }
}
