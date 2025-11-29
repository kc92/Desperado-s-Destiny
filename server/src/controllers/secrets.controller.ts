/**
 * Secrets Controller
 * Handles secret discovery and hidden content API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { SecretsService } from '../services/secrets.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/errors';

/**
 * Check if character can unlock a secret
 * GET /api/secrets/check/:secretId
 */
export const checkSecretUnlock = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { secretId } = req.params;

    if (!secretId) {
      throw new AppError('Secret ID is required', 400);
    }

    const unlockCheck = await SecretsService.canUnlockSecret(characterId, secretId);

    res.status(200).json({
      success: true,
      data: unlockCheck
    });
  }
);

/**
 * Unlock a secret
 * POST /api/secrets/unlock
 */
export const unlockSecret = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { secretId } = req.body;

    if (!secretId) {
      throw new AppError('Secret ID is required', 400);
    }

    const result = await SecretsService.unlockSecret(characterId, secretId);

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      data: result
    });
  }
);

/**
 * Get secrets at a location
 * GET /api/secrets/location/:locationId
 */
export const getLocationSecrets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { locationId } = req.params;

    if (!locationId) {
      throw new AppError('Location ID is required', 400);
    }

    const secrets = await SecretsService.getLocationSecrets(locationId, characterId);

    res.status(200).json({
      success: true,
      data: secrets
    });
  }
);

/**
 * Check character's secret progress
 * GET /api/secrets/progress
 */
export const checkSecretProgress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const qualifiedSecrets = await SecretsService.checkSecretProgress(characterId);

    res.status(200).json({
      success: true,
      data: {
        count: qualifiedSecrets.length,
        secrets: qualifiedSecrets,
        message: qualifiedSecrets.length > 0
          ? `You now qualify for ${qualifiedSecrets.length} new secret${qualifiedSecrets.length > 1 ? 's' : ''}!`
          : 'No new secrets available'
      }
    });
  }
);

/**
 * Get all discovered secrets for character
 * GET /api/secrets/discovered
 */
export const getDiscoveredSecrets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const secrets = await SecretsService.getDiscoveredSecrets(characterId);

    res.status(200).json({
      success: true,
      data: {
        total: secrets.length,
        secrets
      }
    });
  }
);

/**
 * Get secrets by type
 * GET /api/secrets/type/:type
 */
export const getSecretsByType = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { type } = req.params;

    if (!type) {
      throw new AppError('Secret type is required', 400);
    }

    const secrets = await SecretsService.getSecretsByType(characterId, type);

    res.status(200).json({
      success: true,
      data: secrets
    });
  }
);

/**
 * Get secret details
 * GET /api/secrets/:secretId
 */
export const getSecretDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { secretId } = req.params;

    if (!secretId) {
      throw new AppError('Secret ID is required', 400);
    }

    const details = await SecretsService.getSecretDetails(characterId, secretId);

    res.status(200).json({
      success: true,
      data: details
    });
  }
);

/**
 * Get secrets related to an NPC
 * GET /api/secrets/npc/:npcId
 */
export const getNPCSecrets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { npcId } = req.params;

    if (!npcId) {
      throw new AppError('NPC ID is required', 400);
    }

    const secrets = await SecretsService.getNPCSecrets(npcId, characterId);

    res.status(200).json({
      success: true,
      data: secrets
    });
  }
);

/**
 * Get character's secret statistics
 * GET /api/secrets/stats
 */
export const getSecretStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const stats = await SecretsService.getSecretStatistics(characterId);

    res.status(200).json({
      success: true,
      data: stats
    });
  }
);

/**
 * Get all available secret types
 * GET /api/secrets/types
 */
export const getSecretTypes = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const types = [
      {
        id: 'location_secret',
        name: 'Location Secret',
        description: 'Hidden areas and secret rooms in locations',
        icon: 'map-pin'
      },
      {
        id: 'npc_secret',
        name: 'NPC Secret',
        description: 'Backstories and hidden dialogue from NPCs',
        icon: 'users'
      },
      {
        id: 'item_secret',
        name: 'Item Secret',
        description: 'Clues to finding legendary items',
        icon: 'package'
      },
      {
        id: 'quest_secret',
        name: 'Quest Secret',
        description: 'Hidden quests and special missions',
        icon: 'scroll'
      },
      {
        id: 'lore_secret',
        name: 'Lore Secret',
        description: 'Deep world lore and historical revelations',
        icon: 'book'
      },
      {
        id: 'treasure_secret',
        name: 'Treasure Secret',
        description: 'Hidden stashes and buried treasure',
        icon: 'treasure-chest'
      }
    ];

    res.status(200).json({
      success: true,
      data: { types }
    });
  }
);
