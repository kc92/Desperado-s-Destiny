/**
 * Incident Routes
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Endpoints for viewing and responding to incidents.
 */

import { Router } from 'express';
import {
  getActiveIncidents,
  getIncidentDetails,
  respondToIncident,
  getIncidentHistory,
  getIncidentStats,
  ignoreIncident,
  claimInsurance,
} from '../controllers/incident.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { validateObjectId } from '../validation/middleware';
import { rateLimitGoldTransactions, checkGoldDuplication } from '../middleware/antiExploit.middleware';

const router = Router();

// All routes require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// ========================
// Query Routes
// ========================

/**
 * GET /api/incidents/active
 * Get all active incidents for current character
 */
router.get('/active', asyncHandler(getActiveIncidents));

/**
 * GET /api/incidents/history
 * Get incident history for current character
 */
router.get('/history', asyncHandler(getIncidentHistory));

/**
 * GET /api/incidents/stats
 * Get incident statistics for current character
 */
router.get('/stats', asyncHandler(getIncidentStats));

/**
 * GET /api/incidents/:incidentId
 * Get details of a specific incident
 */
router.get(
  '/:incidentId',
  validateObjectId('incidentId'),
  asyncHandler(getIncidentDetails)
);

// ========================
// Response Routes
// ========================

/**
 * POST /api/incidents/:incidentId/respond
 * Respond to an incident with a specific action
 */
router.post(
  '/:incidentId/respond',
  requireCsrfToken,
  validateObjectId('incidentId'),
  rateLimitGoldTransactions(10),
  checkGoldDuplication(),
  asyncHandler(respondToIncident)
);

/**
 * POST /api/incidents/:incidentId/ignore
 * Accept full damage from an incident
 */
router.post(
  '/:incidentId/ignore',
  requireCsrfToken,
  validateObjectId('incidentId'),
  asyncHandler(ignoreIncident)
);

/**
 * POST /api/incidents/:incidentId/claim-insurance
 * File an insurance claim for an incident
 */
router.post(
  '/:incidentId/claim-insurance',
  requireCsrfToken,
  validateObjectId('incidentId'),
  asyncHandler(claimInsurance)
);

export default router;
