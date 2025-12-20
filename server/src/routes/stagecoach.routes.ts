/**
 * Stagecoach Routes
 *
 * API routes for stagecoach travel and ambush system
 *
 * SECURITY: Protected with validation, CSRF, rate limiting, and anti-exploit middleware
 */

import { Router } from 'express';
import { StagecoachController } from '../controllers/stagecoach.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../validation/middleware';
import { StagecoachSchemas } from '../validation/schemas';
import { requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { transportationRateLimiter, robberyRateLimiter } from '../middleware/rateLimiter';
import { checkGoldDuplication, detectSuspiciousEarning } from '../middleware/antiExploit.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * GET /api/stagecoach/routes
 * Get all available stagecoach routes
 */
router.get('/routes', asyncHandler(StagecoachController.getRoutes));

/**
 * GET /api/stagecoach/way-stations
 * Get all way stations
 */
router.get('/way-stations', asyncHandler(StagecoachController.getWayStations));

/**
 * GET /api/stagecoach/routes/:routeId
 * Get details for a specific route
 */
router.get('/routes/:routeId', asyncHandler(StagecoachController.getRouteDetails));

/**
 * GET /api/stagecoach/routes/:routeId/departures
 * Get upcoming departures for a route
 */
router.get('/routes/:routeId/departures', asyncHandler(StagecoachController.getUpcomingDepartures));

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(requireAuth);
router.use(requireCharacter);

// --- Ticket Routes ---

/**
 * GET /api/stagecoach/tickets/active
 * Get active ticket for character
 */
router.get('/tickets/active', transportationRateLimiter, asyncHandler(StagecoachController.getActiveTicket));

/**
 * GET /api/stagecoach/tickets/history
 * Get travel history for character
 */
router.get('/tickets/history', transportationRateLimiter, asyncHandler(StagecoachController.getTravelHistory));

/**
 * POST /api/stagecoach/tickets/book
 * Book a stagecoach ticket
 * Body: { routeId, departureLocationId, destinationLocationId, departureTime?, luggageWeight?, weaponDeclared? }
 * SECURITY: CSRF, validation, rate limiting, gold duplication check
 */
router.post(
  '/tickets/book',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(StagecoachSchemas.bookTicket),
  checkGoldDuplication(),
  asyncHandler(StagecoachController.bookTicket)
);

/**
 * POST /api/stagecoach/tickets/:ticketId/cancel
 * Cancel a ticket and get refund
 * SECURITY: CSRF, validation, rate limiting, gold duplication check (refund could be exploited)
 */
router.post(
  '/tickets/:ticketId/cancel',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(StagecoachSchemas.cancelTicket),
  checkGoldDuplication(),
  asyncHandler(StagecoachController.cancelTicket)
);

/**
 * GET /api/stagecoach/tickets/:ticketId/progress
 * Get travel progress for an active journey
 */
router.get(
  '/tickets/:ticketId/progress',
  transportationRateLimiter,
  validate(StagecoachSchemas.getTravelProgress),
  asyncHandler(StagecoachController.getTravelProgress)
);

/**
 * POST /api/stagecoach/tickets/:ticketId/complete
 * Complete a journey (for testing/admin)
 */
router.post(
  '/tickets/:ticketId/complete',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(StagecoachSchemas.completeJourney),
  asyncHandler(StagecoachController.completeJourney)
);

// --- Ambush Routes ---

/**
 * GET /api/stagecoach/ambush/spots/:routeId
 * Get ambush spots for a route
 */
router.get(
  '/ambush/spots/:routeId',
  robberyRateLimiter,
  validate(StagecoachSchemas.getAmbushSpots),
  asyncHandler(StagecoachController.getAmbushSpots)
);

/**
 * GET /api/stagecoach/ambush/spots/:routeId/:spotId
 * Get a specific ambush spot
 */
router.get(
  '/ambush/spots/:routeId/:spotId',
  robberyRateLimiter,
  validate(StagecoachSchemas.getAmbushSpot),
  asyncHandler(StagecoachController.getAmbushSpot)
);

/**
 * GET /api/stagecoach/ambush/plan
 * Get active ambush plan for character
 */
router.get('/ambush/plan', robberyRateLimiter, asyncHandler(StagecoachController.getActivePlan));

/**
 * POST /api/stagecoach/ambush/setup
 * Setup an ambush
 * Body: { routeId, ambushSpotId, scheduledTime, gangMemberIds?, strategy? }
 * SECURITY: CSRF, validation, rate limiting
 */
router.post(
  '/ambush/setup',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(StagecoachSchemas.setupAmbush),
  asyncHandler(StagecoachController.setupAmbush)
);

/**
 * POST /api/stagecoach/ambush/execute
 * Execute an ambush
 * Body: { stagecoachId: string }
 * SECURITY: CSRF, validation, rate limiting, gold duplication check, suspicious earning detection
 */
router.post(
  '/ambush/execute',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(StagecoachSchemas.executeAmbush),
  checkGoldDuplication(),
  detectSuspiciousEarning(),
  asyncHandler(StagecoachController.executeAmbush)
);

/**
 * POST /api/stagecoach/ambush/cancel
 * Cancel an active ambush plan
 * SECURITY: CSRF, rate limiting
 */
router.post(
  '/ambush/cancel',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  asyncHandler(StagecoachController.cancelAmbush)
);

/**
 * POST /api/stagecoach/ambush/defend
 * Defend against an ambush as a passenger
 * Body: { stagecoachId: string }
 * SECURITY: CSRF, validation, rate limiting
 */
router.post(
  '/ambush/defend',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(StagecoachSchemas.defendStagecoach),
  asyncHandler(StagecoachController.defendStagecoach)
);

/**
 * POST /api/stagecoach/ambush/loot/distribute
 * Calculate loot distribution for gang members
 * Body: { totalValue, loot, gangMemberIds }
 * SECURITY: CSRF, validation, rate limiting, gold duplication check
 */
router.post(
  '/ambush/loot/distribute',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(StagecoachSchemas.distributeLoot),
  checkGoldDuplication(),
  asyncHandler(StagecoachController.calculateLootDistribution)
);

export default router;
