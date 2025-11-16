import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import characterRoutes from './character.routes';
import { apiRateLimiter } from '../middleware';

const router = Router();

/**
 * API Routes
 * All routes are prefixed with /api
 */

// Health check route (no rate limiting)
router.use('/health', healthRoutes);

// Authentication routes (includes built-in rate limiting)
router.use('/auth', authRoutes);

// Character routes (with API rate limiting)
router.use('/characters', apiRateLimiter, characterRoutes);

export default router;
