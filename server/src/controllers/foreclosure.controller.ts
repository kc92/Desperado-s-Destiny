/**
 * Foreclosure Controller
 *
 * Handles HTTP requests for foreclosure and auction operations
 */

import { Response } from 'express';
import { ForeclosureService } from '../services/foreclosure.service';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

export class ForeclosureController {
  /**
   * GET /api/foreclosure/auctions
   * Get all active property auctions
   */
  static async getActiveAuctions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const auctions = await ForeclosureService.getActiveAuctions();

      res.status(200).json({
        success: true,
        data: {
          auctions,
          total: auctions.length,
        },
      });
    } catch (error) {
      logger.error('Error getting active auctions:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get auctions',
      });
    }
  }

  /**
   * GET /api/foreclosure/auctions/:auctionId
   * Get specific auction details
   */
  static async getAuction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { auctionId } = req.params;

      const auction = await ForeclosureService.getAuction(auctionId);

      if (!auction) {
        res.status(404).json({
          success: false,
          error: 'Auction not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: auction,
      });
    } catch (error) {
      logger.error('Error getting auction:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get auction',
      });
    }
  }

  /**
   * POST /api/foreclosure/auctions/:auctionId/bid
   * Place a bid on an auction
   */
  static async placeBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { auctionId } = req.params;
      const { bidderId, amount } = req.body;

      if (!bidderId || !amount) {
        res.status(400).json({
          success: false,
          error: 'bidderId and amount are required',
        });
        return;
      }

      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be a positive number',
        });
        return;
      }

      const auction = await ForeclosureService.placeBid(auctionId, bidderId, amount);

      res.status(200).json({
        success: true,
        data: auction,
        message: `Bid of ${amount} gold placed successfully`,
      });
    } catch (error) {
      logger.error('Error placing bid:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to place bid',
      });
    }
  }

  /**
   * POST /api/foreclosure/delinquency/:delinquencyId/auction
   * Create an auction for a delinquent property
   */
  static async createAuction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { delinquencyId } = req.params;

      const auction = await ForeclosureService.createAuction(delinquencyId);

      res.status(201).json({
        success: true,
        data: auction,
        message: 'Auction created successfully',
      });
    } catch (error) {
      logger.error('Error creating auction:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create auction',
      });
    }
  }

  /**
   * POST /api/foreclosure/delinquency/:delinquencyId/bankruptcy
   * Declare bankruptcy for a delinquent property
   */
  static async declareBankruptcy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { delinquencyId } = req.params;
      const { declarerId } = req.body;

      if (!declarerId) {
        res.status(400).json({
          success: false,
          error: 'declarerId is required',
        });
        return;
      }

      const delinquency = await ForeclosureService.declareBankruptcy(delinquencyId, declarerId);

      res.status(200).json({
        success: true,
        data: delinquency,
        message: 'Bankruptcy declared successfully',
      });
    } catch (error) {
      logger.error('Error declaring bankruptcy:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to declare bankruptcy',
      });
    }
  }

  /**
   * POST /api/foreclosure/delinquency/:delinquencyId/resolve-bankruptcy
   * Resolve bankruptcy (success or failure)
   */
  static async resolveBankruptcy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { delinquencyId } = req.params;
      const { success, paidAmount } = req.body;

      if (typeof success !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'success (boolean) is required',
        });
        return;
      }

      const delinquency = await ForeclosureService.resolveBankruptcy(
        delinquencyId,
        success,
        paidAmount
      );

      res.status(200).json({
        success: true,
        data: delinquency,
        message: success ? 'Bankruptcy resolved successfully' : 'Bankruptcy failed - forced sale initiated',
      });
    } catch (error) {
      logger.error('Error resolving bankruptcy:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve bankruptcy',
      });
    }
  }

  /**
   * POST /api/foreclosure/auctions/:auctionId/cancel
   * Cancel an auction
   */
  static async cancelAuction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { auctionId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          error: 'reason is required',
        });
        return;
      }

      const auction = await ForeclosureService.cancelAuction(auctionId, reason);

      res.status(200).json({
        success: true,
        data: auction,
        message: 'Auction cancelled',
      });
    } catch (error) {
      logger.error('Error cancelling auction:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel auction',
      });
    }
  }

  /**
   * POST /api/foreclosure/process-ended-auctions (Admin)
   * Complete all ended auctions
   */
  static async processEndedAuctions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await ForeclosureService.completeEndedAuctions();

      res.status(200).json({
        success: true,
        data: result,
        message: `Processed auctions: ${result.completed} completed, ${result.transferred} transferred, ${result.failed} failed`,
      });
    } catch (error) {
      logger.error('Error processing ended auctions:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process auctions',
      });
    }
  }

  /**
   * POST /api/foreclosure/process-bankruptcies (Admin)
   * Process expired bankruptcies
   */
  static async processBankruptcyExpirations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const processed = await ForeclosureService.processBankruptcyExpirations();

      res.status(200).json({
        success: true,
        data: { processed },
        message: `Processed ${processed} expired bankruptcies`,
      });
    } catch (error) {
      logger.error('Error processing bankruptcies:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process bankruptcies',
      });
    }
  }
}

export default ForeclosureController;
