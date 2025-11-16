/**
 * Character Ownership Middleware
 *
 * Verifies that the authenticated user owns the requested character
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './requireAuth';
import { Character, ICharacter } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * Extended AuthRequest with character attached
 */
export interface CharacterRequest extends AuthRequest {
  character?: ICharacter;
}

/**
 * Middleware to verify character ownership
 * Requires requireAuth to be used first
 */
export async function requireCharacterOwnership(
  req: CharacterRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const characterId = req.params['id'];
    const userId = req.user?._id;

    // Ensure user is authenticated
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Validate character ID format
    if (!characterId || !characterId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Invalid character ID'
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
    next();
  } catch (error) {
    logger.error('Character ownership verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify character ownership'
    });
  }
}
