/**
 * Wandering Merchant Routes
 * Traveling merchant system routes
 */

import { Router } from 'express';
import {
  getAllMerchants,
  getAvailableMerchants,
  getMerchantDetails,
  getMerchantState,
  getMerchantsAtLocation,
  getUpcomingMerchants,
  searchMerchants,
  getMerchantInventory,
  getMerchantDialogue,
  getMerchantTrustInfo,
  discoverMerchant,
  getVisibleMerchants,
  getMerchantStats,
  buyFromMerchant,
} from '../controllers/wanderingMerchant.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public routes
router.get('/all', getAllMerchants);
router.get('/available', getAvailableMerchants);
router.get('/search', searchMerchants);
router.get('/stats', getMerchantStats);
router.get('/at-location/:locationId', getMerchantsAtLocation);
router.get('/upcoming/:locationId', getUpcomingMerchants);
router.get('/:merchantId', getMerchantDetails);
router.get('/:merchantId/state', getMerchantState);
router.get('/:merchantId/inventory', getMerchantInventory);
router.get('/:merchantId/dialogue', getMerchantDialogue);
router.get('/:merchantId/trust', getMerchantTrustInfo);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get merchants visible to player
router.get('/visible', getVisibleMerchants);

// Discover a hidden merchant
router.post('/:merchantId/discover', discoverMerchant);

// Buy item from a merchant
router.post('/:merchantId/buy', buyFromMerchant);

export default router;
