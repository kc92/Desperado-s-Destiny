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
router.post('/illegal/stake', stakeIllegalClaim);

/**
 * GET /api/deep-mining/illegal/:characterId
 * Get all illegal claims for a character
 */
router.get('/illegal/:characterId', getIllegalClaims);

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
router.post('/illegal/collect', collectIllegalOre);

/**
 * POST /api/deep-mining/illegal/protection
 * Request gang protection for an illegal claim
 * Body: { characterId: string, claimId: string, gangId: string }
 */
router.post('/illegal/protection', requestGangProtection);

/**
 * POST /api/deep-mining/illegal/bribe
 * Attempt to bribe an inspector
 * Body: { characterId: string, claimId: string, inspectorType: string, bribeAmount: number }
 */
router.post('/illegal/bribe', attemptBribe);

// ============================================
// DEEP MINING SHAFTS
// ============================================

/**
 * POST /api/deep-mining/shaft/create
 * Create a new mining shaft
 * Body: { characterId: string, locationId: string, shaftName?: string }
 */
router.post('/shaft/create', createShaft);

/**
 * GET /api/deep-mining/shaft/:characterId
 * Get all shafts for a character
 */
router.get('/shaft/:characterId', getShafts);

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
router.post('/shaft/descend', descendShaft);

/**
 * POST /api/deep-mining/shaft/mine
 * Mine at the current level of a shaft
 * Body: { characterId: string, shaftId: string }
 */
router.post('/shaft/mine', mineAtLevel);

/**
 * POST /api/deep-mining/shaft/equipment
 * Install equipment in a shaft
 * Body: { characterId: string, shaftId: string, equipmentType: string, tier?: number }
 */
router.post('/shaft/equipment', installEquipment);

// ============================================
// FENCE OPERATIONS
// ============================================

/**
 * GET /api/deep-mining/fence/:characterId
 * Get all fence locations with character's trust levels
 */
router.get('/fence/:characterId', getFenceListings);

/**
 * POST /api/deep-mining/fence/quote
 * Get a price quote from a fence
 * Body: { characterId: string, fenceLocationId: string, items: FenceItem[] }
 */
router.post('/fence/quote', getFenceQuote);

/**
 * POST /api/deep-mining/fence/sell
 * Sell items to a fence
 * Body: { characterId: string, fenceLocationId: string, items: FenceItem[] }
 */
router.post('/fence/sell', sellToFence);

// ============================================
// INSPECTION INFO
// ============================================

/**
 * GET /api/deep-mining/inspection/:claimId
 * Get inspection likelihood for a claim
 */
router.get('/inspection/:claimId', getInspectionInfo);

export default router;
