import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller';

const router = Router();

/**
 * Health check route
 * GET /health
 * Returns the health status of the server and its dependencies
 */
router.get('/', getHealthStatus);

export default router;
