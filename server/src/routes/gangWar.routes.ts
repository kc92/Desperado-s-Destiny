/**
 * Gang War Routes
 *
 * API routes for gang war management
 */

import { Router } from 'express';
import { GangWarController } from '../controllers/gangWar.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  startRaid,
  playRaidAction,
  getRaidState,
  startChampionDuel,
  getChampionDuelState,
  playChampionAction,
  startShowdown,
  getShowdownState,
  playShowdownAction
} from '../controllers/gangWarDeck.controller';

const router = Router();

/**
 * GET /api/wars
 * List all active wars
 */
router.get('/', requireAuth, asyncHandler(GangWarController.list));

/**
 * GET /api/wars/gang/:gangId
 * Get all active wars involving a gang
 */
router.get('/gang/:gangId', requireAuth, asyncHandler(GangWarController.getGangWars));

/**
 * GET /api/wars/:id
 * Get single war by ID
 */
router.get('/:id', requireAuth, asyncHandler(GangWarController.getById));

/**
 * POST /api/wars/:id/contribute
 * Contribute gold to a war
 */
router.post('/:id/contribute', requireAuth, requireCsrfToken, asyncHandler(GangWarController.contribute));

/**
 * POST /api/wars/:id/resolve
 * Manually resolve a war (admin only, for testing)
 */
router.post('/:id/resolve', requireAuth, requireCsrfToken, asyncHandler(GangWarController.resolve));

/**
 * Deck Game Integration Routes
 */

// Raid missions
router.post('/:warId/raid/start', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(startRaid));
router.post('/:warId/raid/:raidId/play', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(playRaidAction));
router.get('/:warId/raid/:raidId', requireAuth, requireCharacter, asyncHandler(getRaidState));

// Champion duels
router.post('/:warId/champion/start', requireAuth, requireCsrfToken, asyncHandler(startChampionDuel));
router.get('/:warId/champion/game', requireAuth, requireCharacter, asyncHandler(getChampionDuelState));
router.post('/:warId/champion/play', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(playChampionAction));

// Leader showdown
router.post('/:warId/showdown/start', requireAuth, requireCsrfToken, asyncHandler(startShowdown));
router.get('/:warId/showdown/game', requireAuth, requireCharacter, asyncHandler(getShowdownState));
router.post('/:warId/showdown/play', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(playShowdownAction));

export default router;
