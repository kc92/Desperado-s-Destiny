/**
 * Encounter Routes
 * Routes for random encounter operations during travel
 */

import { Router } from 'express';
import { requireAuth, requireCharacter } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import encounterController from '../controllers/encounter.controller';

const router = Router();

// All encounter routes require authentication and character selection
router.use(requireAuth, requireCharacter);

/**
 * Get active encounter
 * GET /api/encounters/active
 */
router.get('/active', asyncHandler(encounterController.getActiveEncounter));

/**
 * Resolve encounter with a choice
 * POST /api/encounters/resolve
 * Body: { choice: string }
 */
router.post('/resolve', requireCsrfToken, asyncHandler(encounterController.resolveEncounter));

/**
 * Attempt to flee from combat encounter
 * POST /api/encounters/flee
 */
router.post('/flee', requireCsrfToken, asyncHandler(encounterController.fleeEncounter));

export default router;
