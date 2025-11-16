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

/**
 * Extended Request interface with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: SafeUser & { _id: string };
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

    if (!token) {
      throw new AppError(
        'Authentication required. Please log in.',
        HttpStatus.UNAUTHORIZED
      );
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

    // Find full user to check role
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'admin') {
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

export default {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireEmailVerified
};
