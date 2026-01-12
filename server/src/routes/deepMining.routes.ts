/**
 * Deep Mining Routes
 * API endpoints for Phase 13 Deep Mining System
 *
 * Features:
 * - Illegal claims management
 * - Deep mining shafts
 * - Fence operations (black market)
 * - Inspector encounter info
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { activityRateLimiter } from '../middleware/rateLimiter';
import {
  // Illegal Claims
  stakeIllegalClaim,
  getIllegalClaims,
  getIllegalClaimStatus,
  collectIllegalOre,
  requestGangProtection,
  attemptBribe,
  // Deep Mining Shafts
  createShaft,
  getShafts,
  getShaftStatus,
  descendShaft,
  mineAtLevel,
  installEquipment,
  // Fence Operations
  getFenceListings,
  getFenceQuote,
  sellToFence,
  // Inspection
  getInspectionInfo
} from '../controllers/deepMining.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// ILLEGAL CLAIMS
// ============================================

/**
 * POST /api/deep-mining/illegal/stake
 * Stake a new illegal (unregistered) claim
 * Body: { characterId: string, locationId: string, claimName?: string }
 */
router.post('/illegal/stake', requireCsrfToken, activityRateLimiter, stakeIllegalClaim);

/**
 * GET /api/deep-mining/illegal/:characterId
 * Get all illegal claims for a character
 * Protected: User must own this character
 */
router.get('/illegal/:characterId', requireCharacterOwnership, getIllegalClaims);

/**
 * GET /api/deep-mining/illegal/status/:claimId
 * Get detailed status of a specific illegal claim
 */
router.get('/illegal/status/:claimId', getIllegalClaimStatus);

/**
 * POST /api/deep-mining/illegal/collect
 * Collect ore from an illegal claim
 * Body: { characterId: string, claimId: string }
 */
router.post('/illegal/collect', requireCsrfToken, activityRateLimiter, collectIllegalOre);

/**
 * POST /api/deep-mining/illegal/protection
 * Request gang protection for an illegal claim
 * Body: { characterId: string, claimId: string, gangId: string }
 */
router.post('/illegal/protection', requireCsrfToken, activityRateLimiter, requestGangProtection);

/**
 * POST /api/deep-mining/illegal/bribe
 * Attempt to bribe an inspector
 * Body: { characterId: string, claimId: string, inspectorType: string, bribeAmount: number }
 */
router.post('/illegal/bribe', requireCsrfToken, activityRateLimiter, attemptBribe);

// ============================================
// DEEP MINING SHAFTS
// ============================================

/**
 * POST /api/deep-mining/shaft/create
 * Create a new mining shaft
 * Body: { characterId: string, locationId: string, shaftName?: string }
 */
router.post('/shaft/create', requireCsrfToken, activityRateLimiter, createShaft);

/**
 * GET /api/deep-mining/shaft/:characterId
 * Get all shafts for a character
 * Protected: User must own this character
 */
router.get('/shaft/:characterId', requireCharacterOwnership, getShafts);

/**
 * GET /api/deep-mining/shaft/status/:shaftId
 * Get detailed status of a mining shaft
 */
router.get('/shaft/status/:shaftId', getShaftStatus);

/**
 * POST /api/deep-mining/shaft/descend
 * Descend to the next level of a shaft
 * Body: { characterId: string, shaftId: string }
 */
router.post('/shaft/descend', requireCsrfToken, activityRateLimiter, descendShaft);

/**
 * POST /api/deep-mining/shaft/mine
 * Mine at the current level of a shaft
 * Body: { characterId: string, shaftId: string }
 */
router.post('/shaft/mine', requireCsrfToken, activityRateLimiter, mineAtLevel);

/**
 * POST /api/deep-mining/shaft/equipment
 * Install equipment in a shaft
 * Body: { characterId: string, shaftId: string, equipmentType: string, tier?: number }
 */
router.post('/shaft/equipment', requireCsrfToken, activityRateLimiter, installEquipment);

// ============================================
// FENCE OPERATIONS
// ============================================

/**
 * GET /api/deep-mining/fence/:characterId
 * Get all fence locations with character's trust levels
 * Protected: User must own this character
 */
router.get('/fence/:characterId', requireCharacterOwnership, getFenceListings);

/**
 * POST /api/deep-mining/fence/quote
 * Get a price quote from a fence
 * Body: { characterId: string, fenceLocationId: string, items: FenceItem[] }
 */
router.post('/fence/quote', requireCsrfToken, activityRateLimiter, getFenceQuote);

/**
 * POST /api/deep-mining/fence/sell
 * Sell items to a fence
 * Body: { characterId: string, fenceLocationId: string, items: FenceItem[] }
 */
router.post('/fence/sell', requireCsrfToken, activityRateLimiter, sellToFence);

// ============================================
// INSPECTION INFO
// ============================================

/**
 * GET /api/deep-mining/inspection/:claimId
 * Get inspection likelihood for a claim
 */
router.get('/inspection/:claimId', getInspectionInfo);

export default router;
