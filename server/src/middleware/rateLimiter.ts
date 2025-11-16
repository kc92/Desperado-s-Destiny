import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * Rate limiter configuration
 * Prevents abuse by limiting the number of requests from a single IP
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
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 * Helps prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, _res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);

    throw new AppError(
      'Too many authentication attempts, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * More lenient rate limiter for API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
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
});

export default {
  rateLimiter,
  authRateLimiter,
  apiRateLimiter,
};
