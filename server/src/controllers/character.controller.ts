/**
 * Character Controller
 *
 * Handles all character-related HTTP requests
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { Character, getStartingLocation } from '../models/Character.model';
import {
  validateCharacterCreation,
  sanitizeCharacterName,
  CharacterCreationData
} from '../utils/characterValidation';
import { EnergyService } from '../services/energy.service';
import { PROGRESSION, VALIDATION_MESSAGES } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Create a new character
 * POST /api/characters
 */
export async function createCharacter(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { name, faction, appearance } = req.body as CharacterCreationData;

    // Validate input
    const validation = validateCharacterCreation({ name, faction, appearance });
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      });
      return;
    }

    // Sanitize name
    const sanitizedName = sanitizeCharacterName(name);

    // Check character limit (max 3 per user)
    const characterCount = await Character.getCharacterCount(userId);
    if (characterCount >= PROGRESSION.MAX_CHARACTERS_PER_ACCOUNT) {
      res.status(400).json({
        success: false,
        error: VALIDATION_MESSAGES.CHARACTER_LIMIT_REACHED
      });
      return;
    }

    // Check for duplicate name (case-insensitive)
    const existingCharacter = await Character.findActiveByName(sanitizedName);
    if (existingCharacter) {
      res.status(409).json({
        success: false,
        error: 'Character name already taken'
      });
      return;
    }

    // Determine starting location based on faction
    const startingLocation = getStartingLocation(faction);

    // Create the character
    const character = new Character({
      userId,
      name: sanitizedName,
      faction,
      appearance,
      currentLocation: startingLocation,
      level: 1,
      experience: 0,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: {
        cunning: 0,
        spirit: 0,
        combat: 0,
        craft: 0
      },
      skills: [],
      inventory: [],
      lastActive: new Date(),
      isActive: true
    });

    await character.save();

    logger.info(`Character created: ${character.name} (${character._id}) by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        character: character.toSafeObject()
      }
    });
  } catch (error) {
    logger.error('Error creating character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create character'
    });
  }
}

/**
 * Get all characters for the authenticated user
 * GET /api/characters
 */
export async function getCharacters(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Find all active characters for the user
    const characters = await Character.findByUserId(userId);

    // Convert to safe objects
    const safeCharacters = characters.map(char => char.toSafeObject());

    res.status(200).json({
      success: true,
      data: {
        characters: safeCharacters
      }
    });
  } catch (error) {
    logger.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch characters'
    });
  }
}

/**
 * Get a single character by ID
 * GET /api/characters/:id
 */
export async function getCharacter(req: CharacterRequest, res: Response): Promise<void> {
  try {
    // Character is already attached by ownership middleware
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Regenerate energy before returning
    EnergyService.regenerateEnergy(character);
    await character.save();

    res.status(200).json({
      success: true,
      data: {
        character: character.toSafeObject()
      }
    });
  } catch (error) {
    logger.error('Error fetching character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch character'
    });
  }
}

/**
 * Delete a character (soft delete)
 * DELETE /api/characters/:id
 */
export async function deleteCharacter(req: CharacterRequest, res: Response): Promise<void> {
  try {
    // Character is already attached by ownership middleware
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Soft delete
    character.isActive = false;
    await character.save();

    logger.info(`Character deleted: ${character.name} (${character._id})`);

    res.status(200).json({
      success: true,
      message: 'Character deleted'
    });
  } catch (error) {
    logger.error('Error deleting character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete character'
    });
  }
}

/**
 * Select a character as active (update lastActive)
 * PATCH /api/characters/:id/select
 */
export async function selectCharacter(req: CharacterRequest, res: Response): Promise<void> {
  try {
    // Character is already attached by ownership middleware
    const character = req.character;

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Update lastActive timestamp
    character.lastActive = new Date();

    // Regenerate energy
    EnergyService.regenerateEnergy(character);

    await character.save();

    logger.debug(`Character selected: ${character.name} (${character._id})`);

    res.status(200).json({
      success: true,
      data: {
        character: character.toSafeObject()
      }
    });
  } catch (error) {
    logger.error('Error selecting character:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to select character'
    });
  }
}
