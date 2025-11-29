/**
 * Jail Controller
 *
 * Handles HTTP requests for jail system endpoints
 */

import { Request, Response } from 'express';
import { JailService } from '../services/jail.service';
import { JailActivity } from '@desperados/shared';
import logger from '../utils/logger';

export class JailController {
  /**
   * GET /api/jail/status
   * Get current jail status for authenticated character
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;

      const status = await JailService.checkJailStatus(characterId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error getting jail status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get jail status'
      });
    }
  }

  /**
   * POST /api/jail/escape
   * Attempt to escape from jail
   */
  static async attemptEscape(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;

      const result = await JailService.attemptEscape(characterId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error attempting escape:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to attempt escape'
      });
    }
  }

  /**
   * POST /api/jail/bribe
   * Attempt to bribe a guard
   * Body: { amount: number }
   */
  static async attemptBribe(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;
      const { amount } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid bribe amount is required'
        });
        return;
      }

      const result = await JailService.attemptBribe(characterId, amount);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error attempting bribe:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to attempt bribe'
      });
    }
  }

  /**
   * POST /api/jail/bail
   * Pay bail for self or another character
   * Body: { characterId?: string } (optional, defaults to self)
   */
  static async payBail(req: Request, res: Response): Promise<void> {
    try {
      const payerId = req.character!._id;
      const targetId = req.body.characterId || payerId;

      const result = await JailService.payBail(targetId, payerId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error paying bail:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pay bail'
      });
    }
  }

  /**
   * POST /api/jail/activity
   * Perform a jail activity
   * Body: { activity: JailActivity }
   */
  static async doActivity(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;
      const { activity } = req.body;

      if (!activity || !Object.values(JailActivity).includes(activity)) {
        res.status(400).json({
          success: false,
          error: 'Valid activity is required'
        });
        return;
      }

      const result = await JailService.doJailActivity(characterId, activity);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error performing jail activity:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform activity'
      });
    }
  }

  /**
   * POST /api/jail/turn-in/:characterId
   * Turn in a wanted player for bounty
   */
  static async turnInPlayer(req: Request, res: Response): Promise<void> {
    try {
      const hunterId = req.character!._id;
      const targetId = req.params.characterId;

      if (!targetId) {
        res.status(400).json({
          success: false,
          error: 'Target character ID is required'
        });
        return;
      }

      const result = await JailService.turnInPlayer(hunterId, targetId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error turning in player:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to turn in player'
      });
    }
  }

  /**
   * GET /api/jail/stats
   * Get jail statistics for authenticated character
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;

      const stats = await JailService.getJailStats(characterId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting jail stats:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get jail stats'
      });
    }
  }

  /**
   * POST /api/jail/release/:characterId (Admin only)
   * Release a player from jail (admin/debug endpoint)
   */
  static async releasePlayer(req: Request, res: Response): Promise<void> {
    try {
      // This would need admin authentication middleware
      const targetId = req.params.characterId;
      const reason = req.body.reason || 'pardoned';

      if (!targetId) {
        res.status(400).json({
          success: false,
          error: 'Target character ID is required'
        });
        return;
      }

      const character = await JailService.releasePlayer(targetId, reason);

      res.json({
        success: true,
        data: {
          characterId: character._id,
          name: character.name,
          released: true,
          reason
        }
      });
    } catch (error) {
      logger.error('Error releasing player:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release player'
      });
    }
  }
}
