/**
 * Production Controller
 * Handles all production-related HTTP requests for property production systems
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { ProductionService } from '../services/production.service';
import logger from '../utils/logger';

/**
 * POST /api/production/start
 * Start a new production order
 * Body: { slotId, productId, quantity, workerIds?, rushOrder? }
 */
export async function startProduction(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { slotId, productId, quantity, workerIds, rushOrder } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!slotId) {
      res.status(400).json({
        success: false,
        error: 'Slot ID required'
      });
      return;
    }

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID required'
      });
      return;
    }

    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        error: 'Valid quantity required (minimum 1)'
      });
      return;
    }

    const result = await ProductionService.startProduction(
      slotId,
      productId,
      quantity,
      characterId,
      workerIds || [],
      rushOrder || false
    );

    logger.info(`Character ${characterId} started production: ${productId} x${quantity}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error starting production:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to start production'
    });
  }
}

/**
 * POST /api/production/collect/:slotId
 * Collect completed production from a slot
 * Body: { autoSell? }
 */
export async function collectProduction(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { slotId } = req.params;
    const { autoSell } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!slotId) {
      res.status(400).json({
        success: false,
        error: 'Slot ID required'
      });
      return;
    }

    const result = await ProductionService.collectProduction(
      slotId,
      characterId,
      autoSell || false
    );

    logger.info(`Character ${characterId} collected production from slot ${slotId}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error collecting production:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to collect production'
    });
  }
}

/**
 * POST /api/production/cancel/:slotId
 * Cancel an active production order
 */
export async function cancelProduction(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { slotId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!slotId) {
      res.status(400).json({
        success: false,
        error: 'Slot ID required'
      });
      return;
    }

    const result = await ProductionService.cancelProduction(slotId, characterId);

    logger.info(`Character ${characterId} cancelled production in slot ${slotId}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error cancelling production:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to cancel production'
    });
  }
}

/**
 * GET /api/production/slot/:slotId
 * Get details for a specific production slot
 */
export async function getSlotDetails(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { slotId } = req.params;

    if (!slotId) {
      res.status(400).json({
        success: false,
        error: 'Slot ID required'
      });
      return;
    }

    const slot = await ProductionService.getSlotDetails(slotId);

    if (!slot) {
      res.status(404).json({
        success: false,
        error: 'Production slot not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { slot }
    });
  } catch (error: any) {
    logger.error('Error fetching slot details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slot details'
    });
  }
}

/**
 * GET /api/production/property/:propertyId
 * Get all production slots for a property
 */
export async function getPropertySlots(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      res.status(400).json({
        success: false,
        error: 'Property ID required'
      });
      return;
    }

    const slots = await ProductionService.getPropertySlots(propertyId);

    res.status(200).json({
      success: true,
      data: {
        propertyId,
        slots,
        count: slots.length
      }
    });
  } catch (error: any) {
    logger.error('Error fetching property slots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property slots'
    });
  }
}

/**
 * GET /api/production/active
 * Get all active productions for the authenticated character
 */
export async function getActiveProductions(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const productions = await ProductionService.getActiveProductions(characterId);

    res.status(200).json({
      success: true,
      data: {
        productions,
        count: productions.length
      }
    });
  } catch (error: any) {
    logger.error('Error fetching active productions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active productions'
    });
  }
}

/**
 * GET /api/production/completed
 * Get all completed productions ready for collection
 */
export async function getCompletedProductions(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const productions = await ProductionService.getCompletedProductions(characterId);

    res.status(200).json({
      success: true,
      data: {
        productions,
        count: productions.length
      }
    });
  } catch (error: any) {
    logger.error('Error fetching completed productions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch completed productions'
    });
  }
}

/**
 * POST /api/production/update-statuses
 * Admin endpoint to update production statuses (called by cron job)
 */
export async function updateProductionStatuses(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const updatedCount = await ProductionService.updateProductionStatuses();

    res.status(200).json({
      success: true,
      data: {
        message: `Updated ${updatedCount} production slots to ready status`,
        updatedCount
      }
    });
  } catch (error: any) {
    logger.error('Error updating production statuses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update production statuses'
    });
  }
}
