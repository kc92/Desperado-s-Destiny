/**
 * Entertainer Routes
 *
 * API routes for the wandering entertainer system
 * Part of Phase 4, Wave 4.1 - Entertainment System
 */

import { Router } from 'express';
import {
  getAllEntertainers,
  getEntertainerDetails,
  getEntertainersByPerformanceType,
  getEntertainersAtLocation,
  getLocationPerformances,
  getEntertainerLocation,
  getEntertainerSchedule,
  isEntertainerPerforming,
  searchEntertainers,
  watchPerformance,
  learnSkill,
  getGossipFromEntertainer,
  getRecommendedPerformances,
  checkAffordPerformance
} from '../controllers/entertainer.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { checkGoldDuplication } from '../middleware/antiExploit.middleware';

const router = Router();

/**
 * Public routes (no authentication required)
 * These provide information about entertainers without requiring login
 */

// Get all entertainers
router.get('/', asyncHandler(getAllEntertainers));

// Search entertainers by name
router.get('/search', asyncHandler(searchEntertainers));

// Get entertainers by performance type
router.get('/type/:type', asyncHandler(getEntertainersByPerformanceType));

// Get entertainers at a specific location
router.get('/location/:locationId', asyncHandler(getEntertainersAtLocation));

// Get available performances at a location
router.get('/performances/location/:locationId', asyncHandler(getLocationPerformances));

/**
 * Protected routes (require authentication and active character)
 * Note: These must come before /:entertainerId routes to avoid param matching
 */

// Get recommended performances for the character
router.get('/recommendations', requireAuth, requireCharacter, asyncHandler(getRecommendedPerformances));

/**
 * Public routes with entertainer ID parameter
 */

// Get entertainer details
router.get('/:entertainerId', asyncHandler(getEntertainerDetails));

// Get entertainer's current location
router.get('/:entertainerId/location', asyncHandler(getEntertainerLocation));

// Get entertainer schedule
router.get('/:entertainerId/schedule', asyncHandler(getEntertainerSchedule));

// Check if entertainer is currently performing
router.get('/:entertainerId/performing', asyncHandler(isEntertainerPerforming));

/**
 * Protected routes with entertainer ID parameter
 */

// Get gossip from an entertainer (requires trust)
router.get('/:entertainerId/gossip', requireAuth, requireCharacter, asyncHandler(getGossipFromEntertainer));

// Check if character can afford a performance
router.get(
  '/:entertainerId/performances/:performanceId/check-afford',
  requireAuth,
  requireCharacter,
  asyncHandler(checkAffordPerformance)
);

// Watch a performance (costs energy, gives rewards)
router.post(
  '/:entertainerId/performances/:performanceId/watch',
  requireAuth,
  requireCharacter,
  requireCsrfToken,
  asyncHandler(watchPerformance)
);

// Learn a skill from an entertainer (costs energy and gold, requires trust)
router.post(
  '/:entertainerId/skills/:skillId/learn',
  requireAuth,
  requireCharacter,
  requireCsrfToken,
  checkGoldDuplication(),
  asyncHandler(learnSkill)
);

export default router;
