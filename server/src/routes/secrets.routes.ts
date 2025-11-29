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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// All secret routes require authentication and character
router.use(requireAuth);
router.use(requireCharacter);

// Get available secret types
router.get('/types', getSecretTypes);

// Get character's secret statistics
router.get('/stats', getSecretStatistics);

// Check character's progress (newly qualified secrets)
router.get('/progress', checkSecretProgress);

// Get all discovered secrets
router.get('/discovered', getDiscoveredSecrets);

// Get secrets by type
router.get('/type/:type', getSecretsByType);

// Get secrets at a location
router.get('/location/:locationId', getLocationSecrets);

// Get secrets related to an NPC
router.get('/npc/:npcId', getNPCSecrets);

// Check if can unlock a specific secret
router.get('/check/:secretId', checkSecretUnlock);

// Get secret details
router.get('/:secretId', getSecretDetails);

// Unlock a secret
router.post('/unlock', unlockSecret);

export default router;
