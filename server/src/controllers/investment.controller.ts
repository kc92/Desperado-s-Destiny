/**
 * Investment Controller
 * Handles investment product API endpoints for the Red Gulch Bank
 */

import { Request, Response, NextFunction } from 'express';
import { InvestmentService } from '../services/investment.service';
import { InvestmentType } from '../models/Investment.model';
import { asyncHandler } from '../middleware/asyncHandler';
import mongoose from 'mongoose';

/**
 * Get available investment products
 * GET /api/investments/products
 */
export const getProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = InvestmentService.getInvestmentProducts();

    res.status(200).json({
      success: true,
      data: { products }
    });
  }
);

/**
 * Get investment portfolio for the current character
 * GET /api/investments/portfolio
 */
export const getPortfolio = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id;

    const [summary, activeInvestments] = await Promise.all([
      InvestmentService.getPortfolioSummary(characterId),
      InvestmentService.getActiveInvestments(characterId)
    ]);

    // Add estimated current values to each investment
    const investmentsWithEstimates = activeInvestments.map(investment => {
      const estimatedValue = InvestmentService.estimateCurrentValue(investment);
      return {
        ...investment.toObject(),
        estimatedValue
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary,
        investments: investmentsWithEstimates
      }
    });
  }
);

/**
 * Make an investment
 * POST /api/investments/invest
 */
export const invest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id;
    const { type, amount, linkedEntityId } = req.body;

    // Validate type
    if (!type || !Object.values(InvestmentType).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid investment type. Must be treasury_bond, railroad_share, or mining_share.'
      });
    }

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be a positive number'
      });
    }

    if (!Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a whole number'
      });
    }

    try {
      const investment = await InvestmentService.invest(
        characterId,
        type as InvestmentType,
        amount,
        linkedEntityId
      );

      res.status(201).json({
        success: true,
        data: {
          message: `Successfully invested $${amount} in ${type}`,
          investment
        }
      });
    } catch (error) {
      if ((error as Error).message.includes('must be between')) {
        return res.status(400).json({
          success: false,
          error: (error as Error).message
        });
      }
      throw error;
    }
  }
);

/**
 * Cash out an investment
 * POST /api/investments/:investmentId/cashout
 */
export const cashOut = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id;
    const { investmentId } = req.params;

    // Validate investmentId
    if (!mongoose.Types.ObjectId.isValid(investmentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid investment ID'
      });
    }

    try {
      const result = await InvestmentService.cashOut(characterId, investmentId);

      const message = result.returnRate < 0
        ? `Investment defaulted. You lost your entire investment of $${result.penalty}.`
        : result.penalty > 0
        ? `Cashed out early. Received $${result.payout} (${(result.returnRate * 100).toFixed(2)}% return, $${result.penalty} early withdrawal penalty)`
        : `Investment matured! Received $${result.payout} (${(result.returnRate * 100).toFixed(2)}% return)`;

      res.status(200).json({
        success: true,
        data: {
          message,
          payout: result.payout,
          returnRate: result.returnRate,
          penalty: result.penalty
        }
      });
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: (error as Error).message
        });
      }
      throw error;
    }
  }
);

/**
 * Get investment history
 * GET /api/investments/history
 */
export const getHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const characterId = req.character!._id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate pagination
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        success: false,
        error: 'Offset must be non-negative'
      });
    }

    const history = await InvestmentService.getInvestmentHistory(
      characterId,
      limit,
      offset
    );

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          limit,
          offset,
          count: history.length
        }
      }
    });
  }
);

export const InvestmentController = {
  getProducts,
  getPortfolio,
  invest,
  cashOut,
  getHistory
};
