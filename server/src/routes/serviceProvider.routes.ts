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
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

/**
 * Public routes (no auth required)
 */

// Get all service providers
router.get('/', getAllProviders);

// Get provider schedule
router.get('/:providerId/schedule', getProviderSchedule);

/**
 * Protected routes (auth required)
 */

// Get service providers at a location
router.get('/location/:locationId', requireAuth, getProvidersAtLocation);

// Get available services from a provider
router.get('/:providerId/services', requireAuth, getAvailableServices);

// Use a service
router.post('/:providerId/use-service', requireAuth, useService);

export default router;
