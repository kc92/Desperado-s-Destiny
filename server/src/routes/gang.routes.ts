/**
 * Gang Routes
 *
 * API endpoints for gang system
 */

import { Router } from 'express';
import { GangController } from '../controllers/gang.controller';
import { GangBaseController } from '../controllers/gangBase.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { rateLimitGoldTransactions, checkGoldDuplication, logEconomicTransaction } from '../middleware/antiExploit.middleware';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { validate, GangSchemas } from '../validation';

const router = Router();

/**
 * Public routes (no auth required)
 */
router.get('/', asyncHandler(GangController.list));
router.get('/:id', asyncHandler(GangController.getById));
router.get('/:id/stats', asyncHandler(GangController.getStats));

/**
 * Authenticated routes
 */
router.post('/create', requireAuth, requireCsrfToken, validate(GangSchemas.create), asyncHandler(GangController.create));

router.post('/:id/join', requireAuth, requireCsrfToken, asyncHandler(GangController.join));
router.post('/:id/leave', requireAuth, requireCsrfToken, asyncHandler(GangController.leave));

router.delete('/:id/members/:characterId', requireAuth, requireCsrfToken, asyncHandler(GangController.kick));
router.patch('/:id/members/:characterId/promote', requireAuth, requireCsrfToken, asyncHandler(GangController.promote));

router.post('/:id/bank/deposit', requireAuth, requireCsrfToken, validate(GangSchemas.deposit), rateLimitGoldTransactions(20), asyncHandler(GangController.depositBank));
router.post('/:id/bank/withdraw', requireAuth, requireCsrfTokenWithRotation, validate(GangSchemas.withdraw), rateLimitGoldTransactions(10), checkGoldDuplication(), asyncHandler(GangController.withdrawBank));

router.post('/:id/upgrades/:upgradeType', requireAuth, requireCsrfToken, checkGoldDuplication(), asyncHandler(GangController.purchaseUpgrade));

router.delete('/:id', requireAuth, requireCsrfTokenWithRotation, asyncHandler(GangController.disband));

router.get('/:id/transactions', requireAuth, asyncHandler(GangController.getTransactions));

router.post('/:id/invitations', requireAuth, requireCsrfToken, asyncHandler(GangController.sendInvitation));
router.get('/invitations/:characterId', requireAuth, asyncHandler(GangController.getInvitations));
router.post('/invitations/:id/accept', requireAuth, requireCsrfToken, asyncHandler(GangController.acceptInvitation));
router.post('/invitations/:id/reject', requireAuth, requireCsrfToken, asyncHandler(GangController.rejectInvitation));

/**
 * Gang Base Routes
 */
router.post('/:gangId/base/establish', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.establish));
router.get('/:gangId/base', requireAuth, asyncHandler(GangBaseController.getBase));
router.post('/:gangId/base/upgrade', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.upgradeTier));
router.post('/:gangId/base/facility', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.addFacility));
router.post('/:gangId/base/upgrade-feature', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.addUpgrade));

// Defense routes
router.post('/:gangId/base/defense/guard', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.hireGuard));
router.delete('/:gangId/base/defense/guard/:guardId', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.fireGuard));
router.post('/:gangId/base/defense/trap', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.installTrap));
router.delete('/:gangId/base/defense/trap/:trapId', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.removeTrap));

// Storage routes
router.get('/:gangId/base/storage', requireAuth, asyncHandler(GangBaseController.getStorage));
router.post('/:gangId/base/storage/deposit', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.depositItem));
router.post('/:gangId/base/storage/withdraw', requireAuth, requireCsrfToken, asyncHandler(GangBaseController.withdrawItem));

export default router;
