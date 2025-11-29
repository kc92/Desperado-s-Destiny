/**
 * Tracking Controller
 * Handles all tracking-related HTTP requests for the hunting system
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { TrackingService } from '../services/tracking.service';
import logger from '../utils/logger';

/**
 * POST /api/tracking/attempt
 * Attempt to track an animal during a hunting trip
 * Body: { tripId: string }
 */
export async function attemptTracking(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { tripId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!tripId) {
      res.status(400).json({
        success: false,
        error: 'Trip ID required'
      });
      return;
    }

    const result = await TrackingService.attemptTracking(characterId, tripId);

    if (!result.success) {
      // Return appropriate status based on the error
      const status = result.message?.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        error: result.message
      });
      return;
    }

    logger.info(`Character ${characterId} tracked animal: ${result.animalType}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error attempting tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to attempt tracking'
    });
  }
}
