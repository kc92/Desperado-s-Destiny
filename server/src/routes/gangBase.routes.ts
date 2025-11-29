/**
 * Gang Base Routes
 *
 * API endpoints for gang headquarters/bases
 */

import { Router } from 'express';
import { GangBaseController } from '../controllers/gangBase.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../middleware/asyncHandler';

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
router.post('/:gangId/base/establish', asyncHandler(GangBaseController.establish));

/**
 * GET /api/gangs/:gangId/base
 * Get gang base details
 */
router.get('/:gangId/base', asyncHandler(GangBaseController.getBase));

/**
 * POST /api/gangs/:gangId/base/upgrade
 * Upgrade base tier
 * Body: { characterId }
 */
router.post('/:gangId/base/upgrade', asyncHandler(GangBaseController.upgradeTier));

/**
 * POST /api/gangs/:gangId/base/facility
 * Add facility to base
 * Body: { characterId, facilityType }
 */
router.post('/:gangId/base/facility', asyncHandler(GangBaseController.addFacility));

/**
 * POST /api/gangs/:gangId/base/upgrade-feature
 * Add upgrade to base
 * Body: { characterId, upgradeType }
 */
router.post('/:gangId/base/upgrade-feature', asyncHandler(GangBaseController.addUpgrade));

/**
 * POST /api/gangs/:gangId/base/defense/guard
 * Hire a guard
 * Body: { characterId, guardName, level, combatSkill }
 */
router.post('/:gangId/base/defense/guard', asyncHandler(GangBaseController.hireGuard));

/**
 * DELETE /api/gangs/:gangId/base/defense/guard/:guardId
 * Fire a guard
 * Body: { characterId }
 */
router.delete(
  '/:gangId/base/defense/guard/:guardId',
  asyncHandler(GangBaseController.fireGuard)
);

/**
 * POST /api/gangs/:gangId/base/defense/trap
 * Install a trap
 * Body: { characterId, trapType, effectiveness }
 */
router.post('/:gangId/base/defense/trap', asyncHandler(GangBaseController.installTrap));

/**
 * DELETE /api/gangs/:gangId/base/defense/trap/:trapId
 * Remove a trap
 * Body: { characterId }
 */
router.delete(
  '/:gangId/base/defense/trap/:trapId',
  asyncHandler(GangBaseController.removeTrap)
);

/**
 * GET /api/gangs/:gangId/base/storage
 * Get base storage details
 */
router.get('/:gangId/base/storage', asyncHandler(GangBaseController.getStorage));

/**
 * POST /api/gangs/:gangId/base/storage/deposit
 * Deposit item to storage
 * Body: { characterId, itemId, quantity }
 */
router.post('/:gangId/base/storage/deposit', asyncHandler(GangBaseController.depositItem));

/**
 * POST /api/gangs/:gangId/base/storage/withdraw
 * Withdraw item from storage
 * Body: { characterId, itemId, quantity }
 */
router.post('/:gangId/base/storage/withdraw', asyncHandler(GangBaseController.withdrawItem));

export default router;
