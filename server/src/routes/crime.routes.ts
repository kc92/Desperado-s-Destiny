/**
 * Crime Routes
 *
 * Defines all crime-related endpoints (jail, wanted level, arrests, bounties)
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { preventActionsWhileJailed } from '../middleware/jail.middleware';
import * as crimeController from '../controllers/crime.controller';

const router = Router();

/**
 * All crime routes require authentication
 */

/**
 * POST /api/crimes/pay-bail
 * Pay bail to escape jail early
 */
router.post('/pay-bail', requireAuth, crimeController.payBail);

/**
 * GET /api/crimes/wanted
 * Get character's wanted status
 */
router.get('/wanted', requireAuth, crimeController.getWantedStatus);

/**
 * POST /api/crimes/lay-low
 * Reduce wanted level by laying low
 * Note: Jail check applied - can't lay low while jailed
 */
router.post('/lay-low', requireAuth, preventActionsWhileJailed, crimeController.layLow);

/**
 * POST /api/crimes/arrest/:targetCharacterId
 * Arrest another player (bounty hunting)
 */
router.post('/arrest/:targetCharacterId', requireAuth, crimeController.arrestPlayer);

/**
 * GET /api/crimes/bounties
 * Get public bounty board (all wanted criminals)
 */
router.get('/bounties', requireAuth, crimeController.getBountyBoard);

/**
 * GET /api/crimes/jail-status
 * Get character's jail status
 */
router.get('/jail-status', requireAuth, crimeController.getJailStatus);

export default router;
