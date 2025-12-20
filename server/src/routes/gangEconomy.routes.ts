/**
 * Gang Economy Routes
 *
 * Routes for gang economy, bank, businesses, heists, and payroll
 */

import { Router } from 'express';
import { GangEconomyController } from '../controllers/gangEconomy.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { characterOwnership } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { rateLimitGoldTransactions, checkGoldDuplication, logEconomicTransaction } from '../middleware/antiExploit.middleware';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { validate, GangSchemas } from '../validation';

const router = Router();

/**
 * All routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(characterOwnership);

/**
 * Economy Overview
 */
router.get('/:gangId/economy', asyncHandler(GangEconomyController.getEconomy));

/**
 * Bank Routes
 */
router.get('/:gangId/bank', asyncHandler(GangEconomyController.getBank));
router.post('/:gangId/bank/deposit', requireCsrfToken, validate(GangSchemas.deposit), rateLimitGoldTransactions(20), asyncHandler(GangEconomyController.deposit));
router.post('/:gangId/bank/withdraw', requireCsrfTokenWithRotation, validate(GangSchemas.withdraw), rateLimitGoldTransactions(10), checkGoldDuplication(), asyncHandler(GangEconomyController.withdraw));
router.post('/:gangId/bank/transfer', requireCsrfTokenWithRotation, validate(GangSchemas.withdraw), rateLimitGoldTransactions(10), checkGoldDuplication(), asyncHandler(GangEconomyController.transfer));

/**
 * Business Routes
 */
router.get('/:gangId/businesses', asyncHandler(GangEconomyController.getBusinesses));
router.post('/:gangId/businesses/buy', requireCsrfToken, checkGoldDuplication(), asyncHandler(GangEconomyController.buyBusiness));
router.post('/:gangId/businesses/:businessId/sell', requireCsrfToken, asyncHandler(GangEconomyController.sellBusiness));

/**
 * Heist Routes
 */
router.get('/:gangId/heists/available', asyncHandler(GangEconomyController.getAvailableHeists));
router.get('/:gangId/heists', asyncHandler(GangEconomyController.getHeists));
router.post('/:gangId/heists/plan', requireCsrfToken, checkGoldDuplication(), asyncHandler(GangEconomyController.planHeist));
router.post('/:gangId/heists/:heistId/plan', requireCsrfToken, checkGoldDuplication(), asyncHandler(GangEconomyController.increasePlanning));
router.post('/:gangId/heists/:heistId/execute', requireCsrfToken, checkGoldDuplication(), asyncHandler(GangEconomyController.executeHeist));
router.post('/:gangId/heists/:heistId/cancel', requireCsrfToken, asyncHandler(GangEconomyController.cancelHeist));

/**
 * Payroll Routes
 */
router.get('/:gangId/payroll', asyncHandler(GangEconomyController.getPayroll));
router.post('/:gangId/payroll', requireCsrfToken, asyncHandler(GangEconomyController.setPayroll));

export default router;
