/**
 * Gang Business Routes
 *
 * Phase 15: Gang Businesses
 *
 * API endpoints for gang business and protection racket operations
 */

import { Router } from 'express';
import { GangBusinessController } from '../controllers/gangBusiness.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

// =============================================================================
// Gang Business Management
// =============================================================================

/**
 * GET /api/gang-businesses/gang/:gangId
 * Get all businesses owned by a gang
 */
router.get('/gang/:gangId', asyncHandler(GangBusinessController.getGangBusinesses));

/**
 * POST /api/gang-businesses/gang/:gangId/purchase
 * Purchase a new business for the gang (Leader only)
 */
router.post(
  '/gang/:gangId/purchase',
  requireCsrfToken,
  asyncHandler(GangBusinessController.purchaseBusiness)
);

/**
 * POST /api/gang-businesses/:businessId/transfer-to-gang
 * Transfer a player's business to their gang
 */
router.post(
  '/:businessId/transfer-to-gang',
  requireCsrfToken,
  asyncHandler(GangBusinessController.transferToGang)
);

/**
 * POST /api/gang-businesses/gang/:gangId/businesses/:businessId/collect
 * Collect revenue from gang business (Officer+ only)
 */
router.post(
  '/gang/:gangId/businesses/:businessId/collect',
  requireCsrfToken,
  asyncHandler(GangBusinessController.collectRevenue)
);

/**
 * PUT /api/gang-businesses/gang/:gangId/businesses/:businessId/manager
 * Set manager for gang business (Leader only)
 */
router.put(
  '/gang/:gangId/businesses/:businessId/manager',
  requireCsrfToken,
  asyncHandler(GangBusinessController.setManager)
);

/**
 * PUT /api/gang-businesses/gang/:gangId/businesses/:businessId/revenue-share
 * Update revenue share percentage (Leader only)
 */
router.put(
  '/gang/:gangId/businesses/:businessId/revenue-share',
  requireCsrfToken,
  asyncHandler(GangBusinessController.setRevenueShare)
);

/**
 * POST /api/gang-businesses/gang/:gangId/businesses/:businessId/sell
 * Sell a gang business (Leader only)
 */
router.post(
  '/gang/:gangId/businesses/:businessId/sell',
  requireCsrfToken,
  asyncHandler(GangBusinessController.sellBusiness)
);

// =============================================================================
// Protection Racket
// =============================================================================

/**
 * POST /api/gang-businesses/gang/:gangId/protection/offer
 * Offer protection to a business (Officer+ only)
 */
router.post(
  '/gang/:gangId/protection/offer',
  requireCsrfToken,
  asyncHandler(GangBusinessController.offerProtection)
);

/**
 * GET /api/gang-businesses/gang/:gangId/protection
 * Get all protection contracts for a gang
 */
router.get('/gang/:gangId/protection', asyncHandler(GangBusinessController.getGangProtectionContracts));

/**
 * GET /api/gang-businesses/businesses/:businessId/protection
 * Get protection status for a business
 */
router.get(
  '/businesses/:businessId/protection',
  asyncHandler(GangBusinessController.getBusinessProtectionStatus)
);

/**
 * POST /api/gang-businesses/protection/:contractId/respond
 * Business owner responds to protection offer
 */
router.post(
  '/protection/:contractId/respond',
  requireCsrfToken,
  asyncHandler(GangBusinessController.respondToProtectionOffer)
);

/**
 * POST /api/gang-businesses/protection/:contractId/terminate
 * Terminate a protection contract
 */
router.post(
  '/protection/:contractId/terminate',
  requireCsrfToken,
  asyncHandler(GangBusinessController.terminateProtection)
);

/**
 * GET /api/gang-businesses/my-protection-offers
 * Get pending protection offers for the authenticated character's businesses
 */
router.get('/my-protection-offers', asyncHandler(GangBusinessController.getMyProtectionOffers));

export default router;
