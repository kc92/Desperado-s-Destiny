/**
 * Conquest Routes
 *
 * API endpoints for territory siege and conquest mechanics
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import { Router } from 'express';
import { ConquestController } from '../controllers/conquest.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All conquest routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(requireCharacter);

// ========================
// SIEGE ELIGIBILITY
// ========================

/**
 * @route   GET /api/conquest/territories/:territoryId/eligibility
 * @desc    Check if faction can declare siege on territory
 * @access  Private
 * @query   attackingFaction (required), currentInfluence (optional)
 */
router.get(
  '/territories/:territoryId/eligibility',
  asyncHandler(ConquestController.checkSiegeEligibility)
);

// ========================
// SIEGE DECLARATION
// ========================

/**
 * @route   POST /api/conquest/territories/:territoryId/declare-siege
 * @desc    Declare siege on a territory
 * @access  Private
 * @body    { attackingFaction, resourceCommitment: { gold, supplies, troops }, requestedAllies?, warDuration? }
 */
router.post(
  '/territories/:territoryId/declare-siege',
  asyncHandler(ConquestController.declareSiege)
);

/**
 * @route   POST /api/conquest/sieges/:siegeAttemptId/rally-defense
 * @desc    Rally defense for a siege (defending faction)
 * @access  Private
 * @body    { defendingFaction, resourceCommitment: { gold, supplies, troops }, requestedAllies? }
 */
router.post(
  '/sieges/:siegeAttemptId/rally-defense',
  asyncHandler(ConquestController.rallyDefense)
);

// ========================
// SIEGE EXECUTION
// ========================

/**
 * @route   POST /api/conquest/sieges/:siegeAttemptId/start-assault
 * @desc    Start the assault phase (war event begins)
 * @access  Private
 * @body    { warEventId? }
 */
router.post(
  '/sieges/:siegeAttemptId/start-assault',
  asyncHandler(ConquestController.startAssault)
);

/**
 * @route   POST /api/conquest/sieges/:siegeAttemptId/complete
 * @desc    Complete a conquest attempt (resolve siege outcome)
 * @access  Private
 * @body    { attackerScore, defenderScore }
 */
router.post(
  '/sieges/:siegeAttemptId/complete',
  asyncHandler(ConquestController.completeConquest)
);

/**
 * @route   POST /api/conquest/sieges/:siegeAttemptId/cancel
 * @desc    Cancel a pending siege
 * @access  Private
 */
router.post(
  '/sieges/:siegeAttemptId/cancel',
  asyncHandler(ConquestController.cancelSiege)
);

// ========================
// SIEGE QUERIES
// ========================

/**
 * @route   GET /api/conquest/sieges/active
 * @desc    Get all active sieges
 * @access  Private
 */
router.get(
  '/sieges/active',
  asyncHandler(ConquestController.getActiveSieges)
);

/**
 * @route   GET /api/conquest/territories/:territoryId/history
 * @desc    Get conquest history for a territory
 * @access  Private
 */
router.get(
  '/territories/:territoryId/history',
  asyncHandler(ConquestController.getConquestHistory)
);

/**
 * @route   GET /api/conquest/factions/:factionId/statistics
 * @desc    Get faction conquest statistics
 * @access  Private
 */
router.get(
  '/factions/:factionId/statistics',
  asyncHandler(ConquestController.getFactionStatistics)
);

// ========================
// TERRITORY STATE MANAGEMENT (Admin/System)
// ========================

/**
 * @route   POST /api/conquest/territories/:territoryId/initialize
 * @desc    Initialize conquest state for a territory
 * @access  Private (should be admin only in production)
 * @body    { territoryName, initialController }
 */
router.post(
  '/territories/:territoryId/initialize',
  asyncHandler(ConquestController.initializeTerritoryState)
);

/**
 * @route   POST /api/conquest/update-occupation-statuses
 * @desc    Update occupation statuses for all territories
 * @access  Private (should be admin/cron only in production)
 */
router.post(
  '/update-occupation-statuses',
  asyncHandler(ConquestController.updateOccupationStatuses)
);

export default router;
