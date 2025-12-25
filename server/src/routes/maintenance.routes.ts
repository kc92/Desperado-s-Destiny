/**
 * Maintenance Routes
 *
 * Phase 14: Risk Simulation - Decay System
 *
 * Property and mining claim maintenance, repair, and condition endpoints.
 */

import { Router } from 'express';
import {
  getPropertyCondition,
  repairProperty,
  maintainProperty,
  getClaimCondition,
  rehabilitateClaim,
  getMaintenanceAlerts,
  getAssetHealth,
  getMaintenanceEstimate,
} from '../controllers/maintenance.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { validateObjectId } from '../validation/middleware';
import { rateLimitGoldTransactions, checkGoldDuplication } from '../middleware/antiExploit.middleware';

const router = Router();

// All routes require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// ========================
// Asset Overview Routes
// ========================

/**
 * GET /api/maintenance/alerts
 * Get assets needing attention (maintenance/repair)
 */
router.get('/alerts', asyncHandler(getMaintenanceAlerts));

/**
 * GET /api/maintenance/health
 * Get comprehensive asset health summary
 */
router.get('/health', asyncHandler(getAssetHealth));

/**
 * GET /api/maintenance/estimate
 * Get estimated repair/maintenance costs for all assets
 */
router.get('/estimate', asyncHandler(getMaintenanceEstimate));

// ========================
// Property Maintenance Routes
// ========================

/**
 * GET /api/maintenance/properties/:propertyId/condition
 * Get detailed condition report for a property
 */
router.get(
  '/properties/:propertyId/condition',
  validateObjectId('propertyId'),
  asyncHandler(getPropertyCondition)
);

/**
 * POST /api/maintenance/properties/:propertyId/repair
 * Repair property condition (costs dollars)
 */
router.post(
  '/properties/:propertyId/repair',
  requireCsrfToken,
  validateObjectId('propertyId'),
  rateLimitGoldTransactions(10), // Limit expensive operations
  checkGoldDuplication(),
  asyncHandler(repairProperty)
);

/**
 * POST /api/maintenance/properties/:propertyId/maintain
 * Perform maintenance action on property
 */
router.post(
  '/properties/:propertyId/maintain',
  requireCsrfToken,
  validateObjectId('propertyId'),
  asyncHandler(maintainProperty)
);

// ========================
// Mining Claim Maintenance Routes
// ========================

/**
 * GET /api/maintenance/claims/:claimId/condition
 * Get detailed condition report for a mining claim
 */
router.get(
  '/claims/:claimId/condition',
  validateObjectId('claimId'),
  asyncHandler(getClaimCondition)
);

/**
 * POST /api/maintenance/claims/:claimId/rehabilitate
 * Rehabilitate mining claim condition (costs dollars)
 */
router.post(
  '/claims/:claimId/rehabilitate',
  requireCsrfToken,
  validateObjectId('claimId'),
  rateLimitGoldTransactions(10), // Limit expensive operations
  checkGoldDuplication(),
  asyncHandler(rehabilitateClaim)
);

export default router;
