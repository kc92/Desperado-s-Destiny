/**
 * Legendary Hunt Routes
 *
 * Express router for legendary animal hunt endpoints including
 * discovery, tracking, combat, and rewards
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import legendaryHuntController from '../controllers/legendaryHunt.controller';
import { detectSuspiciousEarning } from '../middleware/antiExploit.middleware';

const router = Router();

// ============================================
// Discovery & Tracking Routes
// ============================================

/**
 * GET /api/legendary-hunts
 * Get all legendary animals with character's progress
 * Query: { category?: string, location?: string, discoveryStatus?: string }
 */
router.get('/', requireAuth, requireCharacter, asyncHandler(legendaryHuntController.getLegendaryAnimals));

/**
 * GET /api/legendary-hunts/trophies
 * Get all legendary trophies for character
 */
router.get('/trophies', requireAuth, requireCharacter, asyncHandler(legendaryHuntController.getTrophies));

/**
 * GET /api/legendary-hunts/:legendaryId
 * Get specific legendary animal with character's progress
 */
router.get('/:legendaryId', requireAuth, requireCharacter, asyncHandler(legendaryHuntController.getLegendaryAnimal));

/**
 * GET /api/legendary-hunts/:legendaryId/difficulty
 * Get difficulty rating for a legendary hunt
 */
router.get('/:legendaryId/difficulty', requireAuth, requireCharacter, asyncHandler(legendaryHuntController.getDifficultyRating));

/**
 * GET /api/legendary-hunts/:legendaryId/leaderboard
 * Get leaderboard for a legendary animal
 * Query: { limit?: number }
 */
router.get('/:legendaryId/leaderboard', asyncHandler(legendaryHuntController.getLeaderboard));

/**
 * POST /api/legendary-hunts/:legendaryId/discover-clue
 * Discover a clue for a legendary animal at a location
 * Body: { location: string }
 */
router.post('/:legendaryId/discover-clue', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(legendaryHuntController.discoverClue));

/**
 * POST /api/legendary-hunts/:legendaryId/hear-rumor
 * Hear a rumor about a legendary animal from an NPC
 * Body: { npcId: string }
 */
router.post('/:legendaryId/hear-rumor', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(legendaryHuntController.hearRumor));

/**
 * POST /api/legendary-hunts/:legendaryId/initiate
 * Initiate a hunt against a legendary animal
 * Body: { location: string }
 */
router.post('/:legendaryId/initiate', requireAuth, requireCsrfToken, requireCharacter, detectSuspiciousEarning(), asyncHandler(legendaryHuntController.initiateLegendaryHunt));

/**
 * POST /api/legendary-hunts/:legendaryId/claim-rewards
 * Claim rewards after defeating a legendary (if not auto-claimed)
 * Body: { sessionId?: string }
 */
router.post('/:legendaryId/claim-rewards', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(legendaryHuntController.claimRewards));

// ============================================
// Combat Session Routes
// ============================================

/**
 * GET /api/legendary-hunts/combat/:sessionId
 * Get current hunt session status
 */
router.get('/combat/:sessionId', requireAuth, requireCharacter, asyncHandler(legendaryHuntController.getHuntSession));

/**
 * POST /api/legendary-hunts/combat/:sessionId/attack
 * Execute a turn in legendary combat
 * Body: { action: 'attack' | 'special' | 'defend' | 'item' | 'flee', itemId?: string }
 */
router.post('/combat/:sessionId/attack', requireAuth, requireCsrfToken, requireCharacter, detectSuspiciousEarning(), asyncHandler(legendaryHuntController.executeHuntTurn));

/**
 * DELETE /api/legendary-hunts/combat/:sessionId
 * Abandon a hunt session
 */
router.delete('/combat/:sessionId', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(legendaryHuntController.abandonHuntSession));

export default router;
