/**
 * Worker Routes
 *
 * API endpoints for advanced worker management (training, wages, strikes, etc.)
 * Basic hire/fire is in property.routes - this handles the more complex operations
 */

import { Router } from 'express';
import { WorkerController } from '../controllers/worker.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/workers/listings
 * Generate available worker listings for hiring
 * Query: { count?: number (1-20), propertyLevel?: number }
 */
router.get('/listings', asyncHandler(WorkerController.getWorkerListings));

/**
 * POST /api/workers/hire
 * Hire a worker from listings
 * Body: { propertyId: string, characterId: string, listing: WorkerListing }
 */
router.post('/hire', requireCsrfToken, asyncHandler(WorkerController.hireWorker));

/**
 * POST /api/workers/pay-wages
 * Pay wages to all workers due
 * Body: { characterId: string }
 */
router.post('/pay-wages', requireCsrfToken, asyncHandler(WorkerController.payWages));

/**
 * GET /api/workers/property/:propertyId
 * Get all workers for a property
 */
router.get('/property/:propertyId', asyncHandler(WorkerController.getPropertyWorkers));

/**
 * GET /api/workers/property/:propertyId/available
 * Get available (unassigned) workers for a property
 */
router.get('/property/:propertyId/available', asyncHandler(WorkerController.getAvailableWorkers));

/**
 * GET /api/workers/:workerId
 * Get worker details
 */
router.get('/:workerId', asyncHandler(WorkerController.getWorkerDetails));

/**
 * POST /api/workers/:workerId/fire
 * Fire a worker
 * Body: { characterId: string }
 */
router.post('/:workerId/fire', requireCsrfToken, asyncHandler(WorkerController.fireWorker));

/**
 * POST /api/workers/:workerId/train
 * Train a worker to increase skill
 * Body: { characterId: string }
 */
router.post('/:workerId/train', requireCsrfToken, asyncHandler(WorkerController.trainWorker));

/**
 * POST /api/workers/:workerId/rest
 * Rest a worker to restore morale
 * Body: { characterId: string }
 */
router.post('/:workerId/rest', requireCsrfToken, asyncHandler(WorkerController.restWorker));

/**
 * POST /api/workers/:workerId/resolve-strike
 * Resolve a worker strike
 * Body: { characterId: string, bonus?: number }
 */
router.post('/:workerId/resolve-strike', requireCsrfToken, asyncHandler(WorkerController.resolveStrike));

export default router;
