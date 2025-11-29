/**
 * Reputation Controller
 * Handles faction reputation API endpoints
 */

import { Request, Response } from 'express';
import { ReputationService, Faction, Standing } from '../services/reputation.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class ReputationController {
  /**
   * GET /api/reputation
   * Get all faction standings for the current character
   */
  static async getAllStandings(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const standings = await ReputationService.getAllStandings(characterId);

      // Add benefits for each faction
      const standingsWithBenefits = Object.entries(standings).reduce((acc, [faction, data]) => {
        acc[faction as Faction] = {
          ...data,
          benefits: ReputationService.getFactionBenefits(faction as Faction, data.standing),
          priceModifier: ReputationService.getPriceModifier(data.standing)
        };
        return acc;
      }, {} as Record<Faction, any>);

      res.json({
        success: true,
        data: standingsWithBenefits
      });
    } catch (error) {
      logger.error('Error getting faction standings:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get faction standings'
        });
      }
    }
  }

  /**
   * GET /api/reputation/:faction
   * Get standing with a specific faction
   */
  static async getFactionStanding(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const faction = req.params.faction as Faction;
      if (!['settlerAlliance', 'nahiCoalition', 'frontera'].includes(faction)) {
        throw new AppError('Invalid faction', 400);
      }

      const standings = await ReputationService.getAllStandings(characterId);
      const factionData = standings[faction];

      res.json({
        success: true,
        data: {
          faction,
          ...factionData,
          benefits: ReputationService.getFactionBenefits(faction, factionData.standing),
          priceModifier: ReputationService.getPriceModifier(factionData.standing),
          nextStanding: getNextStanding(factionData.standing),
          repNeededForNext: getRepNeededForNext(factionData.rep, factionData.standing)
        }
      });
    } catch (error) {
      logger.error('Error getting faction standing:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get faction standing'
        });
      }
    }
  }

  /**
   * GET /api/reputation/history
   * Get reputation change history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const faction = req.query.faction as Faction | undefined;
      const limit = parseInt(req.query.limit as string) || 50;

      if (faction && !['settlerAlliance', 'nahiCoalition', 'frontera'].includes(faction)) {
        throw new AppError('Invalid faction', 400);
      }

      const history = await ReputationService.getReputationHistory(characterId, faction, limit);

      res.json({
        success: true,
        data: {
          history,
          count: history.length
        }
      });
    } catch (error) {
      logger.error('Error getting reputation history:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get reputation history'
        });
      }
    }
  }

  /**
   * GET /api/reputation/benefits
   * Get all faction benefits at different standing levels
   */
  static async getBenefitsGuide(req: Request, res: Response): Promise<void> {
    try {
      const factions: Faction[] = ['settlerAlliance', 'nahiCoalition', 'frontera'];
      const standings: Standing[] = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored'];

      const guide = factions.reduce((acc, faction) => {
        acc[faction] = standings.reduce((standingAcc, standing) => {
          standingAcc[standing] = {
            threshold: ReputationService.getStandingThreshold(standing),
            priceModifier: ReputationService.getPriceModifier(standing),
            benefits: ReputationService.getFactionBenefits(faction, standing)
          };
          return standingAcc;
        }, {} as Record<Standing, any>);
        return acc;
      }, {} as Record<Faction, any>);

      res.json({
        success: true,
        data: guide
      });
    } catch (error) {
      logger.error('Error getting benefits guide:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get benefits guide'
      });
    }
  }
}

/**
 * Helper: Get next standing level
 */
function getNextStanding(current: Standing): Standing | null {
  const order: Standing[] = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored'];
  const index = order.indexOf(current);
  if (index === -1 || index === order.length - 1) return null;
  return order[index + 1];
}

/**
 * Helper: Calculate reputation needed for next standing
 */
function getRepNeededForNext(currentRep: number, currentStanding: Standing): number | null {
  const nextStanding = getNextStanding(currentStanding);
  if (!nextStanding) return null;

  const nextThreshold = ReputationService.getStandingThreshold(nextStanding);
  return Math.max(0, nextThreshold - currentRep);
}
