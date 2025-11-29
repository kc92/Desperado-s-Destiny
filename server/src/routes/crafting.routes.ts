/**
 * Crafting Routes
 * API routes for crafting system
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  getRecipes,
  getRecipesByCategory,
  checkCanCraft,
  craftItem,
  getCraftingStations
} from '../controllers/crafting.controller';

const router = Router();

/**
 * Rate limiter for crafting actions
 * Limit: 30 crafts per minute to prevent abuse
 */
const craftLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many crafting attempts. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Crafting Routes
 * All routes require authentication
 */

// Get all available recipes for character
router.get('/recipes', requireAuth, requireCharacter, getRecipes);

// Get recipes by category
router.get('/recipes/:category', requireAuth, getRecipesByCategory);

// Check if character can craft a specific recipe
router.get('/can-craft/:recipeId', requireAuth, requireCharacter, checkCanCraft);

// Craft an item
router.post('/craft', requireAuth, requireCharacter, craftLimiter, craftItem);

// Get crafting stations at current location
router.get('/stations', requireAuth, requireCharacter, getCraftingStations);

export default router;
