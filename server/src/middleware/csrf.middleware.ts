/**
 * CSRF Protection Middleware
 *
 * Implements token-based CSRF protection for state-changing operations
 * Features:
 * - Token rotation for sensitive operations
 * - Configurable token expiry (1 hour default)
 * - User binding to prevent token theft
 * - Redis-backed storage for horizontal scaling (with in-memory fallback)
 */

import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { AppError, HttpStatus } from '../types';
import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from '../utils/logger';

/**
 * CSRF token configuration
 */
const CSRF_EXPIRY_MS = 60 * 60 * 1000; // 1 hour (more secure than 24 hours)
const CSRF_EXPIRY_SECONDS = CSRF_EXPIRY_MS / 1000; // For Redis TTL
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run cleanup every 5 minutes
const REDIS_PREFIX = 'csrf:'; // Prefix for Redis keys

/**
 * CSRF token interface with enhanced security metadata
 */
interface CSRFToken {
  token: string;
  createdAt: number;
  userId: string;
  lastUsed?: number;
  useCount: number;
}

/**
 * Enhanced CSRF Manager with Redis-backed storage for horizontal scaling
 * Falls back to in-memory storage when Redis is not available
 */
class CSRFManager {
  // In-memory fallback maps (used when Redis is unavailable)
  private memoryTokens: Map<string, CSRFToken> = new Map();
  private memoryUserTokens: Map<string, string> = new Map();
  private lastCleanup: number = Date.now();

  /**
   * Check if we should use Redis or fallback to memory
   */
  private useRedis(): boolean {
    return isRedisConnected();
  }

  /**
   * Get Redis key for token lookup
   */
  private getTokenKey(token: string): string {
    return `${REDIS_PREFIX}token:${token}`;
  }

  /**
   * Get Redis key for user -> token mapping
   */
  private getUserTokenKey(userId: string): string {
    return `${REDIS_PREFIX}user:${userId}`;
  }

  /**
   * Generate a new CSRF token for a user
   * @param userId - User ID to bind token to
   * @returns Generated token string
   */
  async generateAsync(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenData: CSRFToken = {
      token,
      createdAt: Date.now(),
      userId,
      useCount: 0,
    };

    if (this.useRedis()) {
      try {
        const redis = getRedisClient();

        // Get and delete existing token for this user
        const existingToken = await redis.get(this.getUserTokenKey(userId));
        if (existingToken) {
          await redis.del(this.getTokenKey(existingToken));
        }

        // Store new token with TTL
        await redis.setEx(
          this.getTokenKey(token),
          CSRF_EXPIRY_SECONDS,
          JSON.stringify(tokenData)
        );

        // Store user -> token mapping with TTL
        await redis.setEx(
          this.getUserTokenKey(userId),
          CSRF_EXPIRY_SECONDS,
          token
        );

        logger.debug(`CSRF token generated for user ${userId} (Redis)`);
        return token;
      } catch (error) {
        logger.error('Redis CSRF error, falling back to memory:', error);
        // Fall through to memory storage
      }
    }

    // Memory fallback
    const existingToken = this.memoryUserTokens.get(userId);
    if (existingToken) {
      this.memoryTokens.delete(existingToken);
    }

    this.memoryTokens.set(token, tokenData);
    this.memoryUserTokens.set(userId, token);
    this.cleanup();

    logger.debug(`CSRF token generated for user ${userId} (memory)`);
    return token;
  }

  /**
   * Synchronous wrapper for backwards compatibility
   */
  generate(userId: string): string {
    // For backwards compatibility, use sync memory storage
    // Async Redis version should be preferred
    const token = crypto.randomBytes(32).toString('hex');
    const tokenData: CSRFToken = {
      token,
      createdAt: Date.now(),
      userId,
      useCount: 0,
    };

    const existingToken = this.memoryUserTokens.get(userId);
    if (existingToken) {
      this.memoryTokens.delete(existingToken);
    }

    this.memoryTokens.set(token, tokenData);
    this.memoryUserTokens.set(userId, token);
    this.cleanup();

    // Also store in Redis asynchronously if available
    if (this.useRedis()) {
      this.storeInRedisAsync(token, tokenData, userId).catch(err => {
        logger.error('Failed to store CSRF in Redis:', err);
      });
    }

    logger.debug(`CSRF token generated for user ${userId}`);
    return token;
  }

  /**
   * Store token in Redis asynchronously
   */
  private async storeInRedisAsync(token: string, tokenData: CSRFToken, userId: string): Promise<void> {
    const redis = getRedisClient();

    // Delete existing token for user if any
    const existingToken = await redis.get(this.getUserTokenKey(userId));
    if (existingToken) {
      await redis.del(this.getTokenKey(existingToken));
    }

    await redis.setEx(
      this.getTokenKey(token),
      CSRF_EXPIRY_SECONDS,
      JSON.stringify(tokenData)
    );
    await redis.setEx(
      this.getUserTokenKey(userId),
      CSRF_EXPIRY_SECONDS,
      token
    );
  }

  /**
   * Validate a CSRF token
   * @param token - Token to validate
   * @param userId - User ID to verify binding
   * @returns True if token is valid
   */
  async validateAsync(token: string, userId: string): Promise<boolean> {
    if (this.useRedis()) {
      try {
        const redis = getRedisClient();
        const stored = await redis.get(this.getTokenKey(token));

        if (!stored) {
          // Check memory fallback
          return this.validateFromMemory(token, userId);
        }

        const tokenData: CSRFToken = JSON.parse(stored);

        // Check expiry (Redis TTL handles this, but double-check)
        if (Date.now() - tokenData.createdAt > CSRF_EXPIRY_MS) {
          await redis.del(this.getTokenKey(token));
          await redis.del(this.getUserTokenKey(userId));
          return false;
        }

        // Check user binding
        if (tokenData.userId !== userId) {
          logger.warn(`CSRF token user mismatch. Expected: ${tokenData.userId}, Got: ${userId}`);
          return false;
        }

        // Update usage tracking
        tokenData.lastUsed = Date.now();
        tokenData.useCount += 1;
        await redis.setEx(
          this.getTokenKey(token),
          CSRF_EXPIRY_SECONDS,
          JSON.stringify(tokenData)
        );

        return true;
      } catch (error) {
        logger.error('Redis CSRF validation error, checking memory:', error);
        return this.validateFromMemory(token, userId);
      }
    }

    return this.validateFromMemory(token, userId);
  }

  /**
   * Validate from memory storage
   */
  private validateFromMemory(token: string, userId: string): boolean {
    const stored = this.memoryTokens.get(token);

    if (!stored) {
      logger.warn(`CSRF token not found in store: ${token.substring(0, 8)}...`);
      return false;
    }

    if (Date.now() - stored.createdAt > CSRF_EXPIRY_MS) {
      logger.warn(`CSRF token expired for user ${userId}`);
      this.memoryTokens.delete(token);
      this.memoryUserTokens.delete(userId);
      return false;
    }

    if (stored.userId !== userId) {
      logger.warn(`CSRF token user mismatch. Expected: ${stored.userId}, Got: ${userId}`);
      return false;
    }

    stored.lastUsed = Date.now();
    stored.useCount += 1;

    return true;
  }

  /**
   * Synchronous wrapper for backwards compatibility
   */
  validate(token: string, userId: string): boolean {
    // Check memory first (sync)
    const memoryValid = this.validateFromMemory(token, userId);
    if (memoryValid) return true;

    // If Redis is available, the async check should be used
    // For sync compatibility, return memory result
    return false;
  }

  /**
   * Rotate a CSRF token (generate new, delete old)
   */
  async rotateAsync(oldToken: string, userId: string): Promise<string> {
    const isValid = await this.validateAsync(oldToken, userId);
    if (!isValid) {
      throw new AppError('Invalid CSRF token for rotation', HttpStatus.FORBIDDEN);
    }

    await this.invalidateAsync(oldToken);
    return this.generateAsync(userId);
  }

  /**
   * Synchronous rotate wrapper
   */
  rotate(oldToken: string, userId: string): string {
    if (!this.validate(oldToken, userId)) {
      throw new AppError('Invalid CSRF token for rotation', HttpStatus.FORBIDDEN);
    }

    this.memoryTokens.delete(oldToken);
    this.memoryUserTokens.delete(userId);

    // Also invalidate in Redis asynchronously
    if (this.useRedis()) {
      this.invalidateInRedisAsync(oldToken, userId).catch(err => {
        logger.error('Failed to invalidate CSRF in Redis:', err);
      });
    }

    return this.generate(userId);
  }

  /**
   * Invalidate token in Redis
   */
  private async invalidateInRedisAsync(token: string, userId: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(this.getTokenKey(token));
    await redis.del(this.getUserTokenKey(userId));
  }

  /**
   * Invalidate a specific token
   */
  async invalidateAsync(token: string): Promise<void> {
    if (this.useRedis()) {
      try {
        const redis = getRedisClient();
        const stored = await redis.get(this.getTokenKey(token));
        if (stored) {
          const tokenData: CSRFToken = JSON.parse(stored);
          await redis.del(this.getTokenKey(token));
          await redis.del(this.getUserTokenKey(tokenData.userId));
        }
      } catch (error) {
        logger.error('Redis CSRF invalidation error:', error);
      }
    }

    // Also invalidate from memory
    const stored = this.memoryTokens.get(token);
    if (stored) {
      this.memoryUserTokens.delete(stored.userId);
      this.memoryTokens.delete(token);
    }
  }

  /**
   * Synchronous invalidate wrapper
   */
  invalidate(token: string): void {
    const stored = this.memoryTokens.get(token);
    if (stored) {
      this.memoryUserTokens.delete(stored.userId);
      this.memoryTokens.delete(token);
    }

    // Also invalidate in Redis asynchronously
    if (this.useRedis()) {
      this.invalidateAsync(token).catch(err => {
        logger.error('Failed to invalidate CSRF in Redis:', err);
      });
    }

    logger.debug(`CSRF token invalidated: ${token.substring(0, 8)}...`);
  }

  /**
   * Invalidate all tokens for a user
   */
  async invalidateUserAsync(userId: string): Promise<void> {
    if (this.useRedis()) {
      try {
        const redis = getRedisClient();
        const token = await redis.get(this.getUserTokenKey(userId));
        if (token) {
          await redis.del(this.getTokenKey(token));
          await redis.del(this.getUserTokenKey(userId));
        }
      } catch (error) {
        logger.error('Redis CSRF user invalidation error:', error);
      }
    }

    // Also invalidate from memory
    const token = this.memoryUserTokens.get(userId);
    if (token) {
      this.memoryTokens.delete(token);
      this.memoryUserTokens.delete(userId);
    }
  }

  /**
   * Synchronous user invalidation wrapper
   */
  invalidateUser(userId: string): void {
    const token = this.memoryUserTokens.get(userId);
    if (token) {
      this.memoryTokens.delete(token);
      this.memoryUserTokens.delete(userId);
    }

    // Also invalidate in Redis asynchronously
    if (this.useRedis()) {
      this.invalidateUserAsync(userId).catch(err => {
        logger.error('Failed to invalidate user CSRF in Redis:', err);
      });
    }

    logger.debug(`All CSRF tokens invalidated for user ${userId}`);
  }

  /**
   * Cleanup expired tokens from memory
   * Note: Redis handles its own TTL-based cleanup
   */
  cleanup(): void {
    const now = Date.now();

    if (now - this.lastCleanup < CLEANUP_INTERVAL_MS) {
      return;
    }

    let removed = 0;
    const tokensArray = Array.from(this.memoryTokens.entries());
    for (const [token, data] of tokensArray) {
      if (now - data.createdAt > CSRF_EXPIRY_MS) {
        this.memoryTokens.delete(token);
        this.memoryUserTokens.delete(data.userId);
        removed++;
      }
    }

    this.lastCleanup = now;

    if (removed > 0) {
      logger.debug(`CSRF cleanup: removed ${removed} expired tokens from memory`);
    }
  }

  /**
   * Get token statistics (for monitoring)
   */
  getStats(): { totalTokens: number; totalUsers: number; storageType: string } {
    return {
      totalTokens: this.memoryTokens.size,
      totalUsers: this.memoryUserTokens.size,
      storageType: this.useRedis() ? 'redis+memory' : 'memory',
    };
  }
}

/**
 * Global CSRF manager instance
 * Uses Redis for distributed storage when available, with in-memory fallback
 */
const csrfManager = new CSRFManager();

/**
 * Generate CSRF token (legacy wrapper for backwards compatibility)
 */
export function generateCsrfToken(userId: string): string {
  return csrfManager.generate(userId);
}

/**
 * Verify CSRF token (legacy wrapper for backwards compatibility)
 */
export function verifyCsrfToken(userId: string, token: string): boolean {
  return csrfManager.validate(token, userId);
}

/**
 * Rotate CSRF token for sensitive operations
 * @param oldToken - Current token to rotate
 * @param userId - User ID
 * @returns New token
 */
export function rotateCsrfToken(oldToken: string, userId: string): string {
  return csrfManager.rotate(oldToken, userId);
}

/**
 * Invalidate CSRF token(s)
 * @param userId - User ID to invalidate tokens for
 */
export function invalidateCsrfToken(userId: string): void {
  csrfManager.invalidateUser(userId);
}

/**
 * Cleanup expired tokens (can be called manually)
 */
function cleanupExpiredTokens(): void {
  csrfManager.cleanup();
}

/**
 * Middleware to require CSRF token for state-changing requests
 * Enhanced with better logging and user binding validation
 * Uses async validation to check both memory and Redis
 *
 * NOTE: This is an async middleware that properly awaits validation
 */
export async function requireCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Allow skipping in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Only check on state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Extract user ID (requires auth middleware to run first)
  const userId = (req as any).user?._id?.toString();

  if (!userId) {
    // If no user, let auth middleware handle it
    return next();
  }

  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;

  if (!token) {
    logger.warn(`CSRF token missing for user ${userId} on ${req.method} ${req.path}`);
    return next(new AppError('CSRF token required', HttpStatus.FORBIDDEN));
  }

  try {
    // Use async validation with timeout to prevent hanging
    const validationTimeout = 15000; // 15 second timeout (increased for Railway latency)
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('CSRF validation timeout')), validationTimeout);
    });

    const isValid = await Promise.race([
      csrfManager.validateAsync(token, userId),
      timeoutPromise
    ]);

    if (!isValid) {
      logger.warn(`Invalid CSRF token for user ${userId} on ${req.method} ${req.path}`);
      return next(new AppError('Invalid or expired CSRF token', HttpStatus.FORBIDDEN));
    }

    next();
  } catch (error) {
    logger.error(`CSRF validation error for user ${userId}:`, error);
    return next(new AppError('CSRF validation failed', HttpStatus.INTERNAL_SERVER_ERROR));
  }
}

/**
 * Middleware to require CSRF token AND rotate it after use
 * Use for sensitive operations like password changes, gold transfers, etc.
 * Uses async validation to check both memory and Redis
 *
 * NOTE: This is an async middleware that properly awaits validation
 */
export async function requireCsrfTokenWithRotation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Allow skipping in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Only check on state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Extract user ID (requires auth middleware to run first)
  const userId = (req as any).user?._id?.toString();

  if (!userId) {
    // If no user, let auth middleware handle it
    return next();
  }

  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;

  if (!token) {
    logger.warn(`CSRF token missing for sensitive operation: user ${userId} on ${req.method} ${req.path}`);
    return next(new AppError('CSRF token required', HttpStatus.FORBIDDEN));
  }

  try {
    // Use async rotation with timeout to prevent hanging
    const rotationTimeout = 15000; // 15 second timeout (increased for Railway latency)
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('CSRF rotation timeout')), rotationTimeout);
    });

    const newToken = await Promise.race([
      csrfManager.rotateAsync(token, userId),
      timeoutPromise
    ]);

    // Attach new token to response header for client to update
    res.setHeader('X-CSRF-Token', newToken);
    logger.debug(`CSRF token rotated for sensitive operation: user ${userId} on ${req.path}`);
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    logger.error(`CSRF token rotation failed for user ${userId}:`, error);
    return next(new AppError('Invalid or expired CSRF token', HttpStatus.FORBIDDEN));
  }
}

/**
 * Optional CSRF middleware (doesn't fail if missing)
 * Used for testing/migration period
 */
export function optionalCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    requireCsrfToken(req, res, next);
  } catch (error) {
    // Log but don't fail
    if (error instanceof AppError && error.message.includes('CSRF')) {
      logger.debug('CSRF check failed (optional mode):', error.message);
    }
    next();
  }
}

/**
 * Endpoint to get a fresh CSRF token
 * Should be called after login or when token expires
 */
export function getCsrfToken(req: Request, res: Response): void {
  const userId = (req as any).user?._id?.toString();

  if (!userId) {
    throw new AppError(
      'Authentication required to get CSRF token',
      HttpStatus.UNAUTHORIZED
    );
  }

  const token = csrfManager.generate(userId);

  res.json({
    success: true,
    data: { csrfToken: token },
    message: 'CSRF token generated successfully',
  });
}

export default {
  generateCsrfToken,
  verifyCsrfToken,
  rotateCsrfToken,
  invalidateCsrfToken,
  requireCsrfToken,
  requireCsrfTokenWithRotation,
  optionalCsrfToken,
  getCsrfToken,
};
