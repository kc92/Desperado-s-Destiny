/**
 * Secrets Routes
 * API routes for secret discovery and hidden content
 */

import { Router } from 'express';
import {
  checkSecretUnlock,
  unlockSecret,
  getLocationSecrets,
  checkSecretProgress,
  getDiscoveredSecrets,
  getSecretsByType,
  getSecretDetails,
  getNPCSecrets,
  getSecretStatistics,
  getSecretTypes
} from '../controllers/secrets.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// All secret routes require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Get available secret types
router.get('/types', asyncHandler(getSecretTypes));

// Get character's secret statistics
router.get('/stats', asyncHandler(getSecretStatistics));

// Check character's progress (newly qualified secrets)
router.get('/progress', asyncHandler(checkSecretProgress));

// Get all discovered secrets
router.get('/discovered', asyncHandler(getDiscoveredSecrets));

// Get secrets by type
router.get('/type/:type', asyncHandler(getSecretsByType));

// Get secrets at a location
router.get('/location/:locationId', asyncHandler(getLocationSecrets));

// Get secrets related to an NPC
router.get('/npc/:npcId', asyncHandler(getNPCSecrets));

// Check if can unlock a specific secret
router.get('/check/:secretId', asyncHandler(checkSecretUnlock));

// Get secret details
router.get('/:secretId', asyncHandler(getSecretDetails));

// Unlock a secret
router.post('/unlock', requireCsrfToken, asyncHandler(unlockSecret));

export default router;
