/**
 * Shop Routes
 * Routes for shop and inventory management
 */

import { Router } from 'express';
import {
  getShopItems,
  getItem,
  buyItem,
  sellItem,
  useItem,
  getInventory,
  equipItem,
  unequipItem,
  getEquipment
} from '../controllers/shop.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { shopRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/asyncHandler';
import { preventItemDuplication, checkGoldDuplication, logEconomicTransaction } from '../middleware/antiExploit.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// Public routes - view shop items
router.get('/', asyncHandler(getShopItems));
router.get('/items/:itemId', asyncHandler(getItem));

// Protected routes - require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Rate-limited purchase endpoint (30 per hour per user)
router.post('/buy', requireCsrfToken, shopRateLimiter, checkGoldDuplication(), preventItemDuplication(), asyncHandler(buyItem));

// Other shop operations (not rate limited as heavily)
router.post('/sell', requireCsrfToken, preventItemDuplication(), asyncHandler(sellItem));
router.post('/use', requireCsrfToken, asyncHandler(useItem));
router.get('/inventory', asyncHandler(getInventory));
router.post('/equip', requireCsrfToken, asyncHandler(equipItem));
router.post('/unequip', requireCsrfToken, asyncHandler(unequipItem));
router.get('/equipment', asyncHandler(getEquipment));

export default router;
