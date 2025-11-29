/**
 * Horse Routes
 * API routes for horse ownership, care, training, and breeding
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  getHorses,
  getHorse,
  purchaseHorse,
  activateHorse,
  renameHorse,
  feedHorse,
  groomHorse,
  restHorse,
  healHorse,
  trainHorse,
  getHorseBond,
  whistleForHorse,
  getHorseCombatBonus,
  breedHorses,
  getHorseLineage,
  getBreedingRecommendations
} from '../controllers/horse.controller';

const router = Router();

/**
 * Rate limiter for horse care actions
 * Limit: 60 actions per minute
 */
const horseCareRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Too many horse care actions. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for horse purchases
 * Limit: 10 purchases per hour
 */
const horsePurchaseRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Too many horse purchases. Please wait before buying more.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for breeding
 * Limit: 5 breeding attempts per hour
 */
const breedingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'Too many breeding attempts. Please wait.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================================================
// OWNERSHIP ROUTES
// ============================================================================

/**
 * GET /api/horses
 * Get all horses owned by the character
 */
router.get('/', requireAuth, requireCharacter, getHorses);

/**
 * GET /api/horses/:horseId
 * Get a specific horse by ID
 */
router.get('/:horseId', requireAuth, requireCharacter, getHorse);

/**
 * POST /api/horses/purchase
 * Purchase a new horse
 * Body: { breed: HorseBreed, gender?: HorseGender, name: string }
 */
router.post('/purchase', requireAuth, requireCharacter, horsePurchaseRateLimiter, purchaseHorse);

/**
 * POST /api/horses/:horseId/activate
 * Set a horse as the active mount
 */
router.post('/:horseId/activate', requireAuth, requireCharacter, horseCareRateLimiter, activateHorse);

/**
 * PATCH /api/horses/:horseId/rename
 * Rename a horse
 * Body: { newName: string }
 */
router.patch('/:horseId/rename', requireAuth, requireCharacter, horseCareRateLimiter, renameHorse);

// ============================================================================
// CARE ROUTES
// ============================================================================

/**
 * POST /api/horses/:horseId/feed
 * Feed a horse
 * Body: { foodQuality: 'basic' | 'quality' | 'premium' }
 */
router.post('/:horseId/feed', requireAuth, requireCharacter, horseCareRateLimiter, feedHorse);

/**
 * POST /api/horses/:horseId/groom
 * Groom a horse
 */
router.post('/:horseId/groom', requireAuth, requireCharacter, horseCareRateLimiter, groomHorse);

/**
 * POST /api/horses/:horseId/rest
 * Rest a horse to restore stamina
 * Body: { hours: number }
 */
router.post('/:horseId/rest', requireAuth, requireCharacter, horseCareRateLimiter, restHorse);

/**
 * POST /api/horses/:horseId/heal
 * Heal a horse
 * Body: { healthAmount: number }
 */
router.post('/:horseId/heal', requireAuth, requireCharacter, horseCareRateLimiter, healHorse);

// ============================================================================
// TRAINING ROUTES
// ============================================================================

/**
 * POST /api/horses/:horseId/train
 * Train a horse skill
 * Body: { skill: HorseSkill }
 */
router.post('/:horseId/train', requireAuth, requireCharacter, horseCareRateLimiter, trainHorse);

// ============================================================================
// BOND ROUTES
// ============================================================================

/**
 * GET /api/horses/:horseId/bond
 * Get bond status and recommendations
 */
router.get('/:horseId/bond', requireAuth, requireCharacter, getHorseBond);

/**
 * POST /api/horses/:horseId/whistle
 * Whistle to call your horse from a distance
 * Body: { distance: number }
 */
router.post('/:horseId/whistle', requireAuth, requireCharacter, horseCareRateLimiter, whistleForHorse);

// ============================================================================
// COMBAT ROUTES
// ============================================================================

/**
 * GET /api/horses/:horseId/combat-bonus
 * Get mounted combat bonuses for a horse
 */
router.get('/:horseId/combat-bonus', requireAuth, requireCharacter, getHorseCombatBonus);

// ============================================================================
// BREEDING ROUTES
// ============================================================================

/**
 * POST /api/horses/breed
 * Breed two horses together
 * Body: { stallionId: string, mareId: string }
 */
router.post('/breed', requireAuth, requireCharacter, breedingRateLimiter, breedHorses);

/**
 * GET /api/horses/:horseId/lineage
 * Get breeding lineage for a horse
 */
router.get('/:horseId/lineage', requireAuth, requireCharacter, getHorseLineage);

/**
 * GET /api/horses/:horseId/breeding-recommendations
 * Get breeding recommendations for a horse
 */
router.get('/:horseId/breeding-recommendations', requireAuth, requireCharacter, getBreedingRecommendations);

export default router;
