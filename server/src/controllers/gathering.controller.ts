/**
 * Gathering Controller
 * Handles HTTP requests for resource gathering
 * Phase 7, Wave 7.3 - AAA Crafting System
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { GatheringService } from '../services/gathering.service';
import { getNodeById } from '../data/gatheringNodes';
import logger from '../utils/logger';

/**
 * GET /api/gathering/nodes
 * Get all gathering nodes at character's current location
 */
export async function getNodesAtLocation(
  req: CharacterRequest,
  res: Response
): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required',
      });
      return;
    }

    const { locationId } = req.query;

    const result = await GatheringService.getNodesAtLocation(
      characterId,
      locationId as string | undefined
    );

    res.status(200).json({
      success: true,
      data: {
        nodes: result.nodes.map(node => ({
          id: node.id,
          type: node.type,
          name: node.name,
          description: node.description,
          skillRequired: node.skillRequired,
          levelRequired: node.levelRequired,
          energyCost: node.energyCost,
          cooldownSeconds: node.cooldownSeconds,
          toolRequired: node.toolRequired,
          toolBonus: node.toolBonus,
          yields: node.yields.map(y => ({
            name: y.name,
            rarity: y.rarity,
          })),
        })),
        available: result.available.map(node => node.id),
        cooldowns: result.cooldowns,
      },
    });
  } catch (error) {
    logger.error('Error fetching gathering nodes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gathering nodes',
    });
  }
}

/**
 * GET /api/gathering/nodes/:nodeId
 * Get details for a specific gathering node
 */
export async function getNodeDetails(
  req: CharacterRequest,
  res: Response
): Promise<void> {
  try {
    const { nodeId } = req.params;

    const node = getNodeById(nodeId);
    if (!node) {
      res.status(404).json({
        success: false,
        error: 'Gathering node not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        node: {
          id: node.id,
          type: node.type,
          name: node.name,
          description: node.description,
          skillRequired: node.skillRequired,
          levelRequired: node.levelRequired,
          energyCost: node.energyCost,
          cooldownSeconds: node.cooldownSeconds,
          toolRequired: node.toolRequired,
          toolBonus: node.toolBonus,
          locationIds: node.locationIds,
          yields: node.yields.map(y => ({
            name: y.name,
            minQuantity: y.minQuantity,
            maxQuantity: y.maxQuantity,
            chance: y.chance,
            rarity: y.rarity,
          })),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching node details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch node details',
    });
  }
}

/**
 * GET /api/gathering/check/:nodeId
 * Check if character can gather from a specific node
 */
export async function checkGatherRequirements(
  req: CharacterRequest,
  res: Response
): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { nodeId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required',
      });
      return;
    }

    const result = await GatheringService.checkRequirements(characterId, nodeId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error checking gather requirements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check requirements',
    });
  }
}

/**
 * POST /api/gathering/gather
 * Gather resources from a node
 * Body: { nodeId: string }
 */
export async function gather(
  req: CharacterRequest,
  res: Response
): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { nodeId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required',
      });
      return;
    }

    if (!nodeId) {
      res.status(400).json({
        success: false,
        error: 'Node ID required in request body',
      });
      return;
    }

    const result = await GatheringService.gather(characterId, nodeId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error gathering:', error);

    const status = error.statusCode || 500;
    const message = error.message || 'Failed to gather';

    res.status(status).json({
      success: false,
      error: message,
    });
  }
}

/**
 * GET /api/gathering/cooldowns
 * Get all active gathering cooldowns for character
 */
export async function getCooldowns(
  req: CharacterRequest,
  res: Response
): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required',
      });
      return;
    }

    const cooldowns = GatheringService.getActiveCooldowns(characterId);

    res.status(200).json({
      success: true,
      data: {
        cooldowns,
      },
    });
  } catch (error) {
    logger.error('Error fetching cooldowns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cooldowns',
    });
  }
}
