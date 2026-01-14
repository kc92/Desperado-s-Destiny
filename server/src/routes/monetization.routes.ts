/**
 * Monetization Routes
 *
 * Handles ad rewards and player bonus endpoints.
 * Part of the FAIR monetization system.
 */

import { Router } from 'express';
import { MonetizationController } from '../controllers/monetization.controller';
import { authenticate } from '../middleware/auth.middleware';
import csrfProtection from '../middleware/csrf.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET endpoints (no CSRF needed)
router.get('/bonuses', MonetizationController.getPlayerBonuses);
router.get('/ad-status', MonetizationController.getAdRewardStatus);
router.get('/ad-config', MonetizationController.getAdConfig);
router.get('/should-show-ads', MonetizationController.shouldShowAds);

// POST endpoints (require CSRF protection)
router.post('/ad-reward', csrfProtection.requireCsrfToken, MonetizationController.claimAdReward);
router.post('/use-bonus-gold', csrfProtection.requireCsrfToken, MonetizationController.useBonusGold);
router.post('/use-extra-contract', csrfProtection.requireCsrfToken, MonetizationController.useExtraContract);

export default router;
