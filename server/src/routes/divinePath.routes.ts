/**
 * Divine Path Routes - Divine Struggle System
 * API endpoints for the Divine Path (quest) and Divine Ending systems
 * Rebranded from Cosmic Routes (cosmic horror → angels & demons)
 */

import { Router } from 'express';
import { DivinePathController } from '../controllers/divinePath.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All divine path routes require authentication
 */
router.use(requireAuth);

// ============================================
// DIVINE PATH QUEST ROUTES
// ============================================

/**
 * POST /api/divine/start
 * Start the divine path questline (requires level 25)
 */
router.post('/start', requireCsrfToken, asyncHandler(DivinePathController.startStoryline));

/**
 * GET /api/divine/progress
 * Get current divine path progress
 */
router.get('/progress', asyncHandler(DivinePathController.getProgress));

/**
 * GET /api/divine/quests
 * Get available divine quests
 */
router.get('/quests', asyncHandler(DivinePathController.getAvailableQuests));

/**
 * POST /api/divine/quests/:questId/objectives/:objectiveId/complete
 * Complete a quest objective
 */
router.post(
  '/quests/:questId/objectives/:objectiveId/complete',
  requireCsrfToken,
  asyncHandler(DivinePathController.completeObjective)
);

/**
 * POST /api/divine/quests/:questId/complete
 * Complete a divine quest
 */
router.post('/quests/:questId/complete', requireCsrfToken, asyncHandler(DivinePathController.completeQuest));

/**
 * POST /api/divine/quests/:questId/choices/:choiceId
 * Make a major choice in the divine path
 */
router.post('/quests/:questId/choices/:choiceId', requireCsrfToken, asyncHandler(DivinePathController.makeChoice));

/**
 * GET /api/divine/sin
 * Get sin state from divine path
 */
router.get('/sin', asyncHandler(DivinePathController.getSinState));

/**
 * GET /api/divine/lore
 * Get discovered sacred lore
 * Query params: category (optional)
 */
router.get('/lore', asyncHandler(DivinePathController.getDiscoveredLore));

/**
 * GET /api/divine/visions
 * Get experienced divine visions
 */
router.get('/visions', asyncHandler(DivinePathController.getVisions));

// ============================================
// DIVINE ENDING ROUTES
// ============================================

/**
 * GET /api/divine/ending/predict
 * Predict likely ending based on current choices
 */
router.get('/ending/predict', asyncHandler(DivinePathController.predictEnding));

/**
 * POST /api/divine/ending/trigger/:endingType
 * Trigger a specific divine ending (salvation, purification, covenant, ascension)
 */
router.post('/ending/trigger/:endingType', requireCsrfToken, asyncHandler(DivinePathController.triggerEnding));

/**
 * GET /api/divine/ending/rewards/:endingType
 * Get rewards for a specific divine ending type
 */
router.get('/ending/rewards/:endingType', asyncHandler(DivinePathController.getEndingRewards));

export default router;
