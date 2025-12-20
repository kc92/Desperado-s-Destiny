import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * Get Redis store for rate limiting if Redis is available
 * Falls back to in-memory store if Redis is not connected
 */
function getRedisStore(prefix: string): RedisStore | undefined {
  try {
    if (!isRedisConnected()) {
      logger.warn(`[RateLimiter] Redis not connected, using in-memory store for ${prefix}`);
      return undefined;
    }

    const client = getRedisClient();
    return new RedisStore({
      // Use ioredis-compatible client
      sendCommand: (...args: string[]) => client.sendCommand(args),
      prefix: `rl:${prefix}:`,
    });
  } catch (error) {
    logger.error(`[RateLimiter] Failed to create Redis store for ${prefix}:`, error);
    return undefined;
  }
}

/**
 * Rate limiter for gambling bet endpoint
 * Prevents rapid betting attempts that could exploit race conditions
 *
 * SECURITY: User-based limiting to prevent automated gambling abuse
 * 30 bets per minute per user - allows fast gameplay but prevents automated bots
 */
export const gamblingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 bets per minute max
  message: { error: 'Too many bets, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  store: getRedisStore('gambling'),
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Gambling rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many bets. Limit: 30 bets per minute. Please slow down.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});
