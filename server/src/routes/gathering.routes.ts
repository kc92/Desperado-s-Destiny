/**
 * Gathering Routes
 * API routes for resource gathering system
 * Phase 7, Wave 7.3 - AAA Crafting System
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  getNodesAtLocation,
  getNodeDetails,
  checkGatherRequirements,
  gather,
  getCooldowns,
} from '../controllers/gathering.controller';

const router = Router();

/**
 * Rate limiter for gathering actions
 * Limit: 60 gathers per minute to prevent spam
 */
const gatherLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Too many gathering attempts. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Gathering Routes
 * All routes require authentication
 */

// Get all gathering nodes at current/specified location
router.get(
  '/nodes',
  requireAuth,
  requireCharacter,
  asyncHandler(getNodesAtLocation)
);

// Get details for a specific node
router.get(
  '/nodes/:nodeId',
  requireAuth,
  asyncHandler(getNodeDetails)
);

// Check if character can gather from a node
router.get(
  '/check/:nodeId',
  requireAuth,
  requireCharacter,
  asyncHandler(checkGatherRequirements)
);

// Gather resources from a node
router.post(
  '/gather',
  requireAuth,
  requireCsrfToken,
  requireCharacter,
  gatherLimiter,
  asyncHandler(gather)
);

// Get active cooldowns
router.get(
  '/cooldowns',
  requireAuth,
  requireCharacter,
  asyncHandler(getCooldowns)
);

export default router;
