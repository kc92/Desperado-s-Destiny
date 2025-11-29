/**
 * Bribe Controller
 *
 * Handles HTTP requests for bribery system endpoints
 */

import { Request, Response } from 'express';
import { BribeService } from '../services/bribe.service';
import logger from '../utils/logger';

export class BribeController {
  /**
   * POST /api/bribe/guard
   * Bribe a guard to bypass wanted level restrictions
   * Body: { buildingId: string, amount: number }
   */
  static async bribeGuard(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { buildingId, amount } = req.body;

      if (!buildingId || typeof buildingId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Valid building ID is required'
        });
        return;
      }

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid positive bribe amount is required'
        });
        return;
      }

      const result = await BribeService.bribeGuard(characterId, buildingId, amount);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message
        });
        return;
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error bribing guard:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bribe guard'
      });
    }
  }

  /**
   * POST /api/bribe/npc
   * Bribe an NPC for information or services
   * Body: { npcId: string, amount: number }
   */
  static async bribeNPC(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { npcId, amount } = req.body;

      if (!npcId || typeof npcId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Valid NPC ID is required'
        });
        return;
      }

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid positive bribe amount is required'
        });
        return;
      }

      const result = await BribeService.bribeNPC(characterId, npcId, amount);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error bribing NPC:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bribe NPC'
      });
    }
  }

  /**
   * GET /api/bribe/calculate
   * Calculate recommended bribe amount for an NPC
   * Query params: npcFaction, requestDifficulty
   */
  static async calculateRecommended(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const npcFaction = req.query.npcFaction as string | undefined;
      const requestDifficulty = parseInt(req.query.requestDifficulty as string, 10) || 5;

      if (requestDifficulty < 1 || requestDifficulty > 10) {
        res.status(400).json({
          success: false,
          error: 'Request difficulty must be between 1 and 10'
        });
        return;
      }

      const recommendedAmount = BribeService.calculateRecommendedBribe(
        npcFaction,
        character.faction,
        requestDifficulty
      );

      res.json({
        success: true,
        data: {
          recommendedAmount,
          npcFaction: npcFaction || 'neutral',
          characterFaction: character.faction,
          requestDifficulty,
          canAfford: character.gold >= recommendedAmount,
          characterGold: character.gold
        }
      });
    } catch (error) {
      logger.error('Error calculating recommended bribe:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate bribe'
      });
    }
  }

  /**
   * GET /api/bribe/options/:buildingId
   * Get bribe options for a specific building
   */
  static async getBuildingOptions(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const buildingId = req.params.buildingId;

      if (!buildingId) {
        res.status(400).json({
          success: false,
          error: 'Building ID is required'
        });
        return;
      }

      // Calculate bribe costs based on wanted level
      const baseBribeCost = 50;
      const wantedMultiplier = 1 + (character.wantedLevel * 0.5);
      const bribeCost = Math.floor(baseBribeCost * wantedMultiplier);

      res.json({
        success: true,
        data: {
          buildingId,
          wantedLevel: character.wantedLevel,
          bribeCost,
          canAfford: character.gold >= bribeCost,
          characterGold: character.gold,
          accessDuration: 30, // minutes
          successChance: Math.max(50, 100 - (character.wantedLevel * 10))
        }
      });
    } catch (error) {
      logger.error('Error getting building bribe options:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bribe options'
      });
    }
  }
}
