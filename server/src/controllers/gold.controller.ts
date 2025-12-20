/**
 * Gold Controller
 *
 * Handles gold economy HTTP requests
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DollarService } from '../services/dollar.service';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

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

      const balance = await DollarService.getBalance(character._id as any);

      res.json({
        success: true,
        data: {
          dollars: balance,
          characterId: (character._id as any).toString(),
          characterName: character.name,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching gold balance:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
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

      // H8 SECURITY FIX: Safer numeric parsing with bounds validation
      // Use Number() to get the actual value (parseInt stops at non-digit chars)
      const limitRaw = Number(req.query['limit']);
      const offsetRaw = Number(req.query['offset']);

      // Default to safe values if parsing fails or value is missing
      // Note: Number(undefined) returns NaN, Number("") returns 0
      const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 50;
      const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.floor(offsetRaw) : 0;

      // Validate pagination params - H8: Add upper bound on offset to prevent DoS
      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }

      const MAX_OFFSET = 100000; // Prevent massive skip values
      if (offset < 0 || offset > MAX_OFFSET) {
        res.status(400).json({ error: `Offset must be between 0 and ${MAX_OFFSET}` });
        return;
      }

      const history = await DollarService.getTransactionHistory(character._id as any, limit, offset);
      const stats = await DollarService.getStatistics(character._id as any);

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
      res.status(500).json({ error: sanitizeErrorMessage(error) });
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

      const stats = await DollarService.getStatistics(character._id as any);
      const currentBalance = await DollarService.getBalance(character._id as any);

      res.json({
        success: true,
        data: {
          currentBalance,
          ...stats,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching gold statistics:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }
}
