/**
 * Crafting Controller
 * Handles all crafting-related HTTP requests
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { CraftingService } from '../services/crafting.service';
import { Recipe } from '../models/Recipe.model';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * GET /api/crafting/recipes
 * Get all available recipes for the authenticated character
 */
export async function getRecipes(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const recipes = await CraftingService.getAvailableRecipes(characterId);

    res.status(200).json({
      success: true,
      data: {
        recipes,
        count: recipes.length
      }
    });
  } catch (error) {
    logger.error('Error fetching recipes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipes'
    });
  }
}

/**
 * GET /api/crafting/recipes/:category
 * Get recipes by category (weapon/armor/consumable/ammo/material)
 */
export async function getRecipesByCategory(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { category } = req.params;

    // Validate category
    const validCategories = ['weapon', 'armor', 'consumable', 'ammo', 'material'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
      return;
    }

    const recipes = await CraftingService.getRecipesByCategory(category);

    res.status(200).json({
      success: true,
      data: {
        category,
        recipes,
        count: recipes.length
      }
    });
  } catch (error) {
    logger.error('Error fetching recipes by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipes by category'
    });
  }
}

/**
 * GET /api/crafting/can-craft/:recipeId
 * Check if character can craft a specific recipe
 */
export async function checkCanCraft(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { recipeId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!recipeId) {
      res.status(400).json({
        success: false,
        error: 'Recipe ID required'
      });
      return;
    }

    const result = await CraftingService.canCraft(characterId, recipeId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error checking craft availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check craft availability'
    });
  }
}

/**
 * POST /api/crafting/craft
 * Craft an item from a recipe
 * Body: { recipeId: string }
 */
export async function craftItem(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { recipeId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!recipeId) {
      res.status(400).json({
        success: false,
        error: 'Recipe ID required in request body'
      });
      return;
    }

    const result = await CraftingService.craftItem(characterId, recipeId);

    if (result.success && result.itemsCrafted && result.itemsCrafted.length > 0) {
      logger.info(`Character ${characterId} crafted item: ${result.itemsCrafted[0].itemId}`);
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error crafting item:', error);

    // Return specific error messages for common crafting failures
    const status = error.statusCode || 500;
    const message = error.message || 'Failed to craft item';

    res.status(status).json({
      success: false,
      error: message
    });
  }
}

/**
 * GET /api/crafting/stations
 * Get crafting stations available at character's current location
 * Returns workshop types like 'blacksmith', 'apothecary', etc.
 */
export async function getCraftingStations(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const character = await Character.findById(characterId);

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Get unique workshop types using aggregation - prevents OOM with large recipe sets
    const workshopMap: Record<string, string> = {
      'craft': 'workshop',
      'combat': 'blacksmith',
      'cunning': 'hideout',
      'spirit': 'apothecary'
    };

    const skillIdsAgg = await Recipe.aggregate([
      { $match: { isUnlocked: true, 'skillRequired.skillId': { $exists: true } } },
      { $group: { _id: '$skillRequired.skillId' } },
      { $limit: 100 } // Safety limit
    ]);

    const availableStations = new Set<string>();
    for (const item of skillIdsAgg) {
      const workshop = workshopMap[item._id] || 'workshop';
      availableStations.add(workshop);
    }

    res.status(200).json({
      success: true,
      data: {
        location: character.currentLocation,
        stations: Array.from(availableStations),
        message: 'Note: Location-based station filtering coming soon'
      }
    });
  } catch (error) {
    logger.error('Error fetching crafting stations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crafting stations'
    });
  }
}
