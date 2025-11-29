/**
 * Stagecoach Routes
 *
 * API routes for stagecoach travel and ambush system
 */

import { Router } from 'express';
import { StagecoachController } from '../controllers/stagecoach.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

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
router.get('/tickets/active', asyncHandler(StagecoachController.getActiveTicket));

/**
 * GET /api/stagecoach/tickets/history
 * Get travel history for character
 */
router.get('/tickets/history', asyncHandler(StagecoachController.getTravelHistory));

/**
 * POST /api/stagecoach/tickets/book
 * Book a stagecoach ticket
 * Body: { routeId, departureLocationId, destinationLocationId, departureTime?, luggageWeight?, weaponDeclared? }
 */
router.post('/tickets/book', asyncHandler(StagecoachController.bookTicket));

/**
 * POST /api/stagecoach/tickets/:ticketId/cancel
 * Cancel a ticket and get refund
 */
router.post('/tickets/:ticketId/cancel', asyncHandler(StagecoachController.cancelTicket));

/**
 * GET /api/stagecoach/tickets/:ticketId/progress
 * Get travel progress for an active journey
 */
router.get('/tickets/:ticketId/progress', asyncHandler(StagecoachController.getTravelProgress));

/**
 * POST /api/stagecoach/tickets/:ticketId/complete
 * Complete a journey (for testing/admin)
 */
router.post('/tickets/:ticketId/complete', asyncHandler(StagecoachController.completeJourney));

// --- Ambush Routes ---

/**
 * GET /api/stagecoach/ambush/spots/:routeId
 * Get ambush spots for a route
 */
router.get('/ambush/spots/:routeId', asyncHandler(StagecoachController.getAmbushSpots));

/**
 * GET /api/stagecoach/ambush/spots/:routeId/:spotId
 * Get a specific ambush spot
 */
router.get('/ambush/spots/:routeId/:spotId', asyncHandler(StagecoachController.getAmbushSpot));

/**
 * GET /api/stagecoach/ambush/plan
 * Get active ambush plan for character
 */
router.get('/ambush/plan', asyncHandler(StagecoachController.getActivePlan));

/**
 * POST /api/stagecoach/ambush/setup
 * Setup an ambush
 * Body: { routeId, ambushSpotId, scheduledTime, gangMemberIds?, strategy? }
 */
router.post('/ambush/setup', asyncHandler(StagecoachController.setupAmbush));

/**
 * POST /api/stagecoach/ambush/execute
 * Execute an ambush
 * Body: { stagecoachId: string }
 */
router.post('/ambush/execute', asyncHandler(StagecoachController.executeAmbush));

/**
 * POST /api/stagecoach/ambush/cancel
 * Cancel an active ambush plan
 */
router.post('/ambush/cancel', asyncHandler(StagecoachController.cancelAmbush));

/**
 * POST /api/stagecoach/ambush/defend
 * Defend against an ambush as a passenger
 * Body: { stagecoachId: string }
 */
router.post('/ambush/defend', asyncHandler(StagecoachController.defendStagecoach));

/**
 * POST /api/stagecoach/ambush/loot/distribute
 * Calculate loot distribution for gang members
 * Body: { totalValue, loot, gangMemberIds }
 */
router.post('/ambush/loot/distribute', asyncHandler(StagecoachController.calculateLootDistribution));

export default router;
