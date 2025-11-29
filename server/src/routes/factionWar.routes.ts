/**
 * Faction War Routes
 *
 * API endpoints for faction war events and participation
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import { Router } from 'express';
import { FactionWarController } from '../controllers/factionWar.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All faction war routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(requireCharacter);

// ========================
// WAR EVENT QUERIES
// ========================

/**
 * @route   GET /api/faction-wars/active
 * @desc    Get all active war events
 * @access  Private
 */
router.get(
  '/active',
  asyncHandler(FactionWarController.getActiveEvents)
);

/**
 * @route   GET /api/faction-wars/upcoming
 * @desc    Get upcoming war events
 * @access  Private
 */
router.get(
  '/upcoming',
  asyncHandler(FactionWarController.getUpcomingEvents)
);

/**
 * @route   GET /api/faction-wars/:warEventId
 * @desc    Get war event details with participants
 * @access  Private
 */
router.get(
  '/:warEventId',
  asyncHandler(FactionWarController.getWarEventDetails)
);

/**
 * @route   GET /api/faction-wars/:warEventId/statistics
 * @desc    Get war event statistics
 * @access  Private
 */
router.get(
  '/:warEventId/statistics',
  asyncHandler(FactionWarController.getWarStatistics)
);

// ========================
// WAR EVENT CREATION
// ========================

/**
 * @route   POST /api/faction-wars
 * @desc    Create a new war event from template
 * @access  Private (should be admin only in production)
 * @body    { templateId, attackingFaction, defendingFaction, targetTerritory, customStartTime? }
 */
router.post(
  '/',
  asyncHandler(FactionWarController.createWarEvent)
);

// ========================
// WAR PARTICIPATION
// ========================

/**
 * @route   POST /api/faction-wars/:warEventId/join
 * @desc    Join a war event
 * @access  Private
 * @body    { side }
 */
router.post(
  '/:warEventId/join',
  asyncHandler(FactionWarController.joinWarEvent)
);

// ========================
// WAR EVENT MANAGEMENT (Admin/System)
// ========================

/**
 * @route   POST /api/faction-wars/update-phases
 * @desc    Update war event phases (cron job)
 * @access  Private (should be admin/cron only in production)
 */
router.post(
  '/update-phases',
  asyncHandler(FactionWarController.updateEventPhases)
);

/**
 * @route   POST /api/faction-wars/:warEventId/resolve
 * @desc    Manually resolve a war event
 * @access  Private (should be admin only in production)
 */
router.post(
  '/:warEventId/resolve',
  asyncHandler(FactionWarController.resolveWarEvent)
);

export default router;
