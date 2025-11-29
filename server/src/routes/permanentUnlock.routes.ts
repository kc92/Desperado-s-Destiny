/**
 * Permanent Unlock Routes
 * API endpoints for permanent unlock system
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
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
router.get('/', unlockController.getAccountUnlocks);

/**
 * @route   GET /api/unlocks/available
 * @desc    Get all available unlocks (earned and unearned)
 * @access  Private
 */
router.get('/available', unlockController.getAvailableUnlocks);

/**
 * @route   GET /api/unlocks/character-slots
 * @desc    Get max character slots and whether user can create more characters
 * @access  Private
 */
router.get('/character-slots', unlockController.getCharacterSlots);

/**
 * @route   POST /api/unlocks/sync-legacy
 * @desc    Sync unlocks based on current legacy tier
 * @access  Private
 */
router.post('/sync-legacy', unlockController.syncLegacyUnlocks);

/**
 * @route   GET /api/unlocks/:id/progress
 * @desc    Get progress toward a specific unlock
 * @access  Private
 */
router.get('/:id/progress', unlockController.getUnlockProgress);

/**
 * @route   GET /api/unlocks/:id/eligibility
 * @desc    Check if user is eligible for an unlock
 * @access  Private
 */
router.get('/:id/eligibility', unlockController.checkEligibility);

/**
 * @route   POST /api/unlocks/:id/claim
 * @desc    Claim an earned unlock
 * @access  Private
 */
router.post('/:id/claim', unlockController.claimUnlock);

export default router;
