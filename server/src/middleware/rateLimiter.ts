import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * Rate limiter configuration
 * Prevents abuse by limiting the number of requests from a single IP
 *
 * SECURITY NOTE: Rate limits are tuned to prevent abuse while allowing normal usage.
 * Adjust these values based on actual traffic patterns and abuse attempts.
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
    // Skip rate limiting in test and development environments
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Stricter rate limiter for login endpoint
 * Helps prevent brute force attacks
 *
 * SECURITY: Limited to 5 attempts per 15 minutes to prevent credential stuffing
 * and brute force attacks while still allowing legitimate failed login attempts.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window - strict to prevent brute force
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
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
    // Skip rate limiting in test and development environments
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Very strict rate limiter for registration endpoint
 * Prevents account spam and bot registrations
 *
 * SECURITY: Limited to 3 attempts per hour to prevent mass account creation
 * while still allowing legitimate users to retry if they make mistakes.
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
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
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
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
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window - allows normal gameplay
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many API requests, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    // Skip rate limiting in test and development environments
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter for gold transfer endpoints
 * Prevents rapid gold transfer abuse and economic exploits
 *
 * SECURITY: Strict user-based limit to prevent gold duplication exploits
 * Limited to 10 transfers per hour per user (not IP) to prevent abuse
 */
export const goldTransferRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 gold transfers per hour per user
  message: 'Transfer limit reached, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
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
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter for shop purchase endpoints
 * Prevents rapid purchase attempts that could exploit race conditions
 *
 * SECURITY: User-based limiting to prevent automated shop abuse
 * 30 purchases per hour per user - generous for normal gameplay but prevents bots
 */
export const shopRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 purchases per hour per user
  message: 'Purchase limit reached, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
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
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter for password reset endpoints
 * Prevents password reset spam and enumeration attacks
 *
 * SECURITY: Very strict limit to prevent account enumeration and email spam
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many password reset attempts, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter for character creation
 * Prevents spam character creation
 *
 * SECURITY: Limited to prevent character spam and potential abuse
 */
export const characterCreationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 character creations per 15 minutes
  message: 'Too many character creation attempts, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res) => {
    logger.warn(`Character creation rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many character creation attempts, please slow down',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter for gang operations
 * Prevents rapid gang creation/modification abuse
 *
 * SECURITY: Moderate limit to prevent gang spam while allowing normal operations
 */
export const gangOperationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 gang operations per 10 minutes
  message: 'Too many gang operations, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res) => {
    logger.warn(`Gang operation rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many gang operations, please slow down',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});

/**
 * Rate limiter for marketplace operations
 * Prevents rapid marketplace abuse (bid sniping, listing spam, etc.)
 *
 * SECURITY: User-based limiting to prevent marketplace manipulation
 * 60 operations per hour per user - allows active trading while preventing abuse
 */
export const marketplaceRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 60 marketplace operations per hour per user
  message: 'Marketplace activity limit reached, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
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
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
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
  characterCreationRateLimiter,
  gangOperationRateLimiter,
  marketplaceRateLimiter,
};
