/**
 * Fishing Controller
 * Handles all fishing-related HTTP requests
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { FishingService } from '../services/fishing.service';
import logger from '../utils/logger';

/**
 * POST /api/fishing/start
 * Start a new fishing session
 * Body: { locationId: string, spotType: string, setup: FishingSetup }
 */
export async function startFishing(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { locationId, spotType, setup } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!locationId || !spotType || !setup) {
      res.status(400).json({
        success: false,
        error: 'Location ID, spot type, and setup are required'
      });
      return;
    }

    const result = await FishingService.startFishing(characterId, locationId, spotType, setup);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message
      });
      return;
    }

    logger.info(`Character ${characterId} started fishing at ${locationId}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error starting fishing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start fishing session'
    });
  }
}

/**
 * GET /api/fishing/session
 * Get current fishing session for character
 */
export async function getCurrentSession(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const session = await FishingService.getCurrentSession(characterId);

    res.status(200).json({
      success: true,
      data: {
        session,
        isActive: session !== null
      }
    });
  } catch (error) {
    logger.error('Error getting fishing session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fishing session'
    });
  }
}

/**
 * POST /api/fishing/check-bite
 * Check for a bite during fishing session
 */
export async function checkForBite(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const result = await FishingService.checkForBite(characterId);

    if (!result.success && result.message === 'No active fishing session') {
      res.status(404).json({
        success: false,
        error: result.message
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error checking for bite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check for bite'
    });
  }
}

/**
 * POST /api/fishing/set-hook
 * Set the hook when a bite is detected
 */
export async function setHook(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const result = await FishingService.setHook(characterId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message
      });
      return;
    }

    logger.info(`Character ${characterId} set hook successfully`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error setting hook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set hook'
    });
  }
}

/**
 * POST /api/fishing/end
 * End the current fishing session
 */
export async function endFishing(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const result = await FishingService.endFishing(characterId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message
      });
      return;
    }

    logger.info(`Character ${characterId} ended fishing session`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error ending fishing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end fishing session'
    });
  }
}
