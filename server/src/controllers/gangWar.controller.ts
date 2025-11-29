/**
 * Gang War Controller
 *
 * HTTP endpoints for gang war management
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GangWarService } from '../services/gangWar.service';
import { Gang } from '../models/Gang.model';
import logger from '../utils/logger';

export class GangWarController {
  /**
   * GET /api/wars
   * List all active wars
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const wars = await GangWarService.getActiveWars();

      res.status(200).json({
        success: true,
        data: {
          wars,
          total: wars.length,
        },
      });
    } catch (error) {
      logger.error('Error listing wars:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list wars',
      });
    }
  }

  /**
   * GET /api/wars/:id
   * Get single war by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const war = await GangWarService.getWar(new mongoose.Types.ObjectId(id));

      res.status(200).json({
        success: true,
        data: { war },
      });
    } catch (error) {
      logger.error('Error getting war:', error);
      const message = error instanceof Error ? error.message : 'Failed to get war';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/wars/:id/contribute
   * Contribute gold to a war
   */
  static async contribute(req: Request, res: Response): Promise<void> {
    try {
      const { id: warId } = req.params;
      const { amount } = req.body;
      const characterId = req.user?.characterId;

      if (!characterId) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      if (!amount || typeof amount !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Amount is required',
        });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
        return;
      }

      const gang = await Gang.findByMember(new mongoose.Types.ObjectId(characterId));
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to contribute to a war',
        });
        return;
      }

      const war = await GangWarService.contributeToWar(
        new mongoose.Types.ObjectId(warId),
        new mongoose.Types.ObjectId(characterId),
        amount
      );

      res.status(200).json({
        success: true,
        data: { war },
        message: `Contributed ${amount} gold to war`,
      });
    } catch (error) {
      logger.error('Error contributing to war:', error);
      const message = error instanceof Error ? error.message : 'Failed to contribute to war';
      const statusCode = message.includes('not found') ? 404 :
                         message.includes('Insufficient') ? 400 :
                         message.includes('not involved') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/wars/:id/resolve
   * Manually resolve a war (admin only, for testing)
   */
  static async resolve(req: Request, res: Response): Promise<void> {
    try {
      const { id: warId } = req.params;

      const { war, territory } = await GangWarService.resolveWar(
        new mongoose.Types.ObjectId(warId)
      );

      res.status(200).json({
        success: true,
        data: { war, territory },
        message: 'War resolved successfully',
      });
    } catch (error) {
      logger.error('Error resolving war:', error);
      const message = error instanceof Error ? error.message : 'Failed to resolve war';
      const statusCode = message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/wars/gang/:gangId
   * Get all active wars involving a gang
   */
  static async getGangWars(req: Request, res: Response): Promise<void> {
    try {
      const { gangId } = req.params;

      const wars = await GangWarService.getGangWars(new mongoose.Types.ObjectId(gangId));

      res.status(200).json({
        success: true,
        data: {
          wars,
          total: wars.length,
        },
      });
    } catch (error) {
      logger.error('Error getting gang wars:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get gang wars',
      });
    }
  }
}
