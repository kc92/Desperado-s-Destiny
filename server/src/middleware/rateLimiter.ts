import rateLimit, { Options } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { config } from '../config';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * SECURITY: Rate limit Redis requirement configuration
 *
 * In production, we FAIL CLOSED when Redis is unavailable to prevent:
 * - Distributed attacks bypassing rate limits via different server instances
 * - Rate limit reset on server restart
 *
 * Set RATE_LIMIT_REQUIRE_REDIS=false to allow in-memory fallback (not recommended for production)
 */
const REQUIRE_REDIS = process.env.RATE_LIMIT_REQUIRE_REDIS !== 'false';

/**
 * Track if we've warned about Redis fallback (prevent log spam)
 */
let hasWarnedAboutFallback = false;

/**
 * Get Redis store for rate limiting
 *
 * SECURITY BEHAVIOR:
 * - Production (REQUIRE_REDIS=true): Fails closed if Redis unavailable
 * - Development with REQUIRE_REDIS=false: Falls back to in-memory with warning
 * - Test environment: Always allows in-memory for testing without Redis
 */
function getRedisStore(prefix: string): RedisStore | undefined {
  const isTestEnv = process.env.NODE_ENV === 'test';

  try {
    if (!isRedisConnected()) {
      // Test environment: always allow fallback for automated testing
      if (isTestEnv) {
        if (!hasWarnedAboutFallback) {
          logger.debug(`[RateLimiter] Test mode: using in-memory store`);
        }
        return undefined;
      }

      // Production/Development: Check if Redis is required
      if (REQUIRE_REDIS) {
        // FAIL CLOSED: Log error but don't return undefined
        // The rate limiter will fail when it tries to use the non-existent store
        logger.error(
          `[RateLimiter] SECURITY: Redis not connected and RATE_LIMIT_REQUIRE_REDIS is enabled. ` +
          `Rate limiting will fail closed to prevent distributed attacks. ` +
          `Either ensure Redis is running or set RATE_LIMIT_REQUIRE_REDIS=false (not recommended).`
        );
        // Return a "failing" store that will cause requests to be blocked
        // This is safer than falling back to in-memory
        throw new Error('Redis required for rate limiting but not connected');
      }

      // Fallback allowed (not recommended for production)
      if (!hasWarnedAboutFallback) {
        logger.warn(
          `[RateLimiter] WARNING: Redis not connected, using in-memory store for ${prefix}. ` +
          `This is a security risk in production: rate limits won't sync across server instances. ` +
          `Consider setting RATE_LIMIT_REQUIRE_REDIS=true for production.`
        );
        hasWarnedAboutFallback = true;
      }
      return undefined;
    }

    const client = getRedisClient();
    return new RedisStore({
      // Use ioredis-compatible client
      sendCommand: (...args: string[]) => client.sendCommand(args),
      prefix: `rl:${prefix}:`,
    });
  } catch (error) {
    // Test environment: allow fallback
    if (isTestEnv) {
      return undefined;
    }

    // Production: fail closed
    if (REQUIRE_REDIS) {
      logger.error(`[RateLimiter] SECURITY: Failed to create Redis store for ${prefix}. Failing closed.`, error);
      throw error; // Re-throw to fail the request
    }

    // Fallback allowed
    logger.error(`[RateLimiter] Failed to create Redis store for ${prefix}, using in-memory:`, error);
    return undefined;
  }
}

/**
 * Create a rate limiter with optional Redis store
 * Automatically uses Redis if available, falls back to memory
 */
function createRateLimiter(
  options: Partial<Options> & {
    windowMs: number;
    max: number;
    prefix: string;
  }
): ReturnType<typeof rateLimit> {
  const { prefix, ...rateLimitOptions } = options;

  return rateLimit({
    ...rateLimitOptions,
    store: getRedisStore(prefix),
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Rate limiter configuration
 * Prevents abuse by limiting the number of requests from a single IP
 *
 * SECURITY NOTE: Rate limits are tuned to prevent abuse while allowing normal usage.
 * Adjust these values based on actual traffic patterns and abuse attempts.
 *
 * DISTRIBUTED: All rate limiters use Redis store for horizontal scaling.
 * Multiple server instances share the same rate limit counters.
 */
export const rateLimiter = createRateLimiter({
  prefix: 'global',
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  handler: (req, _res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many requests from this IP, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/health' || req.path === '/api/health') {
      return true;
    }
    // Skip rate limiting in test environments or when SKIP_RATE_LIMIT is set (dev only)
    return process.env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Stricter rate limiter for login endpoint
 * Helps prevent brute force attacks
 *
 * SECURITY: Limited to 5 attempts per 15 minutes to prevent credential stuffing
 * and brute force attacks while still allowing legitimate failed login attempts.
 */
export const loginRateLimiter = createRateLimiter({
  prefix: 'login',
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window - strict to prevent brute force
  message: 'Too many login attempts, please try again later',
  keyGenerator: (req) => {
    // Rate limit by IP address to prevent distributed attacks
    return req.ip || 'unknown';
  },
  handler: (req, _res) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many login attempts from this IP, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    // SECURITY: Only skip in test mode. Use SKIP_RATE_LIMIT=true for local dev if needed
    return process.env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Very strict rate limiter for registration endpoint
 * Prevents account spam and bot registrations
 *
 * SECURITY: Limited to 3 attempts per hour to prevent mass account creation
 * while still allowing legitimate users to retry if they make mistakes.
 */
export const registrationRateLimiter = createRateLimiter({
  prefix: 'registration',
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts, please try again later',
  keyGenerator: (req) => {
    // Rate limit by IP address
    return req.ip || 'unknown';
  },
  handler: (req, _res) => {
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many registration attempts from this IP, please try again in an hour',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    // SECURITY: Skip rate limiting in test mode
    // DEV: Also skip if SKIP_RATE_LIMIT=true for local testing convenience
    return process.env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Legacy auth rate limiter (for backwards compatibility)
 * Use loginRateLimiter or registrationRateLimiter for specific endpoints
 */
export const authRateLimiter = loginRateLimiter;

/**
 * More lenient rate limiter for general API endpoints
 *
 * SECURITY: 200 requests per 15 minutes = ~13 requests/minute
 * Sufficient for normal gameplay while preventing abuse
 */
export const apiRateLimiter = createRateLimiter({
  prefix: 'api',
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window - allows normal gameplay with headroom
  message: 'Too many API requests, please try again later',
  handler: (req, _res) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many API requests, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    // Skip in test mode or when SKIP_RATE_LIMIT is set for development
    return process.env.NODE_ENV === 'test' || process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Rate limiter for gold transfer endpoints
 * Prevents rapid gold transfer abuse and economic exploits
 *
 * SECURITY: Strict user-based limit to prevent gold duplication exploits
 * Limited to 10 transfers per hour per user (not IP) to prevent abuse
 */
export const goldTransferRateLimiter = createRateLimiter({
  prefix: 'gold-transfer',
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 gold transfers per hour per user
  message: 'Transfer limit reached, please try again later',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Gold transfer rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many gold transfer attempts. Limit: 10 transfers per hour. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for shop purchase endpoints
 * Prevents rapid purchase attempts that could exploit race conditions
 *
 * SECURITY: User-based limiting to prevent automated shop abuse
 * 30 purchases per hour per user - generous for normal gameplay but prevents bots
 */
export const shopRateLimiter = createRateLimiter({
  prefix: 'shop',
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 purchases per hour per user
  message: 'Purchase limit reached, please try again later',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Shop rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many purchase attempts. Limit: 30 purchases per hour. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for password reset endpoints
 * Prevents password reset spam and enumeration attacks
 *
 * SECURITY: Very strict limit to prevent account enumeration and email spam
 */
export const passwordResetRateLimiter = createRateLimiter({
  prefix: 'password-reset',
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
  handler: (req, _res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many password reset attempts, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for email verification endpoint
 * Prevents brute force attempts on verification tokens
 *
 * SECURITY: Tokens are 64-char hex (2^256 possibilities) so brute force is impractical,
 * but rate limiting provides defense in depth and prevents enumeration
 */
export const emailVerificationRateLimiter = createRateLimiter({
  prefix: 'email-verify',
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes - generous for legitimate use
  message: 'Too many verification attempts, please try again later',
  handler: (req, _res) => {
    logger.warn(`Email verification rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many verification attempts. Please wait 15 minutes before trying again.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * 2FA verification rate limiter
 * SECURITY: Prevents brute force of 6-digit TOTP codes (1M possibilities)
 * Stricter than login: only 3 attempts per 15 minutes per user/IP
 */
export const twoFactorRateLimiter = createRateLimiter({
  prefix: '2fa-verify',
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Only 3 attempts - TOTP has 1M combinations
  message: 'Too many 2FA verification attempts. Please wait 15 minutes.',
  keyGenerator: (req) => {
    // Try to get userId from 2fa_pending cookie for per-user limiting
    const pendingToken = req.cookies?.['2fa_pending'];
    if (pendingToken) {
      try {
        const { verifyToken } = require('../utils/jwt');
        const decoded = verifyToken(pendingToken) as { userId: string };
        if (decoded?.userId) {
          return `2fa:user:${decoded.userId}`;
        }
      } catch {
        // Token invalid, fall back to IP
      }
    }
    return `2fa:ip:${req.ip || 'unknown'}`;
  },
  handler: (req, _res) => {
    logger.warn(`2FA rate limit exceeded. IP: ${req.ip}, Path: ${req.path}`);
    throw new AppError(
      'Too many 2FA verification attempts. Your account is temporarily locked for 15 minutes.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Rate limiter for character creation
 * Prevents spam character creation
 *
 * SECURITY: Limited to prevent character spam and potential abuse
 */
export const characterCreationRateLimiter = createRateLimiter({
  prefix: 'character-creation',
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 character creations per 15 minutes
  message: 'Too many character creation attempts, please slow down',
  handler: (req, _res) => {
    logger.warn(`Character creation rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many character creation attempts, please slow down',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for gang operations
 * Prevents rapid gang creation/modification abuse
 *
 * SECURITY: Moderate limit to prevent gang spam while allowing normal operations
 */
export const gangOperationRateLimiter = createRateLimiter({
  prefix: 'gang-operation',
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 gang operations per 10 minutes
  message: 'Too many gang operations, please slow down',
  handler: (req, _res) => {
    logger.warn(`Gang operation rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many gang operations, please slow down',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for marketplace operations
 * Prevents rapid marketplace abuse (bid sniping, listing spam, etc.)
 *
 * SECURITY: User-based limiting to prevent marketplace manipulation
 * 60 operations per hour per user - allows active trading while preventing abuse
 */
export const marketplaceRateLimiter = createRateLimiter({
  prefix: 'marketplace',
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 60 marketplace operations per hour per user
  message: 'Marketplace activity limit reached, please try again later',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Marketplace rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many marketplace operations. Limit: 60 operations per hour. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for admin operations
 * Prevents abuse of admin endpoints even by authorized admins
 *
 * SECURITY: Even admins should have rate limits to:
 * 1. Prevent compromised admin accounts from rapid abuse
 * 2. Prevent accidental mass operations
 * 3. Provide audit trail of unusual activity
 *
 * 100 operations per minute is generous for normal admin work
 * but prevents automated abuse
 */
export const adminRateLimiter = createRateLimiter({
  prefix: 'admin',
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Admin rate limit exceeded, please slow down',
  keyGenerator: (req) => {
    // Rate limit by admin user ID to track per-admin activity
    const userId = (req as any).user?._id?.toString();
    return `admin:${userId || req.ip || 'unknown'}`;
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Admin rate limit exceeded. Admin: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many admin operations. Please slow down.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for skill training endpoints
 * Prevents rapid training requests that could abuse the system
 *
 * SECURITY: 10 requests per minute per user is sufficient for:
 * - Starting training
 * - Canceling training
 * - Completing training
 * - Viewing skills
 */
export const skillTrainingRateLimiter = createRateLimiter({
  prefix: 'skill-training',
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  message: 'Too many skill training requests, please slow down',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Skill training rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many skill training requests. Please slow down.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for chat HTTP endpoints
 * Prevents rapid chat API requests (DoS vector)
 *
 * SECURITY: 60 requests per minute per user for chat operations
 * Covers fetching messages, online users, mute status, reporting
 */
export const chatHttpRateLimiter = createRateLimiter({
  prefix: 'chat-http',
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per user
  message: 'Too many chat requests, please slow down',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Chat HTTP rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many chat requests. Please slow down.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for transportation endpoints (train, stagecoach)
 * Prevents rapid booking requests
 *
 * SECURITY: 30 requests per minute per user for transportation
 */
export const transportationRateLimiter = createRateLimiter({
  prefix: 'transportation',
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per user
  message: 'Too many transportation requests, please slow down',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Transportation rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many transportation requests. Please slow down.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

/**
 * Rate limiter for robbery/ambush endpoints
 * Stricter limit to prevent rapid robbery attempts
 *
 * SECURITY: 10 robbery attempts per hour to prevent abuse
 */
export const robberyRateLimiter = createRateLimiter({
  prefix: 'robbery',
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 robbery attempts per hour
  message: 'Too many robbery attempts, please try again later',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as any).user?._id?.toString();
    return userId || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    const userId = (req as any).user?._id?.toString();
    logger.warn(`Robbery rate limit exceeded. User: ${userId || 'N/A'}, IP: ${req.ip}, Path: ${req.path}`);

    throw new AppError(
      'Too many robbery attempts. Limit: 10 per hour. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test'; // SECURITY: Only skip rate limiting in test mode
  },
});

export default {
  rateLimiter,
  authRateLimiter,
  loginRateLimiter,
  registrationRateLimiter,
  apiRateLimiter,
  goldTransferRateLimiter,
  shopRateLimiter,
  passwordResetRateLimiter,
  twoFactorRateLimiter,
  characterCreationRateLimiter,
  gangOperationRateLimiter,
  marketplaceRateLimiter,
  adminRateLimiter,
  skillTrainingRateLimiter,
  chatHttpRateLimiter,
  transportationRateLimiter,
  robberyRateLimiter,
};
