/**
 * JWT Utilities - Token Generation and Verification
 *
 * Helper functions for JWT token management
 * Supports key rotation via KeyRotationService
 */

import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { Request } from 'express';
import { TokenPayload } from '@desperados/shared';
import { config } from '../config';
import logger from './logger';
import { KeyRotationService } from '../services/keyRotation.service';

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
  try {
    // C3 SECURITY FIX: Explicitly enforce HS256 algorithm to prevent algorithm confusion attacks
    const expiresIn = options?.expiresIn || config.jwt.expiresIn;
    const signOptions: SignOptions = {
      algorithm: 'HS256',
      expiresIn: expiresIn as SignOptions['expiresIn']
    };
    const token = jwt.sign(payload, config.jwt.secret, signOptions);

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
    // C3 SECURITY FIX: Explicitly enforce HS256 algorithm to prevent algorithm confusion attacks
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256']
    }) as TokenPayload;
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

/**
 * Generate a JWT token with key rotation support
 * Uses the active key from KeyRotationService
 */
export async function generateTokenAsync(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  options?: TokenOptions
): Promise<string> {
  try {
    const { version, key } = await KeyRotationService.getActiveKey();
    const expiresIn = options?.expiresIn || config.jwt.expiresIn;

    // Include key version in payload for tracking
    const tokenPayload = {
      ...payload,
      kv: version, // Key version for debugging/auditing
    };

    const signOptions: SignOptions = {
      algorithm: 'HS256',
      expiresIn: expiresIn as SignOptions['expiresIn']
    };

    const token = jwt.sign(tokenPayload, key, signOptions);
    return token;
  } catch (error) {
    logger.error('Error generating JWT token with rotation:', error);
    // Fallback to synchronous method
    return generateToken(payload, options);
  }
}

/**
 * Verify and decode a JWT token with multi-key support
 * Tries all valid keys from KeyRotationService
 */
export async function verifyTokenAsync(token: string): Promise<TokenPayload> {
  try {
    const validKeys = await KeyRotationService.getValidKeys();

    for (const { version, key } of validKeys) {
      try {
        const decoded = jwt.verify(token, key, {
          algorithms: ['HS256']
        }) as TokenPayload;
        return decoded;
      } catch (error) {
        // Try next key
        continue;
      }
    }

    // No valid key found
    throw new Error('Invalid token');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      logger.error('Error verifying JWT token with rotation:', error);
      throw new Error('Token verification failed');
    }
  }
}

export default {
  generateToken,
  generateTokenAsync,
  verifyToken,
  verifyTokenAsync,
  extractTokenFromCookie,
  extractTokenFromHeader,
  extractToken,
  decodeToken,
  isTokenExpired
};
