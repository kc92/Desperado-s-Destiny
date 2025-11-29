/**
 * Workshop Routes
 * API routes for workshop access, masterwork crafting, and repairs
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
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
router.get('/summary', requireAuth, getAllWorkshopsSummary);

// Get quality tier information
// GET /api/workshops/quality-tiers
router.get('/quality-tiers', requireAuth, getQualityTiers);

// Get workshop recommendations for character
// GET /api/workshops/recommendations
router.get('/recommendations', requireAuth, requireCharacter, getRecommendations);

// Get workshops at a specific location
// GET /api/workshops/location/:locationId
router.get('/location/:locationId', requireAuth, getLocationWorkshops);

// Get workshops by profession
// GET /api/workshops/profession/:professionId
// Query: minTier?, location?
router.get('/profession/:professionId', requireAuth, requireCharacter, getWorkshopsByProfession);

// Find best workshop for a profession
// GET /api/workshops/best/:professionId
router.get('/best/:professionId', requireAuth, requireCharacter, findBestWorkshop);

// Request access to a workshop
// POST /api/workshops/access
// Body: { workshopId, duration?, membershipType? }
router.post('/access', requireAuth, requireCharacter, workshopLimiter, requestAccess);

// Rename a masterwork item
// POST /api/workshops/masterwork/rename
// Body: { itemId, newName }
router.post('/masterwork/rename', requireAuth, requireCharacter, workshopLimiter, renameMasterwork);

// Get repair cost for an item
// GET /api/workshops/repair/cost/:itemId
// Query: targetPercentage?
router.get('/repair/cost/:itemId', requireAuth, requireCharacter, getRepairCost);

// Check if character can repair an item
// GET /api/workshops/repair/check/:itemId
router.get('/repair/check/:itemId', requireAuth, requireCharacter, checkCanRepair);

// Repair an item
// POST /api/workshops/repair/:itemId
// Body: { targetPercentage? }
router.post('/repair/:itemId', requireAuth, requireCharacter, repairLimiter, repairItem);

// Get specific workshop information (keep this last to avoid route conflicts)
// GET /api/workshops/:workshopId
router.get('/:workshopId', requireAuth, getWorkshopInfo);

export default router;
