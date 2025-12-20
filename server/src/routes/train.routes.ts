/**
 * Train Routes
 *
 * API routes for train travel and robbery system
 *
 * SECURITY: Protected with validation, CSRF, rate limiting, and anti-exploit middleware
 */

import { Router } from 'express';
import { TrainController } from '../controllers/train.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../validation/middleware';
import { TrainSchemas } from '../validation/schemas';
import { requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { transportationRateLimiter, robberyRateLimiter } from '../middleware/rateLimiter';
import { checkGoldDuplication, detectSuspiciousEarning } from '../middleware/antiExploit.middleware';

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
router.get('/search', transportationRateLimiter, asyncHandler(TrainController.searchTrains));

/**
 * GET /api/trains/routes/between
 * Get routes between two specific locations
 * Query: { origin: string, destination: string }
 */
router.get('/routes/between', transportationRateLimiter, asyncHandler(TrainController.getRoutesBetween));

/**
 * GET /api/trains/location/:locationId/departures
 * Get all trains departing from a location
 */
router.get('/location/:locationId/departures', transportationRateLimiter, asyncHandler(TrainController.getTrainsAtLocation));

// --- Ticket Routes ---

/**
 * GET /api/trains/tickets
 * Get character's train tickets
 * Query: { includeUsed?: boolean }
 */
router.get('/tickets', transportationRateLimiter, asyncHandler(TrainController.getTickets));

/**
 * POST /api/trains/tickets/purchase
 * Purchase a train ticket
 * Body: { origin: string, destination: string, ticketClass: TicketClass, departureTime?: string }
 * SECURITY: CSRF, validation, rate limiting, gold duplication check
 */
router.post(
  '/tickets/purchase',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(TrainSchemas.purchaseTicket),
  checkGoldDuplication(),
  asyncHandler(TrainController.purchaseTicket)
);

/**
 * POST /api/trains/tickets/:ticketId/board
 * Board a train using a ticket
 */
router.post(
  '/tickets/:ticketId/board',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(TrainSchemas.boardTrain),
  asyncHandler(TrainController.boardTrain)
);

/**
 * POST /api/trains/tickets/:ticketId/refund
 * Refund a train ticket
 * SECURITY: CSRF, validation, rate limiting, gold duplication check (refund could be exploited)
 */
router.post(
  '/tickets/:ticketId/refund',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(TrainSchemas.refundTicket),
  checkGoldDuplication(),
  asyncHandler(TrainController.refundTicket)
);

// --- Cargo Routes ---

/**
 * POST /api/trains/cargo/quote
 * Get a cargo shipping quote
 * Body: { origin: string, destination: string, cargo: TrainCargoItem[], insured?: boolean }
 */
router.post(
  '/cargo/quote',
  transportationRateLimiter,
  validate(TrainSchemas.shipCargo),
  asyncHandler(TrainController.getCargoQuote)
);

/**
 * POST /api/trains/cargo/ship
 * Ship cargo via train
 * Body: { origin: string, destination: string, cargo: TrainCargoItem[], insured?: boolean }
 * SECURITY: CSRF, validation, rate limiting, gold duplication check
 */
router.post(
  '/cargo/ship',
  requireCsrfTokenWithRotation,
  transportationRateLimiter,
  validate(TrainSchemas.shipCargo),
  checkGoldDuplication(),
  asyncHandler(TrainController.shipCargo)
);

// --- Robbery Routes ---

/**
 * GET /api/trains/robbery/plans
 * Get character's robbery plans
 */
router.get('/robbery/plans', robberyRateLimiter, asyncHandler(TrainController.getRobberyPlans));

/**
 * GET /api/trains/robbery/pursuit
 * Get active Pinkerton pursuit for character
 */
router.get('/robbery/pursuit', robberyRateLimiter, asyncHandler(TrainController.getActivePursuit));

/**
 * GET /api/trains/robbery/:robberyId
 * Get a specific robbery plan
 */
router.get('/robbery/:robberyId', robberyRateLimiter, asyncHandler(TrainController.getRobberyPlan));

/**
 * POST /api/trains/robbery/scout
 * Scout a train for robbery intelligence
 * Body: { trainId: string }
 * SECURITY: CSRF, validation, rate limiting
 */
router.post(
  '/robbery/scout',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(TrainSchemas.scoutTrain),
  asyncHandler(TrainController.scoutTrain)
);

/**
 * POST /api/trains/robbery/plan
 * Plan a train robbery
 * Body: { trainId, departureTime, approach, targetLocation, gangMemberIds, equipment }
 * SECURITY: CSRF, validation, rate limiting
 */
router.post(
  '/robbery/plan',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(TrainSchemas.planRobbery),
  asyncHandler(TrainController.planRobbery)
);

/**
 * POST /api/trains/robbery/:robberyId/execute
 * Execute a planned train robbery
 * SECURITY: CSRF, validation, rate limiting, gold duplication check, suspicious earning detection
 */
router.post(
  '/robbery/:robberyId/execute',
  requireCsrfTokenWithRotation,
  robberyRateLimiter,
  validate(TrainSchemas.executeRobbery),
  checkGoldDuplication(),
  detectSuspiciousEarning(),
  asyncHandler(TrainController.executeRobbery)
);

export default router;
