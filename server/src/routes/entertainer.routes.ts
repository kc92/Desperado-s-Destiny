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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

/**
 * Public routes (no authentication required)
 * These provide information about entertainers without requiring login
 */

// Get all entertainers
router.get('/', getAllEntertainers);

// Search entertainers by name
router.get('/search', searchEntertainers);

// Get entertainers by performance type
router.get('/type/:type', getEntertainersByPerformanceType);

// Get entertainers at a specific location
router.get('/location/:locationId', getEntertainersAtLocation);

// Get available performances at a location
router.get('/performances/location/:locationId', getLocationPerformances);

/**
 * Protected routes (require authentication and active character)
 * Note: These must come before /:entertainerId routes to avoid param matching
 */

// Get recommended performances for the character
router.get('/recommendations', requireAuth, requireCharacter, getRecommendedPerformances);

/**
 * Public routes with entertainer ID parameter
 */

// Get entertainer details
router.get('/:entertainerId', getEntertainerDetails);

// Get entertainer's current location
router.get('/:entertainerId/location', getEntertainerLocation);

// Get entertainer schedule
router.get('/:entertainerId/schedule', getEntertainerSchedule);

// Check if entertainer is currently performing
router.get('/:entertainerId/performing', isEntertainerPerforming);

/**
 * Protected routes with entertainer ID parameter
 */

// Get gossip from an entertainer (requires trust)
router.get('/:entertainerId/gossip', requireAuth, requireCharacter, getGossipFromEntertainer);

// Check if character can afford a performance
router.get(
  '/:entertainerId/performances/:performanceId/check-afford',
  requireAuth,
  requireCharacter,
  checkAffordPerformance
);

// Watch a performance (costs energy, gives rewards)
router.post(
  '/:entertainerId/performances/:performanceId/watch',
  requireAuth,
  requireCharacter,
  watchPerformance
);

// Learn a skill from an entertainer (costs energy and gold, requires trust)
router.post(
  '/:entertainerId/skills/:skillId/learn',
  requireAuth,
  requireCharacter,
  learnSkill
);

export default router;
