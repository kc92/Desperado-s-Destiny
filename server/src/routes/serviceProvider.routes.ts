/**
 * Service Provider Routes
 *
 * API routes for wandering service provider interactions
 */

import express from 'express';
import {
  getProvidersAtLocation,
  getProviderSchedule,
  getAvailableServices,
  useService,
  getAllProviders,
} from '../controllers/serviceProvider.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = express.Router();

/**
 * Public routes (no auth required)
 */

// Get all service providers
router.get('/', asyncHandler(getAllProviders));

// Get provider schedule
router.get('/:providerId/schedule', asyncHandler(getProviderSchedule));

/**
 * Protected routes (auth required)
 */

// Get service providers at a location
router.get('/location/:locationId', requireAuth, asyncHandler(getProvidersAtLocation));

// Get available services from a provider
router.get('/:providerId/services', requireAuth, asyncHandler(getAvailableServices));

// Use a service
router.post('/:providerId/use-service', requireAuth, requireCsrfToken, asyncHandler(useService));

export default router;
