/**
 * Character Controller
 *
 * Handles all character-related HTTP requests
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { Character, getStartingLocation } from '../models/Character.model';
import {
  validateCharacterCreation,
  sanitizeCharacterName,
  CharacterCreationData
} from '../utils/characterValidation';
import { EnergyService } from '../services/energy.service';
import { SkillService } from '../services/skill.service';
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

    // SECURITY: Only extract allowed fields from request body
    // Explicitly ignore any userId or other sensitive fields to prevent mass assignment
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

    // Initialize all skills at level 1
    const initialSkills = SkillService.initializeSkills();

    // Use provided appearance or default values
    const characterAppearance = appearance || {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 0,
      hairStyle: 0,
      hairColor: 0
    };

    // SECURITY: Create the character with userId from authenticated session ONLY
    // Never trust userId from request body - always use req.user._id from auth middleware
    const character = new Character({
      userId, // This comes from req.user._id (line 27), NOT from request body
      name: sanitizedName,
      faction,
      appearance: characterAppearance,
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
      skills: initialSkills,
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

    // Add any missing skills to existing characters (for skill system updates)
    const updatedSkills = SkillService.addMissingSkills(character.skills as any);
    if (updatedSkills.length > character.skills.length) {
      character.skills = updatedSkills as any;
    }

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
 * Check if a character name is available
 * GET /api/characters/check-name?name=xxx
 */
export async function checkCharacterName(req: AuthRequest, res: Response): Promise<void> {
  try {
    const name = req.query.name as string;

    if (!name || name.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: 'Name must be at least 3 characters'
      });
      return;
    }

    const sanitizedName = sanitizeCharacterName(name);

    // Check if name is taken
    const existingCharacter = await Character.findActiveByName(sanitizedName);

    res.status(200).json({
      success: true,
      available: !existingCharacter,
      name: sanitizedName
    });
  } catch (error) {
    logger.error('Error checking character name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check character name'
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
