/**
 * Chinese Diaspora Routes
 *
 * API endpoints for the hidden Chinese immigrant network reputation system
 */

import { Router } from 'express';
import { ChineseDiasporaController } from '../controllers/chineseDiaspora.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * All routes require authentication
 */

/**
 * GET /api/diaspora/status
 * Get character's network status (null if not discovered)
 */
router.get('/status', requireAuth, ChineseDiasporaController.getStatus);

/**
 * POST /api/diaspora/discover
 * Discover the network for the first time
 */
router.post('/discover', requireAuth, ChineseDiasporaController.discoverNetwork);

/**
 * GET /api/diaspora/contacts
 * Get known network contacts
 */
router.get('/contacts', requireAuth, ChineseDiasporaController.getContacts);

/**
 * POST /api/diaspora/interact/:npcId
 * Interact with a network NPC
 */
router.post('/interact/:npcId', requireAuth, ChineseDiasporaController.interactWithNPC);

/**
 * POST /api/diaspora/reputation/add
 * Add reputation (for quest completion, helping NPCs, etc.)
 */
router.post('/reputation/add', requireAuth, ChineseDiasporaController.addReputation);

/**
 * POST /api/diaspora/reputation/remove
 * Remove reputation (for betrayals, crimes against network, etc.)
 */
router.post('/reputation/remove', requireAuth, ChineseDiasporaController.removeReputation);

/**
 * POST /api/diaspora/vouch
 * Vouch for another character
 */
router.post('/vouch', requireAuth, ChineseDiasporaController.vouchForCharacter);

/**
 * POST /api/diaspora/request-service
 * Request a network service
 */
router.post('/request-service', requireAuth, ChineseDiasporaController.requestService);

/**
 * GET /api/diaspora/services
 * Get available services for character
 */
router.get('/services', requireAuth, ChineseDiasporaController.getAvailableServices);

/**
 * GET /api/diaspora/leaderboard
 * Get leaderboard of Dragons (highest trust level)
 */
router.get('/leaderboard', requireAuth, ChineseDiasporaController.getLeaderboard);

/**
 * POST /api/diaspora/weekly-bonus
 * Process weekly secret-keeping bonus (internal/job endpoint)
 */
router.post('/weekly-bonus', requireAuth, ChineseDiasporaController.processWeeklyBonus);

export default router;
