/**
 * Currency Controller
 *
 * Handles all currency-related HTTP requests:
 * - Dollars (primary currency)
 * - Gold Resource (valuable material)
 * - Silver Resource (common material)
 * - Exchange operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DollarService } from '../services/dollar.service';
import { ResourceService } from '../services/resource.service';
import { CurrencyExchangeService } from '../services/currencyExchange.service';
import { Character } from '../models/Character.model';
import { CurrencyType } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

export class CurrencyController {
  /**
   * GET /api/currency/balance
   * Get all currency balances for active character
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

      const dollars = await DollarService.getBalance(character._id as any);
      const resources = await ResourceService.getAllBalances(character._id as any);

      res.json({
        success: true,
        data: {
          characterId: (character._id as any).toString(),
          characterName: character.name,
          dollars,
          goldResource: resources.gold,
          silverResource: resources.silver,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching currency balance:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/currency/history
   * Get transaction history for active character (paginated)
   * Query params: limit, offset, type (optional: 'DOLLAR' | 'GOLD_RESOURCE' | 'SILVER_RESOURCE')
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

      const limitRaw = Number(req.query['limit']);
      const offsetRaw = Number(req.query['offset']);
      const currencyType = req.query['type'] as string | undefined;

      const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 50;
      const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.floor(offsetRaw) : 0;

      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }

      const MAX_OFFSET = 100000;
      if (offset < 0 || offset > MAX_OFFSET) {
        res.status(400).json({ error: `Offset must be between 0 and ${MAX_OFFSET}` });
        return;
      }

      // Validate currency type if provided
      if (currencyType && !Object.values(CurrencyType).includes(currencyType as CurrencyType)) {
        res.status(400).json({
          error: `Invalid currency type. Must be one of: ${Object.values(CurrencyType).join(', ')}`
        });
        return;
      }

      const history = await DollarService.getTransactionHistory(
        character._id as any,
        limit,
        offset,
        currencyType as CurrencyType | undefined
      );
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
      logger.error('Error fetching currency history:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/currency/statistics
   * Get detailed statistics about currency earnings and spending
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

      const dollarStats = await DollarService.getStatistics(character._id as any);
      const dollarBalance = await DollarService.getBalance(character._id as any);
      const goldStats = await ResourceService.getStatistics(character._id as any, 'gold');
      const silverStats = await ResourceService.getStatistics(character._id as any, 'silver');
      const resources = await ResourceService.getAllBalances(character._id as any);

      res.json({
        success: true,
        data: {
          dollars: {
            currentBalance: dollarBalance,
            ...dollarStats,
          },
          goldResource: {
            currentBalance: resources.gold,
            ...goldStats,
          },
          silverResource: {
            currentBalance: resources.silver,
            ...silverStats,
          },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching currency statistics:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/currency/rates
   * Get current exchange rates for gold and silver resources
   */
  static async getExchangeRates(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const rates = await CurrencyExchangeService.getExchangeRates();

      res.json({
        success: true,
        data: rates,
      });
    } catch (error: any) {
      logger.error('Error fetching exchange rates:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/currency/rates/history
   * Get price history for a resource type
   * Query params: type ('gold' | 'silver'), days (default 7)
   */
  static async getPriceHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resourceType = req.query['type'] as 'gold' | 'silver';
      const daysRaw = Number(req.query['days']);
      const days = Number.isFinite(daysRaw) && daysRaw > 0 ? Math.floor(daysRaw) : 7;

      if (!resourceType || !['gold', 'silver'].includes(resourceType)) {
        res.status(400).json({ error: 'Type must be "gold" or "silver"' });
        return;
      }

      if (days < 1 || days > 30) {
        res.status(400).json({ error: 'Days must be between 1 and 30' });
        return;
      }

      const history = await CurrencyExchangeService.getPriceHistory(resourceType, days);

      res.json({
        success: true,
        data: {
          resourceType,
          days,
          history,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching price history:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/currency/exchange/sell
   * Sell resource (gold/silver) for dollars
   * Body: { type: 'gold' | 'silver', amount: number }
   */
  static async sellResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const { type, amount } = req.body;

      if (!type || !['gold', 'silver'].includes(type)) {
        res.status(400).json({ error: 'Type must be "gold" or "silver"' });
        return;
      }

      if (!amount || typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
        res.status(400).json({ error: 'Amount must be a positive integer' });
        return;
      }

      const result = await CurrencyExchangeService.sellResource(
        character._id as any,
        type,
        amount
      );

      res.json({
        success: true,
        data: {
          ...result,
          message: `Sold ${amount} ${type} for $${result.dollarsReceived.toFixed(2)} (rate: $${result.rate.toFixed(2)}, fee: $${result.fee.toFixed(2)})`,
        },
      });
    } catch (error: any) {
      logger.error('Error selling resource:', error);
      res.status(400).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/currency/exchange/buy
   * Buy resource (gold/silver) with dollars
   * Body: { type: 'gold' | 'silver', amount: number }
   */
  static async buyResource(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const { type, amount } = req.body;

      if (!type || !['gold', 'silver'].includes(type)) {
        res.status(400).json({ error: 'Type must be "gold" or "silver"' });
        return;
      }

      if (!amount || typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
        res.status(400).json({ error: 'Amount must be a positive integer' });
        return;
      }

      const result = await CurrencyExchangeService.buyResource(
        character._id as any,
        type,
        amount
      );

      res.json({
        success: true,
        data: {
          ...result,
          message: `Bought ${amount} ${type} for $${result.dollarsSpent.toFixed(2)} (rate: $${result.rate.toFixed(2)}, fee: $${result.fee.toFixed(2)})`,
        },
      });
    } catch (error: any) {
      logger.error('Error buying resource:', error);
      res.status(400).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/currency/resources/:type
   * Get specific resource balance
   */
  static async getResourceBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const resourceType = req.params['type'] as 'gold' | 'silver';

      if (!['gold', 'silver'].includes(resourceType)) {
        res.status(400).json({ error: 'Type must be "gold" or "silver"' });
        return;
      }

      const balance = await ResourceService.getBalance(character._id as any, resourceType);

      res.json({
        success: true,
        data: {
          characterId: (character._id as any).toString(),
          resourceType,
          balance,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching resource balance:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/currency/resources/:type/history
   * Get resource transaction history
   */
  static async getResourceHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const resourceType = req.params['type'] as 'gold' | 'silver';
      const limitRaw = Number(req.query['limit']);
      const offsetRaw = Number(req.query['offset']);

      if (!['gold', 'silver'].includes(resourceType)) {
        res.status(400).json({ error: 'Type must be "gold" or "silver"' });
        return;
      }

      const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 50;
      const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.floor(offsetRaw) : 0;

      if (limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Limit must be between 1 and 100' });
        return;
      }

      const history = await ResourceService.getTransactionHistory(
        character._id as any,
        resourceType,
        limit,
        offset
      );

      res.json({
        success: true,
        data: {
          resourceType,
          transactions: history,
          pagination: { limit, offset },
        },
      });
    } catch (error: any) {
      logger.error('Error fetching resource history:', error);
      res.status(500).json({ error: sanitizeErrorMessage(error) });
    }
  }
}
