/**
 * Gang Economy Routes
 *
 * Routes for gang economy, bank, businesses, heists, and payroll
 */

import { Router } from 'express';
import { GangEconomyController } from '../controllers/gangEconomy.controller';
import { requireAuth } from '../middleware/requireAuth';
import { characterOwnership } from '../middleware/characterOwnership.middleware';

const router = Router();

/**
 * All routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(characterOwnership);

/**
 * Economy Overview
 */
router.get('/:gangId/economy', GangEconomyController.getEconomy);

/**
 * Bank Routes
 */
router.get('/:gangId/bank', GangEconomyController.getBank);
router.post('/:gangId/bank/deposit', GangEconomyController.deposit);
router.post('/:gangId/bank/withdraw', GangEconomyController.withdraw);
router.post('/:gangId/bank/transfer', GangEconomyController.transfer);

/**
 * Business Routes
 */
router.get('/:gangId/businesses', GangEconomyController.getBusinesses);
router.post('/:gangId/businesses/buy', GangEconomyController.buyBusiness);
router.post('/:gangId/businesses/:businessId/sell', GangEconomyController.sellBusiness);

/**
 * Heist Routes
 */
router.get('/:gangId/heists/available', GangEconomyController.getAvailableHeists);
router.get('/:gangId/heists', GangEconomyController.getHeists);
router.post('/:gangId/heists/plan', GangEconomyController.planHeist);
router.post('/:gangId/heists/:heistId/plan', GangEconomyController.increasePlanning);
router.post('/:gangId/heists/:heistId/execute', GangEconomyController.executeHeist);
router.post('/:gangId/heists/:heistId/cancel', GangEconomyController.cancelHeist);

/**
 * Payroll Routes
 */
router.get('/:gangId/payroll', GangEconomyController.getPayroll);
router.post('/:gangId/payroll', GangEconomyController.setPayroll);

export default router;
