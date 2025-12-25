/**
 * Business Routes
 *
 * Phase 12: Business Ownership System
 *
 * API endpoints for business operations
 */

import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

// =============================================================================
// Owner Endpoints
// =============================================================================

/**
 * GET /api/businesses/my-businesses
 * Get all businesses owned by the authenticated character
 */
router.get('/my-businesses', asyncHandler(BusinessController.getMyBusinesses));

/**
 * POST /api/businesses/establish
 * Establish a new business on a property
 */
router.post('/establish', requireCsrfToken, asyncHandler(BusinessController.establishBusiness));

/**
 * GET /api/businesses/:businessId
 * Get business details
 */
router.get('/:businessId', asyncHandler(BusinessController.getBusinessDetails));

/**
 * PUT /api/businesses/:businessId/services/:serviceId/price
 * Update service price
 */
router.put(
  '/:businessId/services/:serviceId/price',
  requireCsrfToken,
  asyncHandler(BusinessController.updateServicePrice)
);

/**
 * POST /api/businesses/:businessId/services/:serviceId/toggle
 * Toggle service active state
 */
router.post(
  '/:businessId/services/:serviceId/toggle',
  requireCsrfToken,
  asyncHandler(BusinessController.toggleService)
);

/**
 * POST /api/businesses/:businessId/staff/assign
 * Assign worker to business
 */
router.post(
  '/:businessId/staff/assign',
  requireCsrfToken,
  asyncHandler(BusinessController.assignStaff)
);

/**
 * DELETE /api/businesses/:businessId/staff/:workerId
 * Remove staff from business
 */
router.delete(
  '/:businessId/staff/:workerId',
  requireCsrfToken,
  asyncHandler(BusinessController.removeStaff)
);

/**
 * POST /api/businesses/:businessId/collect
 * Collect pending revenue
 */
router.post(
  '/:businessId/collect',
  requireCsrfToken,
  asyncHandler(BusinessController.collectRevenue)
);

/**
 * GET /api/businesses/:businessId/statistics
 * Get business statistics
 */
router.get('/:businessId/statistics', asyncHandler(BusinessController.getStatistics));

/**
 * POST /api/businesses/:businessId/close
 * Close a business
 */
router.post(
  '/:businessId/close',
  requireCsrfToken,
  asyncHandler(BusinessController.closeBusiness)
);

/**
 * POST /api/businesses/:businessId/reopen
 * Reopen a closed business
 */
router.post(
  '/:businessId/reopen',
  requireCsrfToken,
  asyncHandler(BusinessController.reopenBusiness)
);

// =============================================================================
// Customer Endpoints
// =============================================================================

/**
 * GET /api/businesses/location/:locationId
 * Get all businesses at a location (for customers)
 */
router.get('/location/:locationId', asyncHandler(BusinessController.getBusinessesAtLocation));

// =============================================================================
// Reference Data Endpoints
// =============================================================================

/**
 * GET /api/businesses/types/:propertyType
 * Get available business types for a property type
 */
router.get('/types/:propertyType', asyncHandler(BusinessController.getAvailableTypes));

/**
 * GET /api/businesses/services/:businessType
 * Get service definitions for a business type
 */
router.get('/services/:businessType', asyncHandler(BusinessController.getServiceDefinitions));

/**
 * GET /api/businesses/products/:businessType
 * Get product definitions for a business type
 */
router.get('/products/:businessType', asyncHandler(BusinessController.getProductDefinitions));

export default router;
