/**
 * Bounty Hunter Routes
 *
 * API routes for bounty hunter system
 */

import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
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
router.get('/', getAllHunters);

// Get specific hunter details
router.get('/:hunterId', getHunterDetails);

/**
 * Protected routes (auth required)
 */

// Check if hunter should spawn
router.post('/check-spawn', requireAuth, checkHunterSpawn);

// Get available hunters for hire
router.get('/available/list', requireAuth, getAvailableHunters);

// Hire a hunter
router.post('/hire', requireAuth, hireHunter);

// Get active encounters
router.get('/encounters/active', requireAuth, getActiveEncounters);

// Pay off a hunter
router.post('/payoff', requireAuth, payOffHunter);

// Resolve encounter
router.post('/resolve', requireAuth, resolveEncounter);

export default router;
