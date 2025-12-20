/**
 * Permanent Unlock Routes
 * API endpoints for permanent unlock system
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import * as unlockController from '../controllers/permanentUnlock.controller';

const router = Router();

/**
 * All unlock routes require authentication
 */
router.use(requireAuth);

/**
 * @route   GET /api/unlocks
 * @desc    Get all account unlocks for the authenticated user
 * @access  Private
 */
router.get('/', asyncHandler(unlockController.getAccountUnlocks));

/**
 * @route   GET /api/unlocks/available
 * @desc    Get all available unlocks (earned and unearned)
 * @access  Private
 */
router.get('/available', asyncHandler(unlockController.getAvailableUnlocks));

/**
 * @route   GET /api/unlocks/character-slots
 * @desc    Get max character slots and whether user can create more characters
 * @access  Private
 */
router.get('/character-slots', asyncHandler(unlockController.getCharacterSlots));

/**
 * @route   POST /api/unlocks/sync-legacy
 * @desc    Sync unlocks based on current legacy tier
 * @access  Private
 */
router.post('/sync-legacy', requireCsrfToken, asyncHandler(unlockController.syncLegacyUnlocks));

/**
 * @route   GET /api/unlocks/:id/progress
 * @desc    Get progress toward a specific unlock
 * @access  Private
 */
router.get('/:id/progress', asyncHandler(unlockController.getUnlockProgress));

/**
 * @route   GET /api/unlocks/:id/eligibility
 * @desc    Check if user is eligible for an unlock
 * @access  Private
 */
router.get('/:id/eligibility', asyncHandler(unlockController.checkEligibility));

/**
 * @route   POST /api/unlocks/:id/claim
 * @desc    Claim an earned unlock
 * @access  Private
 */
router.post('/:id/claim', requireCsrfToken, asyncHandler(unlockController.claimUnlock));

export default router;
