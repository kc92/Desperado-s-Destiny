/**
 * Train Routes
 *
 * API routes for train travel and robbery system
 */

import { Router } from 'express';
import { TrainController } from '../controllers/train.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * GET /api/trains/routes
 * Get all available train routes
 */
router.get('/routes', asyncHandler(TrainController.getRoutes));

/**
 * GET /api/trains/schedules
 * Get all train schedules
 */
router.get('/schedules', asyncHandler(TrainController.getSchedules));

/**
 * GET /api/trains/station/:locationId
 * Check if a location has a train station
 */
router.get('/station/:locationId', asyncHandler(TrainController.checkStation));

/**
 * GET /api/trains/:trainId
 * Get information about a specific train
 */
router.get('/:trainId', asyncHandler(TrainController.getTrainInfo));

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(requireAuth);
router.use(requireCharacter);

// --- Travel Routes ---

/**
 * GET /api/trains/search
 * Search for available trains between two locations
 * Query: { origin: string, destination: string, afterTime?: string }
 */
router.get('/search', asyncHandler(TrainController.searchTrains));

/**
 * GET /api/trains/routes/between
 * Get routes between two specific locations
 * Query: { origin: string, destination: string }
 */
router.get('/routes/between', asyncHandler(TrainController.getRoutesBetween));

/**
 * GET /api/trains/location/:locationId/departures
 * Get all trains departing from a location
 */
router.get('/location/:locationId/departures', asyncHandler(TrainController.getTrainsAtLocation));

// --- Ticket Routes ---

/**
 * GET /api/trains/tickets
 * Get character's train tickets
 * Query: { includeUsed?: boolean }
 */
router.get('/tickets', asyncHandler(TrainController.getTickets));

/**
 * POST /api/trains/tickets/purchase
 * Purchase a train ticket
 * Body: { origin: string, destination: string, ticketClass: TicketClass, departureTime?: string }
 */
router.post('/tickets/purchase', asyncHandler(TrainController.purchaseTicket));

/**
 * POST /api/trains/tickets/:ticketId/board
 * Board a train using a ticket
 */
router.post('/tickets/:ticketId/board', asyncHandler(TrainController.boardTrain));

/**
 * POST /api/trains/tickets/:ticketId/refund
 * Refund a train ticket
 */
router.post('/tickets/:ticketId/refund', asyncHandler(TrainController.refundTicket));

// --- Cargo Routes ---

/**
 * POST /api/trains/cargo/quote
 * Get a cargo shipping quote
 * Body: { origin: string, destination: string, cargo: TrainCargoItem[], insured?: boolean }
 */
router.post('/cargo/quote', asyncHandler(TrainController.getCargoQuote));

/**
 * POST /api/trains/cargo/ship
 * Ship cargo via train
 * Body: { origin: string, destination: string, cargo: TrainCargoItem[], insured?: boolean }
 */
router.post('/cargo/ship', asyncHandler(TrainController.shipCargo));

// --- Robbery Routes ---

/**
 * GET /api/trains/robbery/plans
 * Get character's robbery plans
 */
router.get('/robbery/plans', asyncHandler(TrainController.getRobberyPlans));

/**
 * GET /api/trains/robbery/pursuit
 * Get active Pinkerton pursuit for character
 */
router.get('/robbery/pursuit', asyncHandler(TrainController.getActivePursuit));

/**
 * GET /api/trains/robbery/:robberyId
 * Get a specific robbery plan
 */
router.get('/robbery/:robberyId', asyncHandler(TrainController.getRobberyPlan));

/**
 * POST /api/trains/robbery/scout
 * Scout a train for robbery intelligence
 * Body: { trainId: string }
 */
router.post('/robbery/scout', asyncHandler(TrainController.scoutTrain));

/**
 * POST /api/trains/robbery/plan
 * Plan a train robbery
 * Body: { trainId, departureTime, approach, targetLocation, gangMemberIds, equipment }
 */
router.post('/robbery/plan', asyncHandler(TrainController.planRobbery));

/**
 * POST /api/trains/robbery/:robberyId/execute
 * Execute a planned train robbery
 */
router.post('/robbery/:robberyId/execute', asyncHandler(TrainController.executeRobbery));

export default router;
