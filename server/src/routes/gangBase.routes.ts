/**
 * Gang Base Routes
 *
 * API endpoints for gang headquarters/bases
 */

import { Router } from 'express';
import { GangBaseController } from '../controllers/gangBase.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { validate, validateObjectId } from '../validation/middleware';
import { GangBaseSchemas } from '../validation/schemas';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * POST /api/gangs/:gangId/base/establish
 * Establish a new gang base
 * Body: { characterId, tier?, locationType, region, coordinates? }
 */
router.post(
  '/:gangId/base/establish',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.gangIdParam),
  asyncHandler(GangBaseController.establish)
);

/**
 * GET /api/gangs/:gangId/base
 * Get gang base details
 */
router.get(
  '/:gangId/base',
  validateObjectId('gangId'),
  asyncHandler(GangBaseController.getBase)
);

/**
 * POST /api/gangs/:gangId/base/upgrade
 * Upgrade base tier
 * Body: { characterId }
 */
router.post(
  '/:gangId/base/upgrade',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.upgradeBase),
  asyncHandler(GangBaseController.upgradeTier)
);

/**
 * POST /api/gangs/:gangId/base/facility
 * Add facility to base
 * Body: { characterId, facilityType }
 */
router.post(
  '/:gangId/base/facility',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.gangIdParam),
  asyncHandler(GangBaseController.addFacility)
);

/**
 * POST /api/gangs/:gangId/base/upgrade-feature
 * Add upgrade to base
 * Body: { characterId, upgradeType }
 */
router.post(
  '/:gangId/base/upgrade-feature',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.upgradeBase),
  asyncHandler(GangBaseController.addUpgrade)
);

/**
 * POST /api/gangs/:gangId/base/defense/guard
 * Hire a guard
 * Body: { characterId, guardName, level, combatSkill }
 */
router.post(
  '/:gangId/base/defense/guard',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.gangIdParam),
  asyncHandler(GangBaseController.hireGuard)
);

/**
 * DELETE /api/gangs/:gangId/base/defense/guard/:guardId
 * Fire a guard
 * Body: { characterId }
 */
router.delete(
  '/:gangId/base/defense/guard/:guardId',
  validateObjectId('gangId'),
  validateObjectId('guardId'),
  asyncHandler(GangBaseController.fireGuard)
);

/**
 * POST /api/gangs/:gangId/base/defense/trap
 * Install a trap
 * Body: { characterId, trapType, effectiveness }
 */
router.post(
  '/:gangId/base/defense/trap',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.gangIdParam),
  asyncHandler(GangBaseController.installTrap)
);

/**
 * DELETE /api/gangs/:gangId/base/defense/trap/:trapId
 * Remove a trap
 * Body: { characterId }
 */
router.delete(
  '/:gangId/base/defense/trap/:trapId',
  validateObjectId('gangId'),
  validateObjectId('trapId'),
  asyncHandler(GangBaseController.removeTrap)
);

/**
 * GET /api/gangs/:gangId/base/storage
 * Get base storage details
 */
router.get(
  '/:gangId/base/storage',
  validateObjectId('gangId'),
  asyncHandler(GangBaseController.getStorage)
);

/**
 * POST /api/gangs/:gangId/base/storage/deposit
 * Deposit item to storage
 * Body: { characterId, itemId, quantity }
 */
router.post(
  '/:gangId/base/storage/deposit',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.depositToTreasury),
  asyncHandler(GangBaseController.depositItem)
);

/**
 * POST /api/gangs/:gangId/base/storage/withdraw
 * Withdraw item from storage
 * Body: { characterId, itemId, quantity }
 */
router.post(
  '/:gangId/base/storage/withdraw',
  validateObjectId('gangId'),
  validate(GangBaseSchemas.withdrawFromTreasury),
  asyncHandler(GangBaseController.withdrawItem)
);

export default router;
