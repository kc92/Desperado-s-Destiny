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
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// Public routes
router.get('/all', asyncHandler(getAllMerchants));
router.get('/available', asyncHandler(getAvailableMerchants));
router.get('/search', asyncHandler(searchMerchants));
router.get('/stats', asyncHandler(getMerchantStats));
router.get('/at-location/:locationId', asyncHandler(getMerchantsAtLocation));
router.get('/upcoming/:locationId', asyncHandler(getUpcomingMerchants));
router.get('/:merchantId', asyncHandler(getMerchantDetails));
router.get('/:merchantId/state', asyncHandler(getMerchantState));
router.get('/:merchantId/inventory', asyncHandler(getMerchantInventory));
router.get('/:merchantId/dialogue', asyncHandler(getMerchantDialogue));
router.get('/:merchantId/trust', asyncHandler(getMerchantTrustInfo));

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get merchants visible to player
router.get('/visible', asyncHandler(getVisibleMerchants));

// Discover a hidden merchant
router.post('/:merchantId/discover', requireCsrfToken, asyncHandler(discoverMerchant));

// Buy item from a merchant
router.post('/:merchantId/buy', requireCsrfToken, asyncHandler(buyFromMerchant));

export default router;
