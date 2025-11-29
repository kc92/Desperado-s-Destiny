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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { shopRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes - view shop items
router.get('/', getShopItems);
router.get('/items/:itemId', getItem);

// Protected routes - require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Rate-limited purchase endpoint (30 per hour per user)
router.post('/buy', shopRateLimiter, buyItem);

// Other shop operations (not rate limited as heavily)
router.post('/sell', sellItem);
router.post('/use', useItem);
router.get('/inventory', getInventory);
router.post('/equip', equipItem);
router.post('/unequip', unequipItem);
router.get('/equipment', getEquipment);

export default router;
