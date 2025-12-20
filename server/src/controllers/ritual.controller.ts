/**
 * Ritual Controller
 * Handles Dark Ritual API endpoints
 */

import { Request, Response } from 'express';
import { RitualService } from '../services/ritual.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class RitualController {
  /**
   * GET /api/rituals
   * Get all available rituals for the character
   */
  static async getAvailableRituals(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const rituals = await RitualService.getAvailableRituals(characterId);

      res.json({
        success: true,
        data: {
          rituals,
          count: rituals.length
        }
      });
    } catch (error) {
      logger.error('Error getting available rituals:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get available rituals'
        });
      }
    }
  }

  /**
   * GET /api/rituals/all
   * Get all rituals (for discovery purposes)
   */
  static async getAllRituals(req: Request, res: Response): Promise<void> {
    try {
      const rituals = RitualService.getAllRituals();

      res.json({
        success: true,
        data: {
          rituals,
          count: rituals.length
        }
      });
    } catch (error) {
      logger.error('Error getting all rituals:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get rituals'
      });
    }
  }

  /**
   * GET /api/rituals/active
   * Get currently active ritual
   */
  static async getActiveRitual(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const activeRitual = await RitualService.getActiveRitual(characterId);

      res.json({
        success: true,
        data: activeRitual
      });
    } catch (error) {
      logger.error('Error getting active ritual:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get active ritual'
        });
      }
    }
  }

  /**
   * GET /api/rituals/:ritualId/check
   * Check if character can perform a specific ritual
   */
  static async canPerformRitual(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { ritualId } = req.params;

      const result = await RitualService.canPerformRitual(characterId, ritualId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error checking ritual eligibility:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to check ritual eligibility'
        });
      }
    }
  }

  /**
   * POST /api/rituals/:ritualId/start
   * Start performing a ritual
   */
  static async startRitual(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { ritualId } = req.params;
      const { participants } = req.body;

      const result = await RitualService.startRitual(
        characterId,
        ritualId,
        participants || []
      );

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: result.message,
            completesAt: result.completesAt
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      logger.error('Error starting ritual:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to start ritual'
        });
      }
    }
  }

  /**
   * POST /api/rituals/complete
   * Complete the active ritual
   */
  static async completeRitual(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const result = await RitualService.completeRitual(characterId);

      res.json({
        success: result.success,
        data: {
          success: result.success,
          failed: result.failed,
          results: result.results,
          failure: result.failure,
          message: result.message
        }
      });
    } catch (error) {
      logger.error('Error completing ritual:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to complete ritual'
        });
      }
    }
  }

  /**
   * POST /api/rituals/cancel
   * Cancel the active ritual
   */
  static async cancelRitual(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const result = await RitualService.cancelRitual(characterId);

      res.json({
        success: result.success,
        data: {
          message: result.message,
          backlash: result.backlash
        }
      });
    } catch (error) {
      logger.error('Error cancelling ritual:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to cancel ritual'
        });
      }
    }
  }

  /**
   * POST /api/rituals/:ritualId/discover
   * Discover/learn a ritual
   */
  static async discoverRitual(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { ritualId } = req.params;

      const result = await RitualService.discoverRitual(characterId, ritualId);

      if (result.success) {
        res.json({
          success: true,
          data: {
            message: result.message
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      logger.error('Error discovering ritual:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to discover ritual'
        });
      }
    }
  }
}
