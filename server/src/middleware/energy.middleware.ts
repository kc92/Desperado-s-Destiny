/**
 * Energy Middleware
 *
 * Middleware to validate energy requirements for actions
 */

import { Request, Response, NextFunction } from 'express';
import { Character, ICharacter } from '../models/Character.model';
import { InsufficientEnergyError, NotFoundError, AuthenticationError } from '../utils/errors';
import {
  calculateCurrentEnergy,
  getTimeUntilEnergy,
  formatTimeRemaining,
  calculateEnergyDeficit,
} from '../utils/energy.utils';
import logger from '../utils/logger';

/**
 * Extended Request interface with energy information
 */
export interface EnergyRequest extends Request {
  user?: any;
  character?: ICharacter;
  energyCheck?: {
    current: number;
    cost: number;
    remaining: number;
    isPremium: boolean;
  };
}

/**
 * Middleware factory to require a specific amount of energy
 *
 * @param cost - Energy cost required for the action
 * @returns Express middleware function
 *
 * @example
 * router.post('/challenge', requireAuth, requireEnergy(10), challengeController.attempt);
 */
export function requireEnergy(cost: number) {
  return async (req: EnergyRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate cost parameter
      if (typeof cost !== 'number' || cost < 0) {
        logger.error(`Invalid energy cost: ${cost}`);
        throw new Error('Invalid energy cost configuration');
      }

      // Ensure user is authenticated
      if (!req.user || !req.user._id) {
        throw new AuthenticationError('Authentication required for energy check');
      }

      // Get character ID from request (could be in params, body, or query)
      const characterId = req.params.characterId || req.body.characterId || req.query.characterId;

      if (!characterId) {
        throw new NotFoundError('Character ID');
      }

      // Fetch character with latest energy data
      const character = await Character.findById(characterId);

      if (!character) {
        throw new NotFoundError('Character');
      }

      // Verify character ownership
      if (character.userId.toString() !== req.user._id.toString()) {
        throw new AuthenticationError('You do not own this character');
      }

      // Check if user has premium subscription
      // TODO: Get isPremium from user model when premium system is implemented
      const isPremium = false;

      // Calculate current energy with regeneration
      const currentEnergy = calculateCurrentEnergy(character, isPremium);

      // Check if character has sufficient energy
      if (currentEnergy < cost) {
        // Calculate deficit and time until available
        const deficit = calculateEnergyDeficit(character, cost, isPremium);
        const timeUntilAvailableMs = getTimeUntilEnergy(character, cost, isPremium);
        const timeFormatted = formatTimeRemaining(timeUntilAvailableMs);

        logger.debug(
          `Insufficient energy for character ${characterId}: ${currentEnergy}/${cost} (need ${deficit.deficit} more)`
        );

        // Throw insufficient energy error with detailed info
        throw new InsufficientEnergyError(
          deficit.current,
          deficit.required,
          deficit.deficit,
          timeFormatted,
          isPremium
        );
      }

      // Attach energy check info to request for controller use
      req.energyCheck = {
        current: currentEnergy,
        cost,
        remaining: currentEnergy - cost,
        isPremium,
      };

      // Attach character to request for controller convenience
      req.character = character;

      logger.debug(
        `Energy check passed for character ${characterId}: ${currentEnergy}/${cost} (${req.energyCheck.remaining} remaining after action)`
      );

      // Energy check passed, proceed to next middleware/controller
      next();
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  };
}

/**
 * Middleware to check energy without blocking the request
 * Attaches energy info to request but doesn't throw error if insufficient
 *
 * @param cost - Energy cost to check (optional)
 * @returns Express middleware function
 */
export function checkEnergy(cost?: number) {
  return async (req: EnergyRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user._id) {
        // No user, skip check
        return next();
      }

      const characterId = req.params.characterId || req.body.characterId || req.query.characterId;

      if (!characterId) {
        // No character ID, skip check
        return next();
      }

      const character = await Character.findById(characterId);

      if (!character || character.userId.toString() !== req.user._id.toString()) {
        // Character not found or not owned, skip check
        return next();
      }

      const isPremium = false; // TODO: Get from user model

      const currentEnergy = calculateCurrentEnergy(character, isPremium);

      // Attach energy info to request
      req.energyCheck = {
        current: currentEnergy,
        cost: cost || 0,
        remaining: cost ? currentEnergy - cost : currentEnergy,
        isPremium,
      };

      req.character = character;

      next();
    } catch (error) {
      // Log error but don't fail request
      logger.error('Energy check middleware error:', error);
      next();
    }
  };
}

export default {
  requireEnergy,
  checkEnergy,
};
