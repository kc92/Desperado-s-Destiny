/**
 * Warfare Routes
 *
 * API endpoints for territory warfare, fortifications, and resistance
 */

import { Router } from 'express';
import { WarfareController } from '../controllers/warfare.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All warfare routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(requireCharacter);

// ========================
// FORTIFICATION ROUTES
// ========================

/**
 * GET /api/warfare/territories/:territoryId/fortifications
 * Get all fortifications for a territory
 */
router.get(
  '/territories/:territoryId/fortifications',
  asyncHandler(WarfareController.getTerritoryFortifications)
);

/**
 * GET /api/warfare/territories/:territoryId/fortifications/:fortificationId
 * Get info about a specific fortification
 */
router.get(
  '/territories/:territoryId/fortifications/:fortificationId',
  asyncHandler(WarfareController.getFortificationInfo)
);

/**
 * POST /api/warfare/territories/:territoryId/fortifications
 * Build a new fortification
 * Body: { fortificationType: FortificationType, factionId: FactionId }
 */
router.post(
  '/territories/:territoryId/fortifications',
  asyncHandler(WarfareController.buildFortification)
);

/**
 * PUT /api/warfare/territories/:territoryId/fortifications/:fortificationId/upgrade
 * Upgrade an existing fortification
 * Body: { factionId: FactionId }
 */
router.put(
  '/territories/:territoryId/fortifications/:fortificationId/upgrade',
  asyncHandler(WarfareController.upgradeFortification)
);

/**
 * PUT /api/warfare/territories/:territoryId/fortifications/:fortificationId/repair
 * Repair a damaged fortification
 * Body: { factionId: FactionId }
 */
router.put(
  '/territories/:territoryId/fortifications/:fortificationId/repair',
  asyncHandler(WarfareController.repairFortification)
);

/**
 * DELETE /api/warfare/territories/:territoryId/fortifications/:fortificationId
 * Demolish a fortification
 * Body: { factionId: FactionId }
 */
router.delete(
  '/territories/:territoryId/fortifications/:fortificationId',
  asyncHandler(WarfareController.demolishFortification)
);

/**
 * GET /api/warfare/territories/:territoryId/recommendations
 * Get fortification build recommendations
 */
router.get(
  '/territories/:territoryId/recommendations',
  asyncHandler(WarfareController.getBuildRecommendations)
);

/**
 * POST /api/warfare/territories/:territoryId/siege-damage
 * Apply siege damage to fortifications (admin/system use)
 * Body: { siegeIntensity: number, duration: number }
 */
router.post(
  '/territories/:territoryId/siege-damage',
  asyncHandler(WarfareController.applySiegeDamage)
);

// ========================
// RESISTANCE ROUTES
// ========================

/**
 * GET /api/warfare/territories/:territoryId/resistance
 * Get resistance activities for a territory
 */
router.get(
  '/territories/:territoryId/resistance',
  asyncHandler(WarfareController.getResistanceActivities)
);

/**
 * GET /api/warfare/territories/:territoryId/resistance/actions
 * Get available resistance actions for a faction
 * Query: faction (FactionId)
 */
router.get(
  '/territories/:territoryId/resistance/actions',
  asyncHandler(WarfareController.getAvailableResistanceActions)
);

/**
 * POST /api/warfare/territories/:territoryId/resistance/execute
 * Execute a resistance action
 * Body: { activityType: ResistanceActivityType, faction: FactionId, resourcesCommitted: number }
 */
router.post(
  '/territories/:territoryId/resistance/execute',
  asyncHandler(WarfareController.executeResistanceAction)
);

/**
 * POST /api/warfare/territories/:territoryId/resistance/suppress
 * Suppress resistance (for controlling faction)
 * Body: { controllingFaction: FactionId, resourcesCommitted: number }
 */
router.post(
  '/territories/:territoryId/resistance/suppress',
  asyncHandler(WarfareController.suppressResistance)
);

// ========================
// LIBERATION ROUTES
// ========================

/**
 * POST /api/warfare/territories/:territoryId/liberation/start
 * Start a liberation campaign
 * Body: { liberatingFaction: FactionId, initialResources: { gold: number, supplies: number, troops: number } }
 */
router.post(
  '/territories/:territoryId/liberation/start',
  asyncHandler(WarfareController.startLiberationCampaign)
);

// ========================
// DIPLOMACY ROUTES
// ========================

/**
 * POST /api/warfare/territories/:territoryId/diplomacy/propose
 * Propose a diplomatic solution
 * Body: { proposingFaction: FactionId, targetFaction: FactionId, solutionType: string, customTerms?: object }
 */
router.post(
  '/territories/:territoryId/diplomacy/propose',
  asyncHandler(WarfareController.proposeDiplomaticSolution)
);

/**
 * POST /api/warfare/diplomacy/:proposalId/accept
 * Accept a diplomatic proposal
 * Body: { acceptingFaction: FactionId }
 */
router.post(
  '/diplomacy/:proposalId/accept',
  asyncHandler(WarfareController.acceptDiplomaticSolution)
);

export default router;
