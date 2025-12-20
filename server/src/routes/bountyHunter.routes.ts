/**
 * Bounty Hunter Routes
 *
 * API routes for bounty hunter system
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  checkHunterSpawn,
  getAvailableHunters,
  hireHunter,
  getActiveEncounters,
  payOffHunter,
  resolveEncounter,
  getHunterDetails,
  getAllHunters,
} from '../controllers/bountyHunter.controller';

const router = express.Router();

/**
 * Public routes (no auth required)
 */

// Get all hunters (public info)
router.get('/', asyncHandler(getAllHunters));

// Get specific hunter details
router.get('/:hunterId', asyncHandler(getHunterDetails));

/**
 * Protected routes (auth required)
 */

// Check if hunter should spawn
router.post('/check-spawn', requireAuth, requireCsrfToken, asyncHandler(checkHunterSpawn));

// Get available hunters for hire
router.get('/available/list', requireAuth, asyncHandler(getAvailableHunters));

// Hire a hunter
router.post('/hire', requireAuth, requireCsrfToken, asyncHandler(hireHunter));

// Get active encounters
router.get('/encounters/active', requireAuth, asyncHandler(getActiveEncounters));

// Pay off a hunter
router.post('/payoff', requireAuth, requireCsrfToken, asyncHandler(payOffHunter));

// Resolve encounter
router.post('/resolve', requireAuth, requireCsrfToken, asyncHandler(resolveEncounter));

export default router;
