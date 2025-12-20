/**
 * Foreclosure Routes
 *
 * API endpoints for property foreclosure, auctions, and bankruptcy
 */

import { Router } from 'express';
import { ForeclosureController } from '../controllers/foreclosure.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/foreclosure/auctions
 * Get all active property auctions
 */
router.get('/auctions', asyncHandler(ForeclosureController.getActiveAuctions));

/**
 * GET /api/foreclosure/auctions/:auctionId
 * Get specific auction details
 */
router.get('/auctions/:auctionId', asyncHandler(ForeclosureController.getAuction));

/**
 * POST /api/foreclosure/auctions/:auctionId/bid
 * Place a bid on an auction
 * Body: { bidderId: string, amount: number }
 */
router.post('/auctions/:auctionId/bid', requireCsrfToken, asyncHandler(ForeclosureController.placeBid));

/**
 * POST /api/foreclosure/auctions/:auctionId/cancel
 * Cancel an auction
 * Body: { reason: string }
 */
router.post('/auctions/:auctionId/cancel', requireCsrfToken, asyncHandler(ForeclosureController.cancelAuction));

/**
 * POST /api/foreclosure/delinquency/:delinquencyId/auction
 * Create an auction for a delinquent property
 */
router.post(
  '/delinquency/:delinquencyId/auction',
  requireCsrfToken,
  asyncHandler(ForeclosureController.createAuction)
);

/**
 * POST /api/foreclosure/delinquency/:delinquencyId/bankruptcy
 * Declare bankruptcy for a delinquent property
 * Body: { declarerId: string }
 */
router.post(
  '/delinquency/:delinquencyId/bankruptcy',
  requireCsrfToken,
  asyncHandler(ForeclosureController.declareBankruptcy)
);

/**
 * POST /api/foreclosure/delinquency/:delinquencyId/resolve-bankruptcy
 * Resolve bankruptcy (success or failure)
 * Body: { success: boolean, paidAmount?: number }
 */
router.post(
  '/delinquency/:delinquencyId/resolve-bankruptcy',
  requireCsrfToken,
  asyncHandler(ForeclosureController.resolveBankruptcy)
);

/**
 * POST /api/foreclosure/process-ended-auctions
 * Complete all ended auctions (Admin/System)
 */
router.post('/process-ended-auctions', requireCsrfToken, asyncHandler(ForeclosureController.processEndedAuctions));

/**
 * POST /api/foreclosure/process-bankruptcies
 * Process expired bankruptcies (Admin/System)
 */
router.post(
  '/process-bankruptcies',
  requireCsrfToken,
  asyncHandler(ForeclosureController.processBankruptcyExpirations)
);

export default router;
