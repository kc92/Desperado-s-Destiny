/**
 * Companion Routes
 * API routes for animal companion ownership, care, training, taming, and combat
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  getCompanions,
  getCompanionShop,
  purchaseCompanion,
  activateCompanion,
  renameCompanion,
  feedCompanion,
  healCompanion,
  startTraining,
  completeTraining,
  getCareTasks,
  releaseCompanion,
  getWildEncounters,
  attemptTaming,
  getTamingProgress,
  abandonTaming,
  getActiveCompanionCombatStats,
  useCompanionAbility
} from '../controllers/companion.controller';

const router = Router();

/**
 * Rate limiter for companion care actions
 * Limit: 60 actions per minute
 */
const companionCareRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Too many companion care actions. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for companion purchases
 * Limit: 10 purchases per hour
 */
const companionPurchaseRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Too many companion purchases. Please wait before buying more.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for taming attempts
 * Limit: 30 attempts per hour
 */
const tamingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: {
    success: false,
    error: 'Too many taming attempts. Please wait.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for combat abilities
 * Limit: 30 uses per minute
 */
const combatAbilityRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many ability uses. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================================================
// OWNERSHIP ROUTES
// ============================================================================

/**
 * GET /api/companions
 * Get all companions owned by the character
 */
router.get('/', requireAuth, requireCharacter, getCompanions);

/**
 * GET /api/companions/shop
 * Get available companions for purchase
 */
router.get('/shop', requireAuth, requireCharacter, getCompanionShop);

/**
 * POST /api/companions/purchase
 * Purchase a new companion
 * Body: { species: CompanionSpecies, name: string, gender: 'male' | 'female' }
 */
router.post('/purchase', requireAuth, requireCharacter, companionPurchaseRateLimiter, purchaseCompanion);

/**
 * POST /api/companions/:companionId/activate
 * Set a companion as active
 */
router.post('/:companionId/activate', requireAuth, requireCharacter, companionCareRateLimiter, activateCompanion);

/**
 * PATCH /api/companions/:companionId/rename
 * Rename a companion
 * Body: { newName: string }
 */
router.patch('/:companionId/rename', requireAuth, requireCharacter, companionCareRateLimiter, renameCompanion);

/**
 * DELETE /api/companions/:companionId
 * Release a companion back to the wild
 */
router.delete('/:companionId', requireAuth, requireCharacter, companionCareRateLimiter, releaseCompanion);

// ============================================================================
// CARE ROUTES
// ============================================================================

/**
 * POST /api/companions/:companionId/feed
 * Feed a companion
 */
router.post('/:companionId/feed', requireAuth, requireCharacter, companionCareRateLimiter, feedCompanion);

/**
 * POST /api/companions/:companionId/heal
 * Heal a companion
 */
router.post('/:companionId/heal', requireAuth, requireCharacter, companionCareRateLimiter, healCompanion);

/**
 * GET /api/companions/care-tasks
 * Get pending care tasks for all companions
 */
router.get('/care-tasks', requireAuth, requireCharacter, getCareTasks);

// ============================================================================
// TRAINING ROUTES
// ============================================================================

/**
 * POST /api/companions/:companionId/train
 * Start training an ability
 * Body: { abilityId: CompanionAbilityId }
 */
router.post('/:companionId/train', requireAuth, requireCharacter, companionCareRateLimiter, startTraining);

/**
 * POST /api/companions/:companionId/complete-training
 * Complete training and learn the ability
 */
router.post('/:companionId/complete-training', requireAuth, requireCharacter, companionCareRateLimiter, completeTraining);

// ============================================================================
// TAMING ROUTES
// ============================================================================

/**
 * GET /api/companions/wild-encounters
 * Get available wild animals to tame at current location
 */
router.get('/wild-encounters', requireAuth, requireCharacter, getWildEncounters);

/**
 * POST /api/companions/tame
 * Attempt to tame a wild animal
 * Body: { species: CompanionSpecies }
 */
router.post('/tame', requireAuth, requireCharacter, tamingRateLimiter, attemptTaming);

/**
 * GET /api/companions/taming-progress/:species
 * Get current taming progress for a species
 */
router.get('/taming-progress/:species', requireAuth, requireCharacter, getTamingProgress);

/**
 * POST /api/companions/abandon-taming
 * Abandon current taming attempt
 * Body: { species: CompanionSpecies }
 */
router.post('/abandon-taming', requireAuth, requireCharacter, companionCareRateLimiter, abandonTaming);

// ============================================================================
// COMBAT ROUTES
// ============================================================================

/**
 * GET /api/companions/active/combat-stats
 * Get combat stats for the active companion
 */
router.get('/active/combat-stats', requireAuth, requireCharacter, getActiveCompanionCombatStats);

/**
 * POST /api/companions/:companionId/use-ability
 * Use a companion ability in combat
 * Body: { abilityId: CompanionAbilityId, encounterId: string }
 */
router.post('/:companionId/use-ability', requireAuth, requireCharacter, combatAbilityRateLimiter, useCompanionAbility);

export default router;
