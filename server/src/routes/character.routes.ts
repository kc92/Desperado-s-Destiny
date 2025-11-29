/**
 * Character Routes
 *
 * API routes for character management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import {
  createCharacter,
  getCharacters,
  getCharacter,
  deleteCharacter,
  selectCharacter,
  checkCharacterName
} from '../controllers/character.controller';

const router = Router();

/**
 * Rate limiter for character creation
 * Limit: 3 requests per hour to prevent spam
 */
const characterCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    error: 'Too many character creation attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Character Routes
 * All routes require authentication
 */

// Check if character name is available (must be before /:id routes)
router.get('/check-name', requireAuth, checkCharacterName);

// Create new character (with special rate limiting)
router.post('/', requireAuth, characterCreationLimiter, createCharacter);

// Get all characters for authenticated user
router.get('/', requireAuth, getCharacters);

// Get single character by ID (requires ownership)
router.get('/:id', requireAuth, requireCharacterOwnership, getCharacter);

// Delete character (soft delete, requires ownership)
router.delete('/:id', requireAuth, requireCharacterOwnership, deleteCharacter);

// Select character as active (requires ownership)
router.patch('/:id/select', requireAuth, requireCharacterOwnership, selectCharacter);

export default router;
