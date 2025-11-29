/**
 * Cosmic Routes
 * API endpoints for the Cosmic Quest and Cosmic Ending systems
 */

import { Router } from 'express';
import { CosmicController } from '../controllers/cosmic.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All cosmic routes require authentication
 */
router.use(requireAuth);

// ============================================
// COSMIC QUEST ROUTES
// ============================================

/**
 * POST /api/cosmic/start
 * Start the cosmic questline (requires level 25)
 */
router.post('/start', asyncHandler(CosmicController.startStoryline));

/**
 * GET /api/cosmic/progress
 * Get current cosmic quest progress
 */
router.get('/progress', asyncHandler(CosmicController.getProgress));

/**
 * GET /api/cosmic/quests
 * Get available cosmic quests
 */
router.get('/quests', asyncHandler(CosmicController.getAvailableQuests));

/**
 * POST /api/cosmic/quests/:questId/objectives/:objectiveId/complete
 * Complete a quest objective
 */
router.post(
  '/quests/:questId/objectives/:objectiveId/complete',
  asyncHandler(CosmicController.completeObjective)
);

/**
 * POST /api/cosmic/quests/:questId/complete
 * Complete a cosmic quest
 */
router.post('/quests/:questId/complete', asyncHandler(CosmicController.completeQuest));

/**
 * POST /api/cosmic/quests/:questId/choices/:choiceId
 * Make a major choice in the questline
 */
router.post('/quests/:questId/choices/:choiceId', asyncHandler(CosmicController.makeChoice));

/**
 * GET /api/cosmic/corruption
 * Get corruption state from cosmic questline
 */
router.get('/corruption', asyncHandler(CosmicController.getCorruptionState));

/**
 * GET /api/cosmic/lore
 * Get discovered lore
 * Query params: category (optional)
 */
router.get('/lore', asyncHandler(CosmicController.getDiscoveredLore));

/**
 * GET /api/cosmic/visions
 * Get experienced visions
 */
router.get('/visions', asyncHandler(CosmicController.getVisions));

// ============================================
// COSMIC ENDING ROUTES
// ============================================

/**
 * GET /api/cosmic/ending/predict
 * Predict likely ending based on current choices
 */
router.get('/ending/predict', asyncHandler(CosmicController.predictEnding));

/**
 * POST /api/cosmic/ending/trigger/:endingType
 * Trigger a specific ending (banishment, destruction, bargain, awakening)
 */
router.post('/ending/trigger/:endingType', asyncHandler(CosmicController.triggerEnding));

/**
 * GET /api/cosmic/ending/rewards/:endingType
 * Get rewards for a specific ending type
 */
router.get('/ending/rewards/:endingType', asyncHandler(CosmicController.getEndingRewards));

export default router;
