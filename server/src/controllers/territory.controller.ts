/**
 * Territory Controller
 *
 * HTTP endpoints for territory management
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { TerritoryService } from '../services/territory.service';
import { GangWarService } from '../services/gangWar.service';
import { Gang } from '../models/Gang.model';
import logger from '../utils/logger';

export class TerritoryController {
  /**
   * GET /api/territories
   * List all territories with their status
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const territories = await TerritoryService.getTerritories();

      res.status(200).json({
        success: true,
        data: {
          territories,
          total: territories.length,
        },
      });
    } catch (error) {
      logger.error('Error listing territories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list territories',
      });
    }
  }

  /**
   * GET /api/territories/:id
   * Get single territory by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const territory = await TerritoryService.getTerritory(id);

      res.status(200).json({
        success: true,
        data: { territory },
      });
    } catch (error) {
      logger.error('Error getting territory:', error);
      const message = error instanceof Error ? error.message : 'Failed to get territory';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/territories/:id/declare-war
   * Declare war on a territory (gang leader only)
   */
  static async declareWar(req: Request, res: Response): Promise<void> {
    try {
      const { id: territoryId } = req.params;
      const { funding } = req.body;
      const characterId = req.user?.characterId;

      if (!characterId) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      if (!funding || typeof funding !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Funding amount is required',
        });
        return;
      }

      if (funding < 1000) {
        res.status(400).json({
          success: false,
          error: 'Minimum war funding is 1000 gold',
        });
        return;
      }

      const gang = await Gang.findByMember(new mongoose.Types.ObjectId(characterId));
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to declare war',
        });
        return;
      }

      if (gang.leaderId.toString() !== characterId) {
        res.status(403).json({
          success: false,
          error: 'Only gang leader can declare war',
        });
        return;
      }

      const war = await GangWarService.declareWar(
        gang._id as mongoose.Types.ObjectId,
        new mongoose.Types.ObjectId(characterId),
        territoryId,
        funding
      );

      res.status(201).json({
        success: true,
        data: { war },
        message: `War declared on ${territoryId} with ${funding} gold`,
      });
    } catch (error) {
      logger.error('Error declaring war:', error);
      const message = error instanceof Error ? error.message : 'Failed to declare war';
      const statusCode = message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/territories/:id/wars
   * Get war history for a territory
   */
  static async getWars(req: Request, res: Response): Promise<void> {
    try {
      const { id: territoryId } = req.params;
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const { wars, total } = await GangWarService.getWarHistory(territoryId, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          wars,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      });
    } catch (error) {
      logger.error('Error getting territory wars:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get war history',
      });
    }
  }

  /**
   * GET /api/territories/:id/history
   * Get conquest history for a territory
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id: territoryId } = req.params;
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

      const history = await TerritoryService.getConquestHistory(territoryId, limit);

      res.status(200).json({
        success: true,
        data: {
          history,
          total: history.length,
        },
      });
    } catch (error) {
      logger.error('Error getting conquest history:', error);
      const message = error instanceof Error ? error.message : 'Failed to get conquest history';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/territories/stats
   * Get territory statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await TerritoryService.getTerritoryStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Error getting territory stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get territory statistics',
      });
    }
  }
}
