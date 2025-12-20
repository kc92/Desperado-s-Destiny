/**
 * Check Token Blacklist Middleware
 * Verifies that access tokens haven't been blacklisted (logged out)
 * Should be applied after JWT verification middleware
 */

import { Request, Response, NextFunction } from 'express';
import { TokenManagementService } from '../services/tokenManagement.service';
import { extractToken } from '../utils/jwt';
import logger from '../utils/logger';

/**
 * Middleware to check if access token is blacklisted
 * Assumes token has already been verified by auth middleware
 */
export const checkTokenBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from cookie or Authorization header (consistent with auth middleware)
    const token = extractToken(req);

    if (!token) {
      // No token present - let auth middleware handle it
      return next();
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenManagementService.isTokenBlacklisted(token);

    if (isBlacklisted) {
      logger.warn(`Blocked blacklisted token attempt for user ${(req as any).user?.userId}`);

      res.status(401).json({
        error: 'Token has been revoked. Please log in again.',
        code: 'TOKEN_BLACKLISTED',
      });
      return;
    }

    // Token is valid and not blacklisted, continue
    next();
  } catch (error) {
    logger.error('Error checking token blacklist:', error);

    // Fail closed - reject request on error for security
    res.status(500).json({
      error: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_ERROR',
    });
  }
};
