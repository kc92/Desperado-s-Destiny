/**
 * Deity Encounter Routes
 *
 * Routes for deity manifestation system including:
 * - Stranger encounters
 * - Omens
 * - Dream acknowledgment
 * - Attention status
 */

import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import deityEncounterController from '../controllers/deityEncounter.controller';

const router = Router();

// ============================================================================
// STRANGER ROUTES
// ============================================================================

/**
 * GET /api/deity/strangers
 * Get all strangers available to the character at any location
 */
router.get(
  '/strangers',
  authenticate,
  requireCharacter,
  deityEncounterController.getAllAvailableStrangers
);

/**
 * GET /api/deity/strangers/:locationId
 * Get strangers at a specific location
 */
router.get(
  '/strangers/:locationId',
  authenticate,
  requireCharacter,
  deityEncounterController.getStrangersAtLocation
);

/**
 * POST /api/deity/strangers/:strangerId/interact
 * Start interaction with a stranger
 */
router.post(
  '/strangers/:strangerId/interact',
  authenticate,
  requireCharacter,
  requireCsrfToken,
  deityEncounterController.startStrangerInteraction
);

/**
 * POST /api/deity/strangers/:strangerId/complete
 * Complete interaction with a stranger
 * Body: { testPassed?: boolean, responseChosen?: number, tradeAccepted?: boolean, giftAccepted?: boolean }
 */
router.post(
  '/strangers/:strangerId/complete',
  authenticate,
  requireCharacter,
  requireCsrfToken,
  deityEncounterController.completeStrangerInteraction
);

// ============================================================================
// OMEN ROUTES
// ============================================================================

/**
 * GET /api/deity/omens
 * Get active omen effects for the character
 */
router.get(
  '/omens',
  authenticate,
  requireCharacter,
  deityEncounterController.getActiveOmens
);

/**
 * GET /api/deity/omens/modifier/:effectType
 * Get omen modifier for a specific effect type
 */
router.get(
  '/omens/modifier/:effectType',
  authenticate,
  requireCharacter,
  deityEncounterController.getOmenModifier
);

// ============================================================================
// MANIFESTATION ROUTES
// ============================================================================

/**
 * GET /api/deity/manifestations/pending
 * Get pending (unacknowledged) manifestations
 */
router.get(
  '/manifestations/pending',
  authenticate,
  requireCharacter,
  deityEncounterController.getPendingManifestations
);

/**
 * POST /api/deity/manifestations/:manifestationId/acknowledge
 * Acknowledge a divine manifestation
 * Body: { response?: string }
 */
router.post(
  '/manifestations/:manifestationId/acknowledge',
  authenticate,
  requireCharacter,
  requireCsrfToken,
  deityEncounterController.acknowledgeManifestation
);

// ============================================================================
// ATTENTION ROUTES
// ============================================================================

/**
 * GET /api/deity/attention
 * Get deity attention status for the character
 */
router.get(
  '/attention',
  authenticate,
  requireCharacter,
  deityEncounterController.getAttentionStatus
);

// ============================================================================
// DREAM ROUTES
// ============================================================================

/**
 * GET /api/deity/dreams/interpretation
 * Get dream interpretation
 * Query: dreamType, deity
 */
router.get(
  '/dreams/interpretation',
  authenticate,
  deityEncounterController.getDreamInterpretation
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * POST /api/deity/admin/spawn-stranger
 * Admin: Force spawn a stranger
 * Body: { deity: 'GAMBLER' | 'OUTLAW_KING', locationId: string, targetCharacterId?: string }
 */
router.post(
  '/admin/spawn-stranger',
  authenticate,
  requireAdmin,
  requireCsrfToken,
  deityEncounterController.adminSpawnStranger
);

/**
 * POST /api/deity/admin/force-omen
 * Admin: Force an omen
 * Body: { characterId: string, omenId: string }
 */
router.post(
  '/admin/force-omen',
  authenticate,
  requireAdmin,
  requireCsrfToken,
  deityEncounterController.adminForceOmen
);

/**
 * POST /api/deity/admin/force-dream
 * Admin: Force a dream
 * Body: { characterId: string, deity: 'GAMBLER' | 'OUTLAW_KING', dreamType: string }
 */
router.post(
  '/admin/force-dream',
  authenticate,
  requireAdmin,
  requireCsrfToken,
  deityEncounterController.adminForceDream
);

export default router;
