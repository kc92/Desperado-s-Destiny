/**
 * Encounter Routes
 * Routes for random encounter operations during travel
 */

import { Router } from 'express';
import { requireAuth, requireCharacter } from '../middleware/auth.middleware';
import encounterController from '../controllers/encounter.controller';

const router = Router();

// All encounter routes require authentication and character selection
router.use(requireAuth, requireCharacter);

/**
 * Get active encounter
 * GET /api/encounters/active
 */
router.get('/active', encounterController.getActiveEncounter);

/**
 * Resolve encounter with a choice
 * POST /api/encounters/resolve
 * Body: { choice: string }
 */
router.post('/resolve', encounterController.resolveEncounter);

/**
 * Attempt to flee from combat encounter
 * POST /api/encounters/flee
 */
router.post('/flee', encounterController.fleeEncounter);

export default router;
