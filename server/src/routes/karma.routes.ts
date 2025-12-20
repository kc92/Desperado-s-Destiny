/**
 * Karma Routes
 *
 * REST API routes for the karma and deity system.
 *
 * Player routes:
 * - GET  /api/karma/:characterId - Get karma summary
 * - GET  /api/karma/:characterId/manifestations - Get divine messages
 * - GET  /api/karma/:characterId/effects - Get active blessing/curse effects
 * - POST /api/karma/manifestations/:manifestationId/deliver - Mark message delivered
 * - POST /api/karma/manifestations/:manifestationId/acknowledge - Acknowledge message
 *
 * Admin routes:
 * - GET    /api/karma/admin/watched/:deity - Get characters watched by deity
 * - DELETE /api/karma/:characterId/curses/:curseType - Force remove a curse
 */

import { Router } from 'express';
import karmaController from '../controllers/karma.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Note: Rate limiting is applied at the route index level via apiRateLimiter
// Individual route-level limiting can be added using existing limiters from rateLimiter.ts if needed

// ============================================================================
// PLAYER ROUTES
// ============================================================================

/**
 * GET /api/karma/:characterId
 * Get karma summary including deity relationships, blessings, curses
 */
router.get(
  '/:characterId',
  requireAuth,
  requireCharacter,
  karmaController.getKarma
);

/**
 * GET /api/karma/:characterId/manifestations
 * Get divine manifestations/messages
 * Query params: ?undelivered=true&unacknowledged=true&deity=GAMBLER&type=BLESSING&limit=20&skip=0
 */
router.get(
  '/:characterId/manifestations',
  requireAuth,
  requireCharacter,
  karmaController.getManifestations
);

/**
 * GET /api/karma/:characterId/effects
 * Get combined active effects from blessings and curses
 * Used by gameplay systems to apply karma effects
 */
router.get(
  '/:characterId/effects',
  requireAuth,
  requireCharacter,
  karmaController.getActiveEffects
);

/**
 * POST /api/karma/manifestations/:manifestationId/deliver
 * Mark a divine message as delivered (shown to player)
 */
router.post(
  '/manifestations/:manifestationId/deliver',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  karmaController.deliverManifest
);

/**
 * POST /api/karma/manifestations/:manifestationId/acknowledge
 * Acknowledge a divine message with optional response
 * Body: { response?: string }
 */
router.post(
  '/manifestations/:manifestationId/acknowledge',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  karmaController.acknowledgeManifest
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * GET /api/karma/admin/watched/:deity
 * Get characters being watched by a specific deity
 * Admin only
 */
router.get(
  '/admin/watched/:deity',
  requireAuth,
  requireAdmin,
  karmaController.getWatchedCharacters
);

/**
 * DELETE /api/karma/:characterId/curses/:curseType
 * Force remove a curse from a character
 * Admin only - for support/testing purposes
 */
router.delete(
  '/:characterId/curses/:curseType',
  requireAuth,
  requireCsrfToken,
  requireAdmin,
  karmaController.adminRemoveCurse
);

export default router;
