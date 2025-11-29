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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public route - view vault tier options
router.get('/tiers', getVaultTiers);

// Protected routes - require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Vault information
router.get('/vault', getVaultInfo);

// Vault operations
router.post('/upgrade', upgradeVault);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

// Stats (could be admin-only in future)
router.get('/stats/total', getTotalDeposits);

export default router;
