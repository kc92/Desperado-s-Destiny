import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { getHealthStatus, getServerStatus } from '../controllers/health.controller';

const router = Router();

/**
 * Health check route
 * GET /health
 * Returns the health status of the server and its dependencies
 */
router.get('/', asyncHandler(getHealthStatus));

/**
 * Server status route (public)
 * GET /health/status
 * Returns simplified status info for the public status dashboard
 */
router.get('/status', asyncHandler(getServerStatus));

export default router;
