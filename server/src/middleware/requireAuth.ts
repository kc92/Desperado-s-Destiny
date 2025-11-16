/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches user data to requests
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Extended request interface with user data
 */
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided'
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email: string;
    };

    // Attach user to request
    req.user = {
      _id: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', error.message);
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token');
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}
