/**
 * Gravestone Routes
 * API routes for gravestone and inheritance operations
 */

import { Router } from 'express';
import {
  getGravestonesAtLocation,
  getUserGravestones,
  getUnclaimedGravestones,
  getGravestone,
  getInheritancePreview,
  claimInheritance,
  canClaimGravestone,
  getGraveyardStats,
  getRecentDeaths
} from '../controllers/gravestone.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// All gravestone routes require authentication
router.use(requireAuth);

/**
 * GET /api/gravestones/stats
 * Get graveyard statistics for the user
 */
router.get('/stats', asyncHandler(getGraveyardStats));

/**
 * GET /api/gravestones/mine
 * Get user's gravestones (their dead characters)
 */
router.get('/mine', asyncHandler(getUserGravestones));

/**
 * GET /api/gravestones/unclaimed
 * Get unclaimed gravestones for the user
 */
router.get('/unclaimed', asyncHandler(getUnclaimedGravestones));

/**
 * GET /api/gravestones/recent
 * Get recent deaths for world news
 */
router.get('/recent', asyncHandler(getRecentDeaths));

/**
 * GET /api/gravestones/location/:locationId
 * Get gravestones at a specific location
 */
router.get('/location/:locationId', requireCharacter, asyncHandler(getGravestonesAtLocation));

/**
 * GET /api/gravestones/:id
 * Get a specific gravestone by ID
 */
router.get('/:id', asyncHandler(getGravestone));

/**
 * GET /api/gravestones/:id/preview
 * Get inheritance preview for a gravestone
 */
router.get('/:id/preview', asyncHandler(getInheritancePreview));

/**
 * GET /api/gravestones/:id/can-claim
 * Check if current character can claim a gravestone
 */
router.get('/:id/can-claim', requireCharacter, asyncHandler(canClaimGravestone));

/**
 * POST /api/gravestones/:id/claim
 * Claim inheritance from a gravestone
 */
router.post('/:id/claim', requireCsrfToken, requireCharacter, asyncHandler(claimInheritance));

export default router;
