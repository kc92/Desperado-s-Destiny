/**
 * Bank Routes
 * Routes for Red Gulch Bank vault operations
 */

import { Router } from 'express';
import {
  getVaultInfo,
  getVaultTiers,
  upgradeVault,
  deposit,
  withdraw,
  getTotalDeposits
} from '../controllers/bank.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate, GoldSchemas } from '../validation';
import { rateLimitGoldTransactions, checkGoldDuplication } from '../middleware/antiExploit.middleware';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';

const router = Router();

// Public route - view vault tier options
router.get('/tiers', asyncHandler(getVaultTiers));

// Protected routes - require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Vault information
router.get('/vault', asyncHandler(getVaultInfo));

// Vault operations
router.post('/upgrade', requireCsrfToken, asyncHandler(upgradeVault));
router.post('/deposit', requireCsrfToken, rateLimitGoldTransactions(100), validate(GoldSchemas.deposit), asyncHandler(deposit));
router.post('/withdraw', requireCsrfTokenWithRotation, rateLimitGoldTransactions(100), checkGoldDuplication(), validate(GoldSchemas.withdraw), asyncHandler(withdraw));

// Stats (could be admin-only in future)
router.get('/stats/total', asyncHandler(getTotalDeposits));

export default router;
