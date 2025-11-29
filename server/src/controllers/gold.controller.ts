/**
 * Gold Controller
 *
 * Handles gold economy HTTP requests
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import { GoldService } from '../services/gold.service';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

export class GoldController {
  /**
   * GET /api/gold/balance
   * Get current gold balance for active character
   */
  static async getBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const balance = await GoldService.getBalance(character._id as any);

      res.json({
        success: true,
        data: {
          gold: balance,
          characterId: (character._id as any).toString(),
          characterName: character.name,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching gold balance:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/gold/history
   * Get transaction history for active character (paginated)
   */
  static async getHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const limit = parseInt(req.query['limit'] as string) || 50;
      const offset = parseInt(req.query['offset'] as string) || 0;

      // Validate pagination params
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }

      if (offset < 0) {
        res.status(400).json({ error: 'Offset must be non-negative' });
        return;
      }

      const history = await GoldService.getTransactionHistory(character._id as any, limit, offset);
      const stats = await GoldService.getStatistics(character._id as any);

      res.json({
        success: true,
        data: {
          transactions: history,
          statistics: stats,
          pagination: {
            limit,
            offset,
            total: stats.transactionCount,
            hasMore: offset + limit < stats.transactionCount,
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching gold history:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/gold/statistics
   * Get detailed statistics about gold earnings and spending
   */
  static async getStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const stats = await GoldService.getStatistics(character._id as any);
      const currentBalance = await GoldService.getBalance(character._id as any);

      res.json({
        success: true,
        data: {
          currentBalance,
          ...stats,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching gold statistics:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
