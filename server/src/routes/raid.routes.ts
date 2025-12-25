/**
 * Raid Routes
 *
 * API routes for the full raid system (Phase 2.3)
 * Handles property raids, treasury raids, territory influence, and production disruption
 */

import { Router } from 'express';
import { RaidController } from '../controllers/raid.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// ============================================================================
// Raid Target Discovery
// ============================================================================

/**
 * GET /api/raids/targets/:targetType
 * Get available raid targets for a target type
 * Query params: characterId
 */
router.get(
  '/targets/:targetType',
  requireAuth,
  requireCharacter,
  asyncHandler(RaidController.getAvailableTargets)
);

// ============================================================================
// Raid Lifecycle
// ============================================================================

/**
 * POST /api/raids/plan
 * Plan a new raid
 * Body: { characterId, targetType, targetId }
 */
router.post(
  '/plan',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.planRaid)
);

/**
 * POST /api/raids/:raidId/join
 * Join an existing raid as a participant
 * Body: { characterId, role }
 */
router.post(
  '/:raidId/join',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.joinRaid)
);

/**
 * POST /api/raids/:raidId/schedule
 * Schedule a raid for execution
 * Body: { characterId, scheduledFor }
 */
router.post(
  '/:raidId/schedule',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.scheduleRaid)
);

/**
 * POST /api/raids/:raidId/cancel
 * Cancel a planned or scheduled raid
 * Body: { characterId }
 */
router.post(
  '/:raidId/cancel',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.cancelRaid)
);

/**
 * POST /api/raids/:raidId/execute
 * Execute a raid immediately (leader action or testing)
 * Body: { characterId }
 */
router.post(
  '/:raidId/execute',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.executeRaidNow)
);

// ============================================================================
// Raid Queries
// ============================================================================

/**
 * GET /api/raids/active
 * Get active raids for the character's gang
 * Query params: characterId
 */
router.get(
  '/active',
  requireAuth,
  requireCharacter,
  asyncHandler(RaidController.getActiveRaids)
);

/**
 * GET /api/raids/history
 * Get raid history for the character's gang
 * Query params: characterId, limit
 */
router.get(
  '/history',
  requireAuth,
  requireCharacter,
  asyncHandler(RaidController.getRaidHistory)
);

/**
 * GET /api/raids/summary
 * Get gang raids summary statistics
 * Query params: characterId
 */
router.get(
  '/summary',
  requireAuth,
  requireCharacter,
  asyncHandler(RaidController.getGangRaidsSummary)
);

/**
 * GET /api/raids/:raidId
 * Get raid details by ID
 */
router.get(
  '/:raidId',
  requireAuth,
  asyncHandler(RaidController.getRaidDetails)
);

// ============================================================================
// Property Defense Management
// ============================================================================

/**
 * GET /api/raids/properties/:propertyId/defense
 * Get property defense details
 */
router.get(
  '/properties/:propertyId/defense',
  requireAuth,
  asyncHandler(RaidController.getPropertyDefense)
);

/**
 * POST /api/raids/properties/:propertyId/guards
 * Hire a guard for a property
 * Body: { characterId, guardName, skillTier }
 */
router.post(
  '/properties/:propertyId/guards',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.hireGuard)
);

/**
 * DELETE /api/raids/properties/:propertyId/guards/:guardId
 * Fire a guard from a property
 * Body: { characterId }
 */
router.delete(
  '/properties/:propertyId/guards/:guardId',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.fireGuard)
);

/**
 * PUT /api/raids/properties/:propertyId/insurance
 * Set property insurance level
 * Body: { characterId, level }
 */
router.put(
  '/properties/:propertyId/insurance',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  asyncHandler(RaidController.setInsurance)
);

export default router;
