/**
 * Expedition Controller
 * Handles all expedition-related HTTP requests for offline progression
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { ExpeditionService } from '../services/expedition.service';
import { ExpeditionType, ExpeditionDurationTier, EXPEDITION_CONFIGS } from '@desperados/shared';
import logger from '../utils/logger';
import { clampLimit } from '../utils/validation';

/**
 * GET /api/expeditions/availability
 * Get available expedition types at current location
 */
export async function getAvailability(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const locationId = req.character?.currentLocation?.toString() || '';

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const availability = await ExpeditionService.checkAvailability(characterId, locationId);

    res.status(200).json({
      success: true,
      data: {
        locationId,
        expeditions: availability
      }
    });
  } catch (error) {
    logger.error('Error getting expedition availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expedition availability'
    });
  }
}

/**
 * GET /api/expeditions/types
 * Get all expedition type configurations
 */
export async function getExpeditionTypes(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const types = Object.entries(EXPEDITION_CONFIGS).map(([key, config]) => ({
      type: key,
      ...config
    }));

    res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    logger.error('Error getting expedition types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expedition types'
    });
  }
}

/**
 * GET /api/expeditions/active
 * Get active expedition for character
 */
export async function getActiveExpedition(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const expedition = await ExpeditionService.getActiveExpedition(characterId);

    res.status(200).json({
      success: true,
      data: {
        expedition: expedition ? ExpeditionService.toDTO(expedition) : null,
        hasActive: expedition !== null
      }
    });
  } catch (error) {
    logger.error('Error getting active expedition:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active expedition'
    });
  }
}

/**
 * GET /api/expeditions/history
 * Get expedition history for character
 */
export async function getExpeditionHistory(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    // SECURITY FIX: Clamp limit to prevent pagination DoS
    const limit = clampLimit(req.query.limit, { defaultLimit: 10, maxLimit: 50 });

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const expeditions = await ExpeditionService.getExpeditionHistory(characterId, limit);

    res.status(200).json({
      success: true,
      data: expeditions.map(e => ExpeditionService.toDTO(e))
    });
  } catch (error) {
    logger.error('Error getting expedition history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expedition history'
    });
  }
}

/**
 * POST /api/expeditions/start
 * Start a new expedition
 * Body: { type: ExpeditionType, durationTier: ExpeditionDurationTier, mountId?: string, suppliesItemIds?: string[], gangMemberIds?: string[] }
 */
export async function startExpedition(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const locationId = req.character?.currentLocation?.toString() || '';
    const { type, durationTier, mountId, suppliesItemIds, gangMemberIds, customDurationMs } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!type || !Object.values(ExpeditionType).includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Valid expedition type required'
      });
      return;
    }

    if (!durationTier || !Object.values(ExpeditionDurationTier).includes(durationTier)) {
      res.status(400).json({
        success: false,
        error: 'Valid duration tier required'
      });
      return;
    }

    const expedition = await ExpeditionService.startExpedition(characterId, locationId, {
      type,
      durationTier,
      customDurationMs,
      mountId,
      suppliesItemIds,
      gangMemberIds
    });

    logger.info(`Character ${characterId} started ${type} expedition`);

    res.status(200).json({
      success: true,
      data: ExpeditionService.toDTO(expedition)
    });
  } catch (error) {
    const message = (error as Error).message;
    logger.error('Error starting expedition:', error);

    // Return specific error messages for expected failures
    if (message.includes('already have') ||
        message.includes('Requires') ||
        message.includes('Cannot start') ||
        message.includes('level')) {
      res.status(400).json({
        success: false,
        error: message
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to start expedition'
    });
  }
}

/**
 * POST /api/expeditions/:expeditionId/cancel
 * Cancel an active expedition
 */
export async function cancelExpedition(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { expeditionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!expeditionId) {
      res.status(400).json({
        success: false,
        error: 'Expedition ID required'
      });
      return;
    }

    await ExpeditionService.cancelExpedition(characterId, expeditionId);

    logger.info(`Character ${characterId} cancelled expedition ${expeditionId}`);

    res.status(200).json({
      success: true,
      message: 'Expedition cancelled successfully'
    });
  } catch (error) {
    const message = (error as Error).message;
    logger.error('Error cancelling expedition:', error);

    if (message.includes('not found') || message.includes('does not belong')) {
      res.status(404).json({
        success: false,
        error: message
      });
      return;
    }

    if (message.includes('Can only cancel')) {
      res.status(400).json({
        success: false,
        error: message
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to cancel expedition'
    });
  }
}

/**
 * GET /api/expeditions/:expeditionId
 * Get details of a specific expedition
 */
export async function getExpeditionDetails(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { expeditionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!expeditionId) {
      res.status(400).json({
        success: false,
        error: 'Expedition ID required'
      });
      return;
    }

    // Use the active expedition if matches, otherwise search history
    const activeExpedition = await ExpeditionService.getActiveExpedition(characterId);

    if (activeExpedition && activeExpedition._id.toString() === expeditionId) {
      res.status(200).json({
        success: true,
        data: ExpeditionService.toDTO(activeExpedition)
      });
      return;
    }

    // Check history
    const history = await ExpeditionService.getExpeditionHistory(characterId, 50);
    const expedition = history.find(e => e._id.toString() === expeditionId);

    if (!expedition) {
      res.status(404).json({
        success: false,
        error: 'Expedition not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: ExpeditionService.toDTO(expedition)
    });
  } catch (error) {
    logger.error('Error getting expedition details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expedition details'
    });
  }
}
