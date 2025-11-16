/**
 * Middleware barrel export
 * Centralizes all middleware exports for easy importing
 */

import { errorHandler as errorHandlerFn, notFoundHandler as notFoundHandlerFn } from './errorHandler';
import { asyncHandler as asyncHandlerFn } from './asyncHandler';
import { rateLimiter as rateLimiterFn, authRateLimiter as authRateLimiterFn, apiRateLimiter as apiRateLimiterFn } from './rateLimiter';
import { requestLogger as requestLoggerFn } from './requestLogger';

export { errorHandlerFn as errorHandler, notFoundHandlerFn as notFoundHandler };
export { asyncHandlerFn as asyncHandler };
export { rateLimiterFn as rateLimiter, authRateLimiterFn as authRateLimiter, apiRateLimiterFn as apiRateLimiter };
export { requestLoggerFn as requestLogger };

export default {
  errorHandler: errorHandlerFn,
  notFoundHandler: notFoundHandlerFn,
  asyncHandler: asyncHandlerFn,
  rateLimiter: rateLimiterFn,
  authRateLimiter: authRateLimiterFn,
  apiRateLimiter: apiRateLimiterFn,
  requestLogger: requestLoggerFn,
};
