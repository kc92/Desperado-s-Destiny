/**
 * JWT Utilities - Token Generation and Verification
 *
 * Helper functions for JWT token management
 */

import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { TokenPayload } from '@desperados/shared';
import { config } from '../config';
import logger from './logger';

/**
 * JWT token generation options
 */
interface TokenOptions {
  expiresIn?: string;
}

/**
 * Generate a JWT token
 */
export function generateToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options?: TokenOptions
): string {
  const expiresIn = options?.expiresIn || config.jwt.expire;

  try {
    const token = jwt.sign(
      payload,
      config.jwt.secret,
      { expiresIn }
    );

    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      logger.error('Error verifying JWT token:', error);
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Extract token from cookie
 */
export function extractTokenFromCookie(req: Request): string | null {
  // Check if cookies exist and if the token cookie is present
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Extract token from Authorization header (Bearer token)
 */
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Extract token from request (checks cookie first, then header)
 */
export function extractToken(req: Request): string | null {
  // Try cookie first (preferred method)
  const cookieToken = extractTokenFromCookie(req);
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback to Authorization header
  const headerToken = extractTokenFromHeader(req);
  if (headerToken) {
    return headerToken;
  }

  return null;
}

/**
 * Decode token without verification (useful for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Check if token is expired without throwing error
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}

export default {
  generateToken,
  verifyToken,
  extractTokenFromCookie,
  extractTokenFromHeader,
  extractToken,
  decodeToken,
  isTokenExpired
};
