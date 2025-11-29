/**
 * CSRF Protection Middleware
 *
 * Implements token-based CSRF protection for state-changing operations
 * Features:
 * - Token rotation for sensitive operations
 * - Configurable token expiry (1 hour default)
 * - User binding to prevent token theft
 * - Automatic cleanup of expired tokens
 */

import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * CSRF token configuration
 */
const CSRF_EXPIRY_MS = 60 * 60 * 1000; // 1 hour (more secure than 24 hours)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run cleanup every 5 minutes

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
 * Enhanced CSRF Manager with rotation and expiry
 */
class CSRFManager {
  private tokens: Map<string, CSRFToken> = new Map();
  private userTokens: Map<string, string> = new Map(); // userId -> token mapping
  private lastCleanup: number = Date.now();

  /**
   * Generate a new CSRF token for a user
   * @param userId - User ID to bind token to
   * @returns Generated token string
   */
  generate(userId: string): string {
    // Remove any existing token for this user
    const existingToken = this.userTokens.get(userId);
    if (existingToken) {
      this.tokens.delete(existingToken);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenData: CSRFToken = {
      token,
      createdAt: Date.now(),
      userId,
      useCount: 0,
    };

    this.tokens.set(token, tokenData);
    this.userTokens.set(userId, token);

    // Periodic cleanup
    this.cleanup();

    logger.debug(`CSRF token generated for user ${userId}`);
    return token;
  }

  /**
   * Validate a CSRF token
   * @param token - Token to validate
   * @param userId - User ID to verify binding
   * @returns True if token is valid
   */
  validate(token: string, userId: string): boolean {
    const stored = this.tokens.get(token);

    if (!stored) {
      logger.warn(`CSRF token not found in store: ${token.substring(0, 8)}...`);
      return false;
    }

    // Check expiry
    if (Date.now() - stored.createdAt > CSRF_EXPIRY_MS) {
      logger.warn(`CSRF token expired for user ${userId}`);
      this.tokens.delete(token);
      this.userTokens.delete(userId);
      return false;
    }

    // Check user binding
    if (stored.userId !== userId) {
      logger.warn(`CSRF token user mismatch. Expected: ${stored.userId}, Got: ${userId}`);
      return false;
    }

    // Update usage tracking
    stored.lastUsed = Date.now();
    stored.useCount += 1;

    return true;
  }

  /**
   * Rotate a CSRF token (generate new, delete old)
   * Used for sensitive operations to prevent replay attacks
   * @param oldToken - Old token to invalidate
   * @param userId - User ID to bind new token to
   * @returns New token string
   */
  rotate(oldToken: string, userId: string): string {
    // Validate old token first
    if (!this.validate(oldToken, userId)) {
      throw new AppError('Invalid CSRF token for rotation', HttpStatus.FORBIDDEN);
    }

    // Delete old token
    this.tokens.delete(oldToken);
    this.userTokens.delete(userId);

    // Generate new token
    const newToken = this.generate(userId);
    logger.debug(`CSRF token rotated for user ${userId}`);

    return newToken;
  }

  /**
   * Invalidate a specific token
   * @param token - Token to invalidate
   */
  invalidate(token: string): void {
    const stored = this.tokens.get(token);
    if (stored) {
      this.userTokens.delete(stored.userId);
      this.tokens.delete(token);
      logger.debug(`CSRF token invalidated: ${token.substring(0, 8)}...`);
    }
  }

  /**
   * Invalidate all tokens for a user
   * @param userId - User ID to invalidate tokens for
   */
  invalidateUser(userId: string): void {
    const token = this.userTokens.get(userId);
    if (token) {
      this.tokens.delete(token);
      this.userTokens.delete(userId);
      logger.debug(`All CSRF tokens invalidated for user ${userId}`);
    }
  }

  /**
   * Cleanup expired tokens
   * Runs periodically to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();

    // Only run cleanup if enough time has passed
    if (now - this.lastCleanup < CLEANUP_INTERVAL_MS) {
      return;
    }

    let removed = 0;
    const tokensArray = Array.from(this.tokens.entries());
    for (const [token, data] of tokensArray) {
      if (now - data.createdAt > CSRF_EXPIRY_MS) {
        this.tokens.delete(token);
        this.userTokens.delete(data.userId);
        removed++;
      }
    }

    this.lastCleanup = now;

    if (removed > 0) {
      logger.debug(`CSRF cleanup: removed ${removed} expired tokens`);
    }
  }

  /**
   * Get token statistics (for monitoring)
   */
  getStats(): { totalTokens: number; totalUsers: number } {
    return {
      totalTokens: this.tokens.size,
      totalUsers: this.userTokens.size,
    };
  }
}

/**
 * Global CSRF manager instance
 * In production, replace with Redis-backed implementation
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
 */
export function requireCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
    throw new AppError(
      'CSRF token required',
      HttpStatus.FORBIDDEN
    );
  }

  if (!csrfManager.validate(token, userId)) {
    logger.warn(`Invalid CSRF token for user ${userId} on ${req.method} ${req.path}`);
    throw new AppError(
      'Invalid or expired CSRF token',
      HttpStatus.FORBIDDEN
    );
  }

  next();
}

/**
 * Middleware to require CSRF token AND rotate it after use
 * Use for sensitive operations like password changes, gold transfers, etc.
 */
export function requireCsrfTokenWithRotation(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
    throw new AppError(
      'CSRF token required',
      HttpStatus.FORBIDDEN
    );
  }

  try {
    // Validate and rotate token
    const newToken = csrfManager.rotate(token, userId);

    // Attach new token to response header for client to update
    res.setHeader('X-CSRF-Token', newToken);

    logger.debug(`CSRF token rotated for sensitive operation: user ${userId} on ${req.path}`);
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error(`CSRF token rotation failed for user ${userId}:`, error);
    throw new AppError(
      'Invalid or expired CSRF token',
      HttpStatus.FORBIDDEN
    );
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
