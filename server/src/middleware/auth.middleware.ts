/**
 * Authentication Middleware
 *
 * Middleware to protect routes and verify user authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, HttpStatus } from '../types';
import { extractToken, verifyToken } from '../utils/jwt';
import { User } from '../models/User.model';
import logger from '../utils/logger';
import { SafeUser } from '@desperados/shared';
import { TokenManagementService } from '../services/tokenManagement.service';
import { config } from '../config';

/**
 * Extended Request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: SafeUser & { _id: string; characterId?: string };
}

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from cookie or header
    const token = extractToken(req);

    // DIAGNOSTIC LOGGING FOR E2E TEST DEBUGGING
    logger.debug('[AUTH MIDDLEWARE]', {
      path: req.path,
      method: req.method,
      hasCookies: !!req.cookies,
      cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
      hasTokenCookie: !!(req.cookies && req.cookies.token),
      tokenExtracted: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      authHeader: req.headers.authorization ? 'present' : 'absent'
    });

    if (!token) {
      logger.debug('[AUTH MIDDLEWARE] No token found', {
        path: req.path,
        cookies: req.cookies,
        headers: { authorization: req.headers.authorization }
      });
      throw new AppError(
        'Authentication required. Please log in.',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Check if token is blacklisted (user logged out)
    try {
      const isBlacklisted = await TokenManagementService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        logger.warn('[AUTH MIDDLEWARE] Blocked blacklisted token', { path: req.path });
        throw new AppError(
          'Session has expired. Please log in again.',
          HttpStatus.UNAUTHORIZED
        );
      }
    } catch (blacklistError) {
      // If it's an AppError (e.g., token was blacklisted), always propagate it
      if (blacklistError instanceof AppError) {
        throw blacklistError;
      }

      // For infrastructure errors (e.g., Redis down):
      // SECURITY: ALWAYS fail closed - reject request when auth services are unavailable
      // The only exception is if ALLOW_AUTH_FAIL_OPEN=true AND NODE_ENV=test
      // This requires BOTH conditions to prevent accidental fail-open in any environment
      const allowFailOpen = process.env.ALLOW_AUTH_FAIL_OPEN === 'true' && process.env.NODE_ENV === 'test';

      if (allowFailOpen) {
        logger.warn('[AUTH MIDDLEWARE] Blacklist check failed - FAIL OPEN enabled for testing:', blacklistError);
      } else {
        logger.error('[AUTH MIDDLEWARE] Blacklist check failed - failing closed:', blacklistError);
        throw new AppError(
          'Authentication service temporarily unavailable. Please try again.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      throw new AppError(
        message,
        HttpStatus.UNAUTHORIZED
      );
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError(
        'User not found. Please log in again.',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(
        'Account is inactive. Please contact support.',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Attach safe user object to request (without password)
    req.user = user.toSafeObject();

    // Continue to next middleware
    next();
  } catch (error) {
    // If it's already an AppError, pass it along
    if (error instanceof AppError) {
      next(error);
    } else {
      // Log unexpected errors
      logger.error('Authentication middleware error:', error);
      next(new AppError(
        'Authentication failed',
        HttpStatus.UNAUTHORIZED
      ));
    }
  }
}

/**
 * Middleware to optionally authenticate
 * Attaches user to request if token is valid, but doesn't fail if not
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      // No token, but that's okay for optional auth
      return next();
    }

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user.toSafeObject();
      }
    } catch (error) {
      // Token invalid or expired, but that's okay for optional auth
      logger.debug('Optional auth token verification failed:', error);
    }

    next();
  } catch (error) {
    // Even if something goes wrong, don't fail the request
    logger.error('Optional auth middleware error:', error);
    next();
  }
}

/**
 * Middleware to require admin role
 * Must be used AFTER requireAuth
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Check role from SafeUser (no DB query needed)
    if (req.user.role !== 'admin') {
      throw new AppError(
        'Admin access required',
        HttpStatus.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Admin auth middleware error:', error);
      next(new AppError(
        'Authorization failed',
        HttpStatus.FORBIDDEN
      ));
    }
  }
}

/**
 * Middleware to check if user's email is verified
 * Must be used AFTER requireAuth
 */
export async function requireEmailVerified(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    if (!req.user.emailVerified) {
      throw new AppError(
        'Email verification required. Please verify your email address.',
        HttpStatus.FORBIDDEN
      );
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Email verification middleware error:', error);
      next(new AppError(
        'Email verification check failed',
        HttpStatus.FORBIDDEN
      ));
    }
  }
}

/**
 * Alias for requireAuth for backwards compatibility
 */
export const authenticate = requireAuth;

/**
 * Extended Request interface with character
 */
export interface CharacterRequest extends AuthenticatedRequest {
  character?: any;
}

/**
 * Middleware to require character context
 * Gets the user's active character and attaches it to request
 * Must be used AFTER requireAuth/authenticate
 */
export async function requireCharacter(
  req: CharacterRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Import Character model and Types here to avoid circular dependency
    const { Character } = await import('../models/Character.model');
    const mongoose = await import('mongoose');

    // Find user's active character
    const characters = await Character.find({
      userId: new mongoose.Types.ObjectId(req.user._id),
      isActive: true
    }).sort({ lastActive: -1 }).limit(1);

    if (!characters || characters.length === 0) {
      // More lenient: if no character found, just get the most recent character for this user
      const anyCharacter = await Character.find({
        userId: new mongoose.Types.ObjectId(req.user._id)
      }).sort({ lastActive: -1 }).limit(1);

      if (!anyCharacter || anyCharacter.length === 0) {
        throw new AppError(
          'No character found. Please create a character first.',
          HttpStatus.NOT_FOUND
        );
      }

      req.character = anyCharacter[0];
      (req as any).characterId = anyCharacter[0]._id.toString();
    } else {
      req.character = characters[0];
      (req as any).characterId = characters[0]._id.toString();
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Require character middleware error:', error);
      next(new AppError(
        'Failed to load character',
        HttpStatus.INTERNAL_SERVER_ERROR
      ));
    }
  }
}

/**
 * Type alias for backward compatibility with deprecated requireAuth.ts
 * @deprecated Use AuthenticatedRequest instead
 */
export type AuthRequest = AuthenticatedRequest;

export default {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireEmailVerified,
  authenticate,
  requireCharacter
};
