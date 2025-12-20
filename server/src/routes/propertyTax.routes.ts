/**
 * Property Tax Routes
 *
 * API endpoints for property tax management
 */

import { Router } from 'express';
import { PropertyTaxController } from '../controllers/propertyTax.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/property-tax/summary
 * Get tax summary for an owner
 * Query: { ownerId: string }
 */
router.get('/summary', asyncHandler(PropertyTaxController.getOwnerTaxSummary));

/**
 * GET /api/property-tax/:propertyId/calculate
 * Calculate taxes for a specific property
 */
router.get('/:propertyId/calculate', asyncHandler(PropertyTaxController.calculateTaxes));

/**
 * POST /api/property-tax/:propertyId/pay
 * Pay taxes for a property
 * Body: { payerId: string, amount: number }
 */
router.post('/:propertyId/pay', requireCsrfToken, asyncHandler(PropertyTaxController.payTaxes));

/**
 * POST /api/property-tax/:propertyId/auto-pay
 * Enable or disable auto-pay for a property
 * Body: { ownerId: string, enabled: boolean }
 */
router.post('/:propertyId/auto-pay', requireCsrfToken, asyncHandler(PropertyTaxController.setAutoPay));

/**
 * POST /api/property-tax/gang-base/:gangBaseId/create
 * Create or update tax record for a gang base
 */
router.post(
  '/gang-base/:gangBaseId/create',
  requireCsrfToken,
  asyncHandler(PropertyTaxController.createGangBaseTaxRecord)
);

/**
 * POST /api/property-tax/process-auto-payments
 * Process all pending auto-payments (Admin/System)
 */
router.post('/process-auto-payments', requireCsrfToken, asyncHandler(PropertyTaxController.processAutoPayments));

/**
 * POST /api/property-tax/send-reminders
 * Send tax due reminders (Admin/System)
 */
router.post('/send-reminders', requireCsrfToken, asyncHandler(PropertyTaxController.sendReminders));

export default router;
