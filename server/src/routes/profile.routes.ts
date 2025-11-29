/**
 * Profile Routes
 * Public profile viewing endpoints
 */

import { Router } from 'express';
import { getPublicProfile, searchCharacters } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Search characters by name (requires auth)
router.get('/search', authenticate, searchCharacters);

// Get public profile by character name (requires auth)
router.get('/:name', authenticate, getPublicProfile);

export default router;
