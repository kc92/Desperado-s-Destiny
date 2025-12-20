/**
 * Friend Request Rate Limiter
 * Prevents spam by limiting friend requests to 10 per hour per user
 * Uses Redis for distributed rate limiting
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Redis client (loaded dynamically)
let redisClient: any = null;

function getRedisClient() {
  if (!redisClient) {
    try {
      const redis = require('../config/redis');
      redisClient = redis.redisClient || redis.default;
    } catch (error) {
      logger.error('Failed to load Redis client for rate limiting:', error);
      throw new Error('Redis not available');
    }
  }
  return redisClient;
}

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetAt?: Date;
  message?: string;
}

// =============================================================================
// RATE LIMITER
// =============================================================================

export class FriendRateLimiter {
  static readonly MAX_REQUESTS_PER_HOUR = 10;
  static readonly WINDOW_SECONDS = 3600; // 1 hour

  /**
   * Check if user can send a friend request
   *
   * @param userId - User ID attempting to send friend request
   * @returns Rate limit result
   */
  static async checkRateLimit(userId: string): Promise<RateLimitResult> {
    try {
      const redis = getRedisClient();
      const key = `friend:ratelimit:${userId}`;

      // Increment counter
      const count = await redis.incr(key);

      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, this.WINDOW_SECONDS);
      }

      // Check if exceeded
      if (count > this.MAX_REQUESTS_PER_HOUR) {
        const ttl = await redis.ttl(key);
        const resetAt = new Date(Date.now() + ttl * 1000);

        logger.warn(`Friend request rate limit exceeded for user ${userId}: ${count}/${this.MAX_REQUESTS_PER_HOUR}`);

        return {
          allowed: false,
          remaining: 0,
          resetAt,
          message: `Friend request limit exceeded. Try again in ${Math.ceil(ttl / 60)} minutes.`,
        };
      }

      const remaining = this.MAX_REQUESTS_PER_HOUR - count;

      return {
        allowed: true,
        remaining,
        message: `${remaining} friend request(s) remaining this hour.`,
      };
    } catch (error) {
      logger.error('Error checking friend request rate limit:', error);
      // Fail open - allow request on error to avoid blocking legitimate users
      return {
        allowed: true,
        message: 'Rate limit check unavailable.',
      };
    }
  }

  /**
   * Reset rate limit for a user (admin function)
   *
   * @param userId - User ID to reset
   */
  static async resetRateLimit(userId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `friend:ratelimit:${userId}`;
      await redis.del(key);

      logger.info(`Reset friend request rate limit for user ${userId}`);
    } catch (error) {
      logger.error('Error resetting friend request rate limit:', error);
      throw error;
    }
  }

  /**
   * Get current rate limit status for a user
   *
   * @param userId - User ID
   * @returns Current limit status
   */
  static async getStatus(userId: string): Promise<{
    requestsUsed: number;
    requestsRemaining: number;
    resetAt: Date | null;
  }> {
    try {
      const redis = getRedisClient();
      const key = `friend:ratelimit:${userId}`;

      const count = await redis.get(key);
      const ttl = await redis.ttl(key);

      if (!count || ttl < 0) {
        return {
          requestsUsed: 0,
          requestsRemaining: this.MAX_REQUESTS_PER_HOUR,
          resetAt: null,
        };
      }

      const requestsUsed = parseInt(count, 10);
      const requestsRemaining = Math.max(0, this.MAX_REQUESTS_PER_HOUR - requestsUsed);
      const resetAt = new Date(Date.now() + ttl * 1000);

      return {
        requestsUsed,
        requestsRemaining,
        resetAt,
      };
    } catch (error) {
      logger.error('Error getting friend request rate limit status:', error);
      return {
        requestsUsed: 0,
        requestsRemaining: this.MAX_REQUESTS_PER_HOUR,
        resetAt: null,
      };
    }
  }
}

// =============================================================================
// EXPRESS MIDDLEWARE
// =============================================================================

/**
 * Express middleware for friend request rate limiting
 * Apply to routes that send friend requests
 */
export const friendRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await FriendRateLimiter.checkRateLimit(userId);

    if (!result.allowed) {
      res.status(429).json({
        error: 'Too many friend requests',
        message: result.message,
        remaining: result.remaining,
        resetAt: result.resetAt,
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Remaining', result.remaining?.toString() || '0');
    if (result.resetAt) {
      res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
    }

    next();
  } catch (error) {
    // SECURITY: Fail closed - deny on error
    logger.error('Friend rate limiter error:', error);
    res.status(503).json({ error: 'Rate limiter unavailable' });
  }
};
