/**
 * Hunting Controller
 * Handles all hunting-related HTTP requests
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { HuntingService } from '../services/hunting.service';
import { HuntingWeapon } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * GET /api/hunting/availability
 * Check if character can hunt and get available hunting grounds
 */
export async function checkHuntAvailability(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const availability = await HuntingService.checkHuntAvailability(characterId);

    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    logger.error('Error checking hunt availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check hunt availability'
    });
  }
}

/**
 * POST /api/hunting/start
 * Start a new hunting trip
 * Body: { huntingGroundId: string, weapon: HuntingWeapon }
 */
export async function startHunt(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { huntingGroundId, weapon } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!huntingGroundId) {
      res.status(400).json({
        success: false,
        error: 'Hunting ground ID required'
      });
      return;
    }

    // Validate weapon enum
    const validWeapons = Object.values(HuntingWeapon);
    if (weapon && !validWeapons.includes(weapon)) {
      res.status(400).json({
        success: false,
        error: `Invalid weapon. Must be one of: ${validWeapons.join(', ')}`
      });
      return;
    }

    const result = await HuntingService.startHunt(
      characterId,
      huntingGroundId,
      weapon || HuntingWeapon.PISTOL
    );

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    logger.info(`Character ${characterId} started hunting at ${huntingGroundId}`);

    res.status(200).json({
      success: true,
      data: {
        trip: result.trip,
        message: 'Hunting trip started successfully'
      }
    });
  } catch (error) {
    logger.error('Error starting hunt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start hunting trip'
    });
  }
}

/**
 * GET /api/hunting/current
 * Get current hunting trip for character
 */
export async function getCurrentTrip(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const trip = await HuntingService.getCurrentTrip(characterId);

    res.status(200).json({
      success: true,
      data: {
        trip,
        isActive: trip !== null
      }
    });
  } catch (error) {
    logger.error('Error getting current trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current hunting trip'
    });
  }
}

/**
 * GET /api/hunting/statistics
 * Get hunting statistics for character
 */
export async function getHuntingStatistics(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const stats = await HuntingService.getHuntingStatistics(characterId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting hunting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hunting statistics'
    });
  }
}

/**
 * POST /api/hunting/abandon
 * Abandon the current hunting trip
 */
export async function abandonHunt(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const result = await HuntingService.abandonHunt(characterId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    logger.info(`Character ${characterId} abandoned hunting trip`);

    res.status(200).json({
      success: true,
      data: {
        message: 'Hunting trip abandoned'
      }
    });
  } catch (error) {
    logger.error('Error abandoning hunt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to abandon hunting trip'
    });
  }
}
