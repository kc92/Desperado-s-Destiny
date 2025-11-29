/**
 * Disguise Controller
 *
 * Handles HTTP requests for disguise system endpoints
 */

import { Request, Response } from 'express';
import { DisguiseService, DISGUISE_TYPES } from '../services/disguise.service';
import logger from '../utils/logger';

export class DisguiseController {
  /**
   * GET /api/disguise/status
   * Get current disguise status for authenticated character
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      const status = DisguiseService.getDisguiseStatus(character);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error getting disguise status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get disguise status'
      });
    }
  }

  /**
   * GET /api/disguise/available
   * Get all available disguises with affordability info
   */
  static async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      const disguises = DisguiseService.getAvailableDisguises(character.gold);

      res.json({
        success: true,
        data: {
          disguises,
          characterGold: character.gold
        }
      });
    } catch (error) {
      logger.error('Error getting available disguises:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available disguises'
      });
    }
  }

  /**
   * GET /api/disguise/types
   * Get all disguise types (no character required)
   */
  static async getTypes(_req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          types: DISGUISE_TYPES
        }
      });
    } catch (error) {
      logger.error('Error getting disguise types:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get disguise types'
      });
    }
  }

  /**
   * POST /api/disguise/apply
   * Apply a disguise to the character
   * Body: { disguiseId: string }
   */
  static async apply(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { disguiseId } = req.body;

      if (!disguiseId || typeof disguiseId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Valid disguise ID is required'
        });
        return;
      }

      const result = await DisguiseService.applyDisguise(characterId, disguiseId);

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
      logger.error('Error applying disguise:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply disguise'
      });
    }
  }

  /**
   * POST /api/disguise/remove
   * Remove current disguise
   */
  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      const result = await DisguiseService.removeDisguise(characterId);

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
      logger.error('Error removing disguise:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove disguise'
      });
    }
  }

  /**
   * POST /api/disguise/check-detection
   * Check if disguise is detected (used during actions)
   * Body: { dangerLevel: number }
   */
  static async checkDetection(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const { dangerLevel = 0 } = req.body;

      if (typeof dangerLevel !== 'number' || dangerLevel < 0) {
        res.status(400).json({
          success: false,
          error: 'Valid danger level (0+) is required'
        });
        return;
      }

      const result = await DisguiseService.checkDetection(character, dangerLevel);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error checking disguise detection:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check detection'
      });
    }
  }
}
