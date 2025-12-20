/**
 * Character Routes
 *
 * API routes for character management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate, CharacterSchemas } from '../validation';
import {
  createCharacter,
  getCharacters,
  getCharacter,
  deleteCharacter,
  selectCharacter,
  checkCharacterName
} from '../controllers/character.controller';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';

const router = Router();

/**
 * Rate limiter for character creation
 * Limit: 3 requests per hour to prevent spam
 *
 * SECURITY: Skipped in development/test to allow E2E testing
 */
const characterCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    error: 'Too many character creation attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  }
});

/**
 * Character Routes
 * All routes require authentication
 */

// Check if character name is available (must be before /:id routes)
router.get('/check-name', requireAuth, asyncHandler(checkCharacterName));

// Create new character (with special rate limiting)
router.post('/', requireAuth, requireCsrfToken, characterCreationLimiter, validate(CharacterSchemas.create), asyncHandler(createCharacter));

// Get all characters for authenticated user
router.get('/', requireAuth, asyncHandler(getCharacters));

// Get single character by ID (requires ownership)
router.get('/:id', requireAuth, requireCharacterOwnership, asyncHandler(getCharacter));

// Delete character (soft delete, requires ownership) - CSRF rotation for irreversible action
router.delete('/:id', requireAuth, requireCharacterOwnership, requireCsrfTokenWithRotation, asyncHandler(deleteCharacter));

// Select character as active (requires ownership)
router.patch('/:id/select', requireAuth, requireCsrfToken, requireCharacterOwnership, asyncHandler(selectCharacter));

export default router;
