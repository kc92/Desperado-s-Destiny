/**
 * Cattle Drive Routes
 * API endpoints for the cattle drive system
 *
 * Sprint 7: Mid-Game Content - Cattle Drives (L30 unlock)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAvailableRoutes,
  startDrive,
  progressDrive,
  handleEvent,
  completeDrive,
  abandonDrive,
  getActiveDriveStatus,
  getStatistics
} from '../controllers/cattleDrive.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/cattle-drives/routes/:characterId
 * Get available drive routes for a character
 */
router.get('/routes/:characterId', getAvailableRoutes);

/**
 * POST /api/cattle-drives/start
 * Start a new cattle drive
 * Body: { characterId: string, routeId: string }
 */
router.post('/start', startDrive);

/**
 * POST /api/cattle-drives/progress
 * Advance to the next phase
 * Body: { characterId: string }
 */
router.post('/progress', progressDrive);

/**
 * POST /api/cattle-drives/event
 * Handle a pending event choice
 * Body: { characterId: string, choiceId: string }
 */
router.post('/event', handleEvent);

/**
 * POST /api/cattle-drives/complete
 * Complete the drive and collect rewards
 * Body: { characterId: string }
 */
router.post('/complete', completeDrive);

/**
 * POST /api/cattle-drives/abandon
 * Abandon the current drive
 * Body: { characterId: string }
 */
router.post('/abandon', abandonDrive);

/**
 * GET /api/cattle-drives/status/:characterId
 * Get the status of the active drive
 */
router.get('/status/:characterId', getActiveDriveStatus);

/**
 * GET /api/cattle-drives/stats/:characterId
 * Get cattle drive statistics for a character
 */
router.get('/stats/:characterId', getStatistics);

export default router;
