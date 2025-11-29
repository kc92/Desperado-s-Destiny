/**
 * Gang War Routes
 *
 * API routes for gang war management
 */

import { Router } from 'express';
import { GangWarController } from '../controllers/gangWar.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
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
router.get('/', requireAuth, GangWarController.list);

/**
 * GET /api/wars/gang/:gangId
 * Get all active wars involving a gang
 */
router.get('/gang/:gangId', requireAuth, GangWarController.getGangWars);

/**
 * GET /api/wars/:id
 * Get single war by ID
 */
router.get('/:id', requireAuth, GangWarController.getById);

/**
 * POST /api/wars/:id/contribute
 * Contribute gold to a war
 */
router.post('/:id/contribute', requireAuth, GangWarController.contribute);

/**
 * POST /api/wars/:id/resolve
 * Manually resolve a war (admin only, for testing)
 */
router.post('/:id/resolve', requireAuth, GangWarController.resolve);

/**
 * Deck Game Integration Routes
 */

// Raid missions
router.post('/:warId/raid/start', requireAuth, requireCharacter, startRaid);
router.post('/:warId/raid/:raidId/play', requireAuth, requireCharacter, playRaidAction);
router.get('/:warId/raid/:raidId', requireAuth, requireCharacter, getRaidState);

// Champion duels
router.post('/:warId/champion/start', requireAuth, startChampionDuel);
router.get('/:warId/champion/game', requireAuth, requireCharacter, getChampionDuelState);
router.post('/:warId/champion/play', requireAuth, requireCharacter, playChampionAction);

// Leader showdown
router.post('/:warId/showdown/start', requireAuth, startShowdown);
router.get('/:warId/showdown/game', requireAuth, requireCharacter, getShowdownState);
router.post('/:warId/showdown/play', requireAuth, requireCharacter, playShowdownAction);

export default router;
