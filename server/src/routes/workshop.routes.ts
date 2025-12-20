/**
 * Workshop Routes
 * API routes for workshop access, masterwork crafting, and repairs
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { checkGoldDuplication } from '../middleware/antiExploit.middleware';
import {
  getWorkshopInfo,
  getLocationWorkshops,
  getWorkshopsByProfession,
  requestAccess,
  getRecommendations,
  findBestWorkshop,
  getAllWorkshopsSummary,
  getQualityTiers,
  renameMasterwork,
  getRepairCost,
  checkCanRepair,
  repairItem
} from '../controllers/workshop.controller';

const router = Router();

/**
 * Rate limiter for workshop actions
 * Limit: 30 requests per minute
 */
const workshopLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many workshop requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for repair actions
 * Limit: 10 repairs per minute
 */
const repairLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'Too many repair requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Workshop Routes
 * All routes require authentication
 */

// Get workshop summary (public data)
// GET /api/workshops/summary
router.get('/summary', requireAuth, asyncHandler(getAllWorkshopsSummary));

// Get quality tier information
// GET /api/workshops/quality-tiers
router.get('/quality-tiers', requireAuth, asyncHandler(getQualityTiers));

// Get workshop recommendations for character
// GET /api/workshops/recommendations
router.get('/recommendations', requireAuth, requireCharacter, asyncHandler(getRecommendations));

// Get workshops at a specific location
// GET /api/workshops/location/:locationId
router.get('/location/:locationId', requireAuth, asyncHandler(getLocationWorkshops));

// Get workshops by profession
// GET /api/workshops/profession/:professionId
// Query: minTier?, location?
router.get('/profession/:professionId', requireAuth, requireCharacter, asyncHandler(getWorkshopsByProfession));

// Find best workshop for a profession
// GET /api/workshops/best/:professionId
router.get('/best/:professionId', requireAuth, requireCharacter, asyncHandler(findBestWorkshop));

// Request access to a workshop
// POST /api/workshops/access
// Body: { workshopId, duration?, membershipType? }
router.post('/access', requireAuth, requireCharacter, requireCsrfToken, workshopLimiter, checkGoldDuplication(), asyncHandler(requestAccess));

// Rename a masterwork item
// POST /api/workshops/masterwork/rename
// Body: { itemId, newName }
router.post('/masterwork/rename', requireAuth, requireCharacter, requireCsrfToken, workshopLimiter, asyncHandler(renameMasterwork));

// Get repair cost for an item
// GET /api/workshops/repair/cost/:itemId
// Query: targetPercentage?
router.get('/repair/cost/:itemId', requireAuth, requireCharacter, asyncHandler(getRepairCost));

// Check if character can repair an item
// GET /api/workshops/repair/check/:itemId
router.get('/repair/check/:itemId', requireAuth, requireCharacter, asyncHandler(checkCanRepair));

// Repair an item
// POST /api/workshops/repair/:itemId
// Body: { targetPercentage? }
router.post('/repair/:itemId', requireAuth, requireCharacter, requireCsrfToken, repairLimiter, checkGoldDuplication(), asyncHandler(repairItem));

// Get specific workshop information (keep this last to avoid route conflicts)
// GET /api/workshops/:workshopId
router.get('/:workshopId', requireAuth, asyncHandler(getWorkshopInfo));

export default router;
