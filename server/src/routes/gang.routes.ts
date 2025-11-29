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

const router = Router();

/**
 * Public routes (no auth required)
 */
router.get('/', GangController.list);
router.get('/:id', GangController.getById);
router.get('/:id/stats', GangController.getStats);

/**
 * Authenticated routes
 */
router.post('/create', requireAuth, GangController.create);

router.post('/:id/join', requireAuth, GangController.join);
router.post('/:id/leave', requireAuth, GangController.leave);

router.delete('/:id/members/:characterId', requireAuth, GangController.kick);
router.patch('/:id/members/:characterId/promote', requireAuth, GangController.promote);

router.post('/:id/bank/deposit', requireAuth, GangController.depositBank);
router.post('/:id/bank/withdraw', requireAuth, GangController.withdrawBank);

router.post('/:id/upgrades/:upgradeType', requireAuth, GangController.purchaseUpgrade);

router.delete('/:id', requireAuth, GangController.disband);

router.get('/:id/transactions', requireAuth, GangController.getTransactions);

router.post('/:id/invitations', requireAuth, GangController.sendInvitation);
router.get('/invitations/:characterId', requireAuth, GangController.getInvitations);
router.post('/invitations/:id/accept', requireAuth, GangController.acceptInvitation);
router.post('/invitations/:id/reject', requireAuth, GangController.rejectInvitation);

/**
 * Gang Base Routes
 */
router.post('/:gangId/base/establish', requireAuth, asyncHandler(GangBaseController.establish));
router.get('/:gangId/base', requireAuth, asyncHandler(GangBaseController.getBase));
router.post('/:gangId/base/upgrade', requireAuth, asyncHandler(GangBaseController.upgradeTier));
router.post('/:gangId/base/facility', requireAuth, asyncHandler(GangBaseController.addFacility));
router.post('/:gangId/base/upgrade-feature', requireAuth, asyncHandler(GangBaseController.addUpgrade));

// Defense routes
router.post('/:gangId/base/defense/guard', requireAuth, asyncHandler(GangBaseController.hireGuard));
router.delete('/:gangId/base/defense/guard/:guardId', requireAuth, asyncHandler(GangBaseController.fireGuard));
router.post('/:gangId/base/defense/trap', requireAuth, asyncHandler(GangBaseController.installTrap));
router.delete('/:gangId/base/defense/trap/:trapId', requireAuth, asyncHandler(GangBaseController.removeTrap));

// Storage routes
router.get('/:gangId/base/storage', requireAuth, asyncHandler(GangBaseController.getStorage));
router.post('/:gangId/base/storage/deposit', requireAuth, asyncHandler(GangBaseController.depositItem));
router.post('/:gangId/base/storage/withdraw', requireAuth, asyncHandler(GangBaseController.withdrawItem));

export default router;
