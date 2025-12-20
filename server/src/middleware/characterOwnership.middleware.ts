/**
 * Character Ownership Middleware
 *
 * Verifies that the authenticated user owns the requested character
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Character, ICharacter } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * Extended AuthRequest with character attached
 */
export interface CharacterRequest extends AuthRequest {
  character?: ICharacter;
  characterId?: string;
}

/**
 * Middleware to verify character ownership
 * Requires requireAuth to be used first
 * Checks for characterId in query params, body, or route params
 */
export async function requireCharacterOwnership(
  req: CharacterRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for characterId in query params, body, or route params
    const characterId = req.query.characterId as string || req.body.characterId || req.params['id'];
    const userId = req.user?._id;

    // Ensure user is authenticated
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // If no characterId provided, try to get the most recent active character
    if (!characterId) {
      logger.debug(`[requireCharacter] Finding character for userId: ${userId}`);
      const characters = await Character.find({
        userId: userId,
        isActive: true
      }).sort({ lastActive: -1 }).limit(1);

      logger.debug(`[requireCharacter] Found ${characters?.length || 0} characters`);

      if (!characters || characters.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No active character found. Please select a character or provide characterId parameter.'
        });
        return;
      }

      req.character = characters[0];
      req.characterId = characters[0]._id.toString();
      logger.debug(`[requireCharacter] Set characterId: ${req.characterId}`);
      next();
      return;
    }

    // Validate character ID format
    if (!characterId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Invalid character ID format'
      });
      return;
    }

    // Find the character
    const character = await Character.findById(characterId);

    // Check if character exists and is active
    if (!character || !character.isActive) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Verify ownership
    if (character.userId.toString() !== userId.toString()) {
      logger.warn(
        `User ${userId} attempted to access character ${characterId} owned by ${character.userId}`
      );
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Attach character to request for use in route handler
    req.character = character;
    req.characterId = character._id.toString();
    next();
  } catch (error) {
    logger.error('Character ownership verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify character ownership'
    });
  }
}

// Aliases for simpler imports
export const requireCharacter = requireCharacterOwnership;
export const characterOwnership = requireCharacterOwnership;
