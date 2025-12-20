/**
 * Sanity Routes
 * API endpoints for Sanity, Corruption, and Reality Distortion systems
 */

import { Router } from 'express';
import { SanityController } from '../controllers/sanity.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All sanity routes require authentication
 */
router.use(requireAuth);

// ============================================
// SANITY ROUTES
// ============================================

/**
 * GET /api/sanity
 * Get sanity status and statistics
 */
router.get('/', asyncHandler(SanityController.getSanityStatus));

/**
 * POST /api/sanity/lose
 * Lose sanity (triggered by events or admin)
 * Body: { amount: number, source?: string }
 */
router.post('/lose', requireCsrfToken, asyncHandler(SanityController.loseSanity));

/**
 * POST /api/sanity/restore
 * Use a sanity restoration method
 * Body: { methodId: string }
 */
router.post('/restore', requireCsrfToken, asyncHandler(SanityController.restoreSanity));

/**
 * POST /api/sanity/check
 * Perform a sanity check
 * Body: { difficulty: number (1-10) }
 */
router.post('/check', requireCsrfToken, asyncHandler(SanityController.performSanityCheck));

/**
 * GET /api/sanity/hallucinations
 * Get active hallucinations
 */
router.get('/hallucinations', asyncHandler(SanityController.getHallucinations));

/**
 * GET /api/sanity/traumas
 * Get permanent traumas
 */
router.get('/traumas', asyncHandler(SanityController.getTraumas));

/**
 * GET /api/sanity/combat-penalty
 * Get combat penalty from low sanity
 */
router.get('/combat-penalty', asyncHandler(SanityController.getCombatPenalty));

// ============================================
// CORRUPTION ROUTES
// ============================================

/**
 * GET /api/sanity/corruption
 * Get corruption status and effects
 */
router.get('/corruption', asyncHandler(SanityController.getCorruptionStatus));

/**
 * POST /api/sanity/corruption/gain
 * Gain corruption (triggered by events or admin)
 * Body: { amount: number, source?: string, location?: string }
 */
router.post('/corruption/gain', requireCsrfToken, asyncHandler(SanityController.gainCorruption));

/**
 * POST /api/sanity/corruption/purge
 * Purge corruption
 * Body: { amount: number, method?: string }
 */
router.post('/corruption/purge', requireCsrfToken, asyncHandler(SanityController.purgeCorruption));

/**
 * GET /api/sanity/madness
 * Get active and permanent madness effects
 */
router.get('/madness', asyncHandler(SanityController.getMadness));

/**
 * POST /api/sanity/madness/:madnessId/cure
 * Attempt to cure a madness effect
 * Body: { method: string }
 */
router.post('/madness/:madnessId/cure', requireCsrfToken, asyncHandler(SanityController.cureMadness));

/**
 * POST /api/sanity/knowledge/learn
 * Learn forbidden knowledge
 * Body: { knowledge: ForbiddenKnowledgeType, sanityCost?: number, corruptionCost?: number }
 */
router.post('/knowledge/learn', requireCsrfToken, asyncHandler(SanityController.learnKnowledge));

/**
 * GET /api/sanity/transformation-risk
 * Check transformation risk from high corruption
 */
router.get('/transformation-risk', asyncHandler(SanityController.checkTransformationRisk));

/**
 * GET /api/sanity/npc-reaction
 * Get NPC reaction modifiers from corruption
 */
router.get('/npc-reaction', asyncHandler(SanityController.getNPCReaction));

/**
 * GET /api/sanity/combat-modifiers
 * Get combat modifiers from corruption
 */
router.get('/combat-modifiers', asyncHandler(SanityController.getCombatModifiers));

// ============================================
// REALITY DISTORTION ROUTES
// ============================================

/**
 * GET /api/sanity/distortions
 * Get active reality distortions affecting character
 */
router.get('/distortions', asyncHandler(SanityController.getActiveDistortions));

/**
 * POST /api/sanity/distortions/roll
 * Roll for a reality distortion at current location
 * Body: { location?: string }
 */
router.post('/distortions/roll', requireCsrfToken, asyncHandler(SanityController.rollForDistortion));

/**
 * GET /api/sanity/distortions/all
 * Get all possible distortion types
 */
router.get('/distortions/all', asyncHandler(SanityController.getAllDistortions));

/**
 * GET /api/sanity/location-stability
 * Get reality stability of a location
 * Query params: location (optional, defaults to character's current location)
 */
router.get('/location-stability', asyncHandler(SanityController.getLocationStability));

/**
 * POST /api/sanity/distortions/force
 * Force a specific distortion (admin/testing)
 * Body: { distortionId: string }
 */
router.post('/distortions/force', requireCsrfToken, asyncHandler(SanityController.forceDistortion));

export default router;
