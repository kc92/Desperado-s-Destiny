/**
 * Divine Path Controller - Divine Struggle System
 * Handles Divine Path (quest) and Divine Ending API endpoints
 * Rebranded from Cosmic Controller (cosmic horror → angels & demons)
 */

import { Request, Response } from 'express';
import { DivinePathService } from '../services/divinePath.service';
import { DivineEndingService } from '../services/divineEnding.service';
import { CosmicEnding as DivineEnding } from '@desperados/shared';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

// Import original controller for reference (use CosmicController directly if you need the original)
import { CosmicController as OriginalCosmicController } from './cosmic.controller';
export const CosmicControllerRef = OriginalCosmicController;

export class DivinePathController {
  // ============================================
  // DIVINE PATH ENDPOINTS
  // ============================================

  /**
   * POST /api/divine/start
   * Start the divine path questline
   */
  static async startStoryline(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const result = await DivinePathService.startDivineStoryline(characterId);

      res.status(201).json({
        success: true,
        data: result,
        message: 'The divine path has begun. The Eternal Struggle awaits...'
      });
    } catch (error) {
      logger.error('Error starting divine path:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to start divine path'
        });
      }
    }
  }

  /**
   * GET /api/divine/progress
   * Get divine path progress
   */
  static async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const progress = await DivinePathService.getDivineProgress(characterId);

      if (!progress) {
        res.json({
          success: true,
          data: null,
          message: 'Divine path not started'
        });
        return;
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      logger.error('Error getting divine progress:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get divine progress'
        });
      }
    }
  }

  /**
   * GET /api/divine/quests
   * Get available divine quests
   */
  static async getAvailableQuests(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const quests = await DivinePathService.getAvailableQuests(characterId);

      res.json({
        success: true,
        data: {
          quests,
          count: quests.length
        }
      });
    } catch (error) {
      logger.error('Error getting available divine quests:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get available quests'
        });
      }
    }
  }

  /**
   * POST /api/divine/quests/:questId/objectives/:objectiveId/complete
   * Complete a divine quest objective
   */
  static async completeObjective(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { questId, objectiveId } = req.params;

      const result = await DivinePathService.completeObjective(
        characterId,
        questId,
        objectiveId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error completing divine objective:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to complete objective'
        });
      }
    }
  }

  /**
   * POST /api/divine/quests/:questId/complete
   * Complete a divine quest
   */
  static async completeQuest(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { questId } = req.params;

      const result = await DivinePathService.completeQuest(characterId, questId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error completing divine quest:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to complete quest'
        });
      }
    }
  }

  /**
   * POST /api/divine/quests/:questId/choices/:choiceId
   * Make a major choice in the divine path
   */
  static async makeChoice(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { questId, choiceId } = req.params;

      const result = await DivinePathService.makeChoice(characterId, questId, choiceId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error making divine choice:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to make choice'
        });
      }
    }
  }

  /**
   * GET /api/divine/sin
   * Get sin state
   */
  static async getSinState(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const state = await DivinePathService.getSinState(characterId);

      res.json({
        success: true,
        data: state
      });
    } catch (error) {
      logger.error('Error getting sin state:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get sin state'
        });
      }
    }
  }

  /**
   * GET /api/divine/lore
   * Get discovered sacred lore
   */
  static async getDiscoveredLore(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const category = req.query.category as string | undefined;
      const lore = await DivinePathService.getDiscoveredLore(characterId, category);

      res.json({
        success: true,
        data: {
          lore,
          count: lore.length
        }
      });
    } catch (error) {
      logger.error('Error getting discovered lore:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get discovered lore'
        });
      }
    }
  }

  /**
   * GET /api/divine/visions
   * Get experienced divine visions
   */
  static async getVisions(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const visions = await DivinePathService.getExperiencedVisions(characterId);

      res.json({
        success: true,
        data: {
          visions,
          count: visions.length
        }
      });
    } catch (error) {
      logger.error('Error getting visions:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get visions'
        });
      }
    }
  }

  // ============================================
  // DIVINE ENDING ENDPOINTS
  // ============================================

  /**
   * GET /api/divine/ending/predict
   * Predict likely ending based on current choices
   */
  static async predictEnding(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const prediction = await DivineEndingService.predictEnding(characterId);

      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      logger.error('Error predicting ending:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to predict ending'
        });
      }
    }
  }

  /**
   * POST /api/divine/ending/trigger/:endingType
   * Trigger a specific divine ending
   */
  static async triggerEnding(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const endingType = req.params.endingType as DivineEnding;
      const validEndings = [
        DivineEnding.BANISHMENT, // Salvation
        DivineEnding.DESTRUCTION, // Purification
        DivineEnding.BARGAIN, // Covenant
        DivineEnding.AWAKENING // Ascension
      ];

      if (!validEndings.includes(endingType)) {
        throw new AppError('Invalid ending type', 400);
      }

      let outcome;
      switch (endingType) {
        case DivineEnding.BANISHMENT:
          outcome = await DivineEndingService.triggerSalvation(characterId);
          break;
        case DivineEnding.DESTRUCTION:
          outcome = await DivineEndingService.triggerPurification(characterId);
          break;
        case DivineEnding.BARGAIN:
          outcome = await DivineEndingService.triggerCovenant(characterId);
          break;
        case DivineEnding.AWAKENING:
          outcome = await DivineEndingService.triggerAscension(characterId);
          break;
      }

      res.json({
        success: true,
        data: outcome
      });
    } catch (error) {
      logger.error('Error triggering ending:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to trigger ending'
        });
      }
    }
  }

  /**
   * GET /api/divine/ending/rewards/:endingType
   * Get rewards for a specific divine ending
   */
  static async getEndingRewards(req: Request, res: Response): Promise<void> {
    try {
      const endingType = req.params.endingType as DivineEnding;
      const validEndings = [
        DivineEnding.BANISHMENT,
        DivineEnding.DESTRUCTION,
        DivineEnding.BARGAIN,
        DivineEnding.AWAKENING
      ];

      if (!validEndings.includes(endingType)) {
        throw new AppError('Invalid ending type', 400);
      }

      const rewards = DivineEndingService.getEndingRewards(endingType);

      res.json({
        success: true,
        data: {
          ending: endingType,
          rewards
        }
      });
    } catch (error) {
      logger.error('Error getting ending rewards:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get ending rewards'
        });
      }
    }
  }
}

// Backwards compatibility alias
export const CosmicController = DivinePathController;
