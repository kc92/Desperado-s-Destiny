/**
 * Chat Rate Limiter Middleware
 *
 * Redis-based rate limiting for chat messages
 */

import { getRedisClient } from '../config/redis';
import { RoomType } from '../models/Message.model';
import logger from '../utils/logger';

/**
 * Rate limit configuration per room type
 */
const RATE_LIMITS: Record<RoomType, { messages: number; windowSeconds: number }> = {
  [RoomType.GLOBAL]: {
    messages: 5,
    windowSeconds: 10
  },
  [RoomType.FACTION]: {
    messages: 5,
    windowSeconds: 10
  },
  [RoomType.GANG]: {
    messages: 10,
    windowSeconds: 10
  },
  [RoomType.WHISPER]: {
    messages: 10,
    windowSeconds: 10
  }
};

/**
 * Mute configuration
 */
const MUTE_CONFIG = {
  violationsBeforeMute: 3,
  violationWindowSeconds: 300, // 5 minutes
  muteDurationSeconds: 300 // 5 minutes
};

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  resetAt?: Date;
  remaining?: number;
  isMuted?: boolean;
  muteExpiresAt?: Date;
}

/**
 * Chat Rate Limiter Class
 */
export class ChatRateLimiter {
  /**
   * Check if user can send a message
   *
   * @param userId - User's ID
   * @param characterId - Character's ID
   * @param roomType - Room type
   * @param isAdmin - Whether user is admin (admins bypass rate limits)
   * @returns Rate limit result
   */
  static async checkRateLimit(
    userId: string,
    characterId: string,
    roomType: RoomType,
    isAdmin: boolean = false
  ): Promise<RateLimitResult> {
    try {
      // Admins bypass rate limits
      if (isAdmin) {
        return { allowed: true };
      }

      const redis = getRedisClient();

      // Check if user is muted
      const muteKey = `mute:${userId}`;
      const muteData = await redis.get(muteKey);

      if (muteData) {
        const muteExpiry = await redis.ttl(muteKey);
        const muteExpiresAt = new Date(Date.now() + muteExpiry * 1000);

        return {
          allowed: false,
          isMuted: true,
          muteExpiresAt
        };
      }

      // Get rate limit config for room type
      const config = RATE_LIMITS[roomType];
      const rateLimitKey = `chat:ratelimit:${userId}:${roomType}`;

      // Get current timestamps
      const timestamps = await redis.lRange(rateLimitKey, 0, -1);
      const now = Date.now();
      const windowStart = now - (config.windowSeconds * 1000);

      // Filter out expired timestamps
      const validTimestamps = timestamps
        .map(ts => parseInt(ts, 10))
        .filter(ts => ts > windowStart);

      // Check if rate limit exceeded
      if (validTimestamps.length >= config.messages) {
        // Rate limit exceeded - record violation
        await this.recordViolation(userId, characterId);

        // Calculate when rate limit resets
        const oldestTimestamp = Math.min(...validTimestamps);
        const resetAt = new Date(oldestTimestamp + (config.windowSeconds * 1000));

        const remaining = 0;

        return {
          allowed: false,
          resetAt,
          remaining
        };
      }

      // Allow the message
      // Add current timestamp to the list (using transaction for atomicity)
      await redis
        .multi()
        .rPush(rateLimitKey, now.toString())
        .expire(rateLimitKey, config.windowSeconds)
        .exec();

      const remaining = config.messages - (validTimestamps.length + 1);

      return {
        allowed: true,
        remaining
      };
    } catch (error) {
      logger.error('Error checking rate limit:', error);

      // SECURITY FIX: Fail CLOSED - deny the message if rate limiting fails
      // This prevents abuse when Redis is unavailable
      return {
        allowed: false,
        remaining: 0
      };
    }
  }

  /**
   * Record a rate limit violation
   *
   * @param userId - User's ID
   * @param characterId - Character's ID
   */
  static async recordViolation(
    userId: string,
    characterId: string
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const violationKey = `chat:violations:${userId}`;

      // Add violation timestamp
      await redis.rPush(violationKey, Date.now().toString());
      await redis.expire(violationKey, MUTE_CONFIG.violationWindowSeconds);

      // Get all violations in the window
      const violations = await redis.lRange(violationKey, 0, -1);
      const now = Date.now();
      const windowStart = now - (MUTE_CONFIG.violationWindowSeconds * 1000);

      const recentViolations = violations
        .map(v => parseInt(v, 10))
        .filter(v => v > windowStart);

      // Check if we should mute the user
      if (recentViolations.length >= MUTE_CONFIG.violationsBeforeMute) {
        await this.muteUser(userId, characterId, MUTE_CONFIG.muteDurationSeconds);
        logger.warn(
          `User ${userId} (character ${characterId}) auto-muted for ${MUTE_CONFIG.violationsBeforeMute} rate limit violations`
        );
      }
    } catch (error) {
      logger.error('Error recording violation:', error);
    }
  }

  /**
   * Mute a user
   *
   * @param userId - User's ID
   * @param characterId - Character's ID
   * @param durationSeconds - Mute duration in seconds
   */
  static async muteUser(
    userId: string,
    characterId: string,
    durationSeconds: number
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const muteKey = `mute:${userId}`;

      const muteData = JSON.stringify({
        userId,
        characterId,
        mutedAt: new Date().toISOString(),
        durationSeconds
      });

      await redis.setEx(muteKey, durationSeconds, muteData);

      logger.info(`User ${userId} muted for ${durationSeconds} seconds`);
    } catch (error) {
      logger.error('Error muting user:', error);
      throw new Error('Failed to mute user');
    }
  }

  /**
   * Unmute a user
   *
   * @param userId - User's ID
   */
  static async unmuteUser(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const muteKey = `mute:${userId}`;

      await redis.del(muteKey);

      logger.info(`User ${userId} unmuted`);
    } catch (error) {
      logger.error('Error unmuting user:', error);
      throw new Error('Failed to unmute user');
    }
  }

  /**
   * Check if user is muted
   *
   * @param userId - User's ID
   * @returns Mute status and expiry
   */
  static async checkMuteStatus(userId: string): Promise<{
    isMuted: boolean;
    expiresAt?: Date;
    reason?: string;
  }> {
    try {
      const redis = getRedisClient();
      const muteKey = `mute:${userId}`;

      const muteData = await redis.get(muteKey);

      if (!muteData) {
        return { isMuted: false };
      }

      const ttl = await redis.ttl(muteKey);
      const expiresAt = new Date(Date.now() + ttl * 1000);

      return {
        isMuted: true,
        expiresAt,
        reason: 'Rate limit violations'
      };
    } catch (error) {
      logger.error('Error checking mute status:', error);
      // SECURITY FIX: Fail CLOSED - assume muted if check fails
      return {
        isMuted: true,
        reason: 'Unable to verify mute status - please try again'
      };
    }
  }

  /**
   * Ban user from chat
   *
   * @param userId - User's ID
   * @param reason - Ban reason
   */
  static async banUser(
    userId: string,
    reason: string = 'Violation of chat rules'
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const banKey = `chatban:${userId}`;

      const banData = JSON.stringify({
        userId,
        bannedAt: new Date().toISOString(),
        reason
      });

      // Permanent ban (no TTL)
      await redis.set(banKey, banData);

      logger.warn(`User ${userId} permanently banned from chat: ${reason}`);
    } catch (error) {
      logger.error('Error banning user:', error);
      throw new Error('Failed to ban user');
    }
  }

  /**
   * Unban user from chat
   *
   * @param userId - User's ID
   */
  static async unbanUser(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const banKey = `chatban:${userId}`;

      await redis.del(banKey);

      logger.info(`User ${userId} unbanned from chat`);
    } catch (error) {
      logger.error('Error unbanning user:', error);
      throw new Error('Failed to unban user');
    }
  }

  /**
   * Check if user is banned
   *
   * @param userId - User's ID
   * @returns Ban status
   */
  static async checkBanStatus(userId: string): Promise<{
    isBanned: boolean;
    reason?: string;
    bannedAt?: Date;
  }> {
    try {
      const redis = getRedisClient();
      const banKey = `chatban:${userId}`;

      const banData = await redis.get(banKey);

      if (!banData) {
        return { isBanned: false };
      }

      const parsed = JSON.parse(banData);

      return {
        isBanned: true,
        reason: parsed.reason,
        bannedAt: new Date(parsed.bannedAt)
      };
    } catch (error) {
      logger.error('Error checking ban status:', error);
      // SECURITY FIX: Fail CLOSED - assume banned if check fails
      return {
        isBanned: true,
        reason: 'Unable to verify ban status - please try again'
      };
    }
  }

  /**
   * Clear all violations for a user
   *
   * @param userId - User's ID
   */
  static async clearViolations(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const violationKey = `chat:violations:${userId}`;

      await redis.del(violationKey);

      logger.debug(`Violations cleared for user ${userId}`);
    } catch (error) {
      logger.error('Error clearing violations:', error);
    }
  }

  /**
   * Clear rate limit for a user (admin utility)
   *
   * @param userId - User's ID
   * @param roomType - Optional room type (clears all if not specified)
   */
  static async clearRateLimit(
    userId: string,
    roomType?: RoomType
  ): Promise<void> {
    try {
      const redis = getRedisClient();

      if (roomType) {
        const key = `chat:ratelimit:${userId}:${roomType}`;
        await redis.del(key);
      } else {
        // Clear all room types
        const roomTypes = Object.values(RoomType);
        const keys = roomTypes.map(rt => `chat:ratelimit:${userId}:${rt}`);

        if (keys.length > 0) {
          await redis.del(keys);
        }
      }

      logger.debug(`Rate limit cleared for user ${userId}`);
    } catch (error) {
      logger.error('Error clearing rate limit:', error);
    }
  }

  /**
   * Check rate limit for history fetch (socket event)
   * Prevents rapid history fetching that could overload the server
   *
   * @param userId - User's ID
   * @returns Rate limit result with retryAfter in seconds
   */
  static async checkHistoryFetchLimit(userId: string): Promise<RateLimitResult & { retryAfter?: number }> {
    try {
      const redis = getRedisClient();
      const key = `chat:history:${userId}`;
      const maxRequests = 30;
      const windowSeconds = 60;

      // Get current timestamps
      const timestamps = await redis.lRange(key, 0, -1);
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);

      // Filter out expired timestamps
      const validTimestamps = timestamps
        .map(ts => parseInt(ts, 10))
        .filter(ts => ts > windowStart);

      // Check if rate limit exceeded
      if (validTimestamps.length >= maxRequests) {
        const oldestTimestamp = Math.min(...validTimestamps);
        const resetAt = new Date(oldestTimestamp + (windowSeconds * 1000));
        const retryAfter = Math.ceil((resetAt.getTime() - now) / 1000);

        return {
          allowed: false,
          resetAt,
          remaining: 0,
          retryAfter
        };
      }

      // Allow the request - add timestamp
      await redis
        .multi()
        .rPush(key, now.toString())
        .expire(key, windowSeconds)
        .exec();

      return {
        allowed: true,
        remaining: maxRequests - (validTimestamps.length + 1)
      };
    } catch (error) {
      logger.error('Error checking history fetch limit:', error);
      // SECURITY: Fail closed
      return { allowed: false, remaining: 0, retryAfter: 60 };
    }
  }

  /**
   * Check rate limit for typing indicator (socket event)
   * Prevents typing indicator spam
   *
   * @param userId - User's ID
   * @returns Rate limit result
   */
  static async checkTypingLimit(userId: string): Promise<RateLimitResult> {
    try {
      const redis = getRedisClient();
      const key = `chat:typing:${userId}`;
      const maxRequests = 10;
      const windowSeconds = 5;

      // Get current timestamps
      const timestamps = await redis.lRange(key, 0, -1);
      const now = Date.now();
      const windowStart = now - (windowSeconds * 1000);

      // Filter out expired timestamps
      const validTimestamps = timestamps
        .map(ts => parseInt(ts, 10))
        .filter(ts => ts > windowStart);

      // Check if rate limit exceeded
      if (validTimestamps.length >= maxRequests) {
        return {
          allowed: false,
          remaining: 0
        };
      }

      // Allow - add timestamp
      await redis
        .multi()
        .rPush(key, now.toString())
        .expire(key, windowSeconds)
        .exec();

      return {
        allowed: true,
        remaining: maxRequests - (validTimestamps.length + 1)
      };
    } catch (error) {
      logger.error('Error checking typing limit:', error);
      // SECURITY: Fail closed - silently drop typing indicators on error
      return { allowed: false, remaining: 0 };
    }
  }
}

export default ChatRateLimiter;
