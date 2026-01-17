/**
 * Middleware barrel export
 * Centralizes all middleware exports for easy importing
 */

import { errorHandler as errorHandlerFn, notFoundHandler as notFoundHandlerFn } from './errorHandler';
import { asyncHandler as asyncHandlerFn } from './asyncHandler';
import { rateLimiter as rateLimiterFn, authRateLimiter as authRateLimiterFn, apiRateLimiter as apiRateLimiterFn, deckGameRateLimiter as deckGameRateLimiterFn } from './rateLimiter';
import { requestLogger as requestLoggerFn } from './requestLogger';
import { sanitizeInput as sanitizeInputFn } from './sanitize.middleware';
import { requireCharacterOwnership as requireCharacterOwnershipFn, requireCharacter as requireCharacterFn, characterOwnership as characterOwnershipFn } from './characterOwnership.middleware';
import { checkTokenBlacklist as checkTokenBlacklistFn } from './checkTokenBlacklist.middleware';

export { errorHandlerFn as errorHandler, notFoundHandlerFn as notFoundHandler };
export { asyncHandlerFn as asyncHandler };
export { rateLimiterFn as rateLimiter, authRateLimiterFn as authRateLimiter, apiRateLimiterFn as apiRateLimiter, deckGameRateLimiterFn as deckGameRateLimiter };
export { requestLoggerFn as requestLogger };
export { sanitizeInputFn as sanitizeInput };
export { requireCharacterOwnershipFn as requireCharacterOwnership, requireCharacterFn as requireCharacter, characterOwnershipFn as characterOwnership };
export { checkTokenBlacklistFn as checkTokenBlacklist };

export default {
  errorHandler: errorHandlerFn,
  notFoundHandler: notFoundHandlerFn,
  asyncHandler: asyncHandlerFn,
  rateLimiter: rateLimiterFn,
  authRateLimiter: authRateLimiterFn,
  apiRateLimiter: apiRateLimiterFn,
  deckGameRateLimiter: deckGameRateLimiterFn,
  requestLogger: requestLoggerFn,
  requireCharacterOwnership: requireCharacterOwnershipFn,
  requireCharacter: requireCharacterFn,
  characterOwnership: characterOwnershipFn,
  checkTokenBlacklist: checkTokenBlacklistFn,
};
