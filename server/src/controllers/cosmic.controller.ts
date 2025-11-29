/**
 * Cosmic Controller
 * Handles Cosmic Quest and Cosmic Ending API endpoints
 */

import { Request, Response } from 'express';
import { CosmicQuestService } from '../services/cosmicQuest.service';
import { CosmicEndingService } from '../services/cosmicEnding.service';
import { CosmicEnding } from '@desperados/shared';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class CosmicController {
  // ============================================
  // COSMIC QUEST ENDPOINTS
  // ============================================

  /**
   * POST /api/cosmic/start
   * Start the cosmic questline
   */
  static async startStoryline(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const result = await CosmicQuestService.startCosmicStoryline(characterId);

      res.status(201).json({
        success: true,
        data: result,
        message: 'The cosmic questline has begun. What-Waits-Below stirs...'
      });
    } catch (error) {
      logger.error('Error starting cosmic storyline:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to start cosmic storyline'
        });
      }
    }
  }

  /**
   * GET /api/cosmic/progress
   * Get cosmic quest progress
   */
  static async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const progress = await CosmicQuestService.getCosmicProgress(characterId);

      if (!progress) {
        res.json({
          success: true,
          data: null,
          message: 'Cosmic questline not started'
        });
        return;
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      logger.error('Error getting cosmic progress:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get cosmic progress'
        });
      }
    }
  }

  /**
   * GET /api/cosmic/quests
   * Get available cosmic quests
   */
  static async getAvailableQuests(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const quests = await CosmicQuestService.getAvailableQuests(characterId);

      res.json({
        success: true,
        data: {
          quests,
          count: quests.length
        }
      });
    } catch (error) {
      logger.error('Error getting available cosmic quests:', error);
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
   * POST /api/cosmic/quests/:questId/objectives/:objectiveId/complete
   * Complete a cosmic quest objective
   */
  static async completeObjective(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { questId, objectiveId } = req.params;

      const result = await CosmicQuestService.completeObjective(
        characterId,
        questId,
        objectiveId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error completing cosmic objective:', error);
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
   * POST /api/cosmic/quests/:questId/complete
   * Complete a cosmic quest
   */
  static async completeQuest(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { questId } = req.params;

      const result = await CosmicQuestService.completeQuest(characterId, questId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error completing cosmic quest:', error);
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
   * POST /api/cosmic/quests/:questId/choices/:choiceId
   * Make a major choice in the questline
   */
  static async makeChoice(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { questId, choiceId } = req.params;

      const result = await CosmicQuestService.makeChoice(characterId, questId, choiceId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error making cosmic choice:', error);
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
   * GET /api/cosmic/corruption
   * Get corruption state
   */
  static async getCorruptionState(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const state = await CosmicQuestService.getCorruptionState(characterId);

      res.json({
        success: true,
        data: state
      });
    } catch (error) {
      logger.error('Error getting corruption state:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get corruption state'
        });
      }
    }
  }

  /**
   * GET /api/cosmic/lore
   * Get discovered lore
   */
  static async getDiscoveredLore(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const category = req.query.category as string | undefined;
      const lore = await CosmicQuestService.getDiscoveredLore(characterId, category);

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
   * GET /api/cosmic/visions
   * Get experienced visions
   */
  static async getVisions(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const visions = await CosmicQuestService.getExperiencedVisions(characterId);

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
  // COSMIC ENDING ENDPOINTS
  // ============================================

  /**
   * GET /api/cosmic/ending/predict
   * Predict likely ending based on current choices
   */
  static async predictEnding(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const prediction = await CosmicEndingService.predictEnding(characterId);

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
   * POST /api/cosmic/ending/trigger/:endingType
   * Trigger a specific ending
   */
  static async triggerEnding(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const endingType = req.params.endingType as CosmicEnding;
      const validEndings = [
        CosmicEnding.BANISHMENT,
        CosmicEnding.DESTRUCTION,
        CosmicEnding.BARGAIN,
        CosmicEnding.AWAKENING
      ];

      if (!validEndings.includes(endingType)) {
        throw new AppError('Invalid ending type', 400);
      }

      let outcome;
      switch (endingType) {
        case CosmicEnding.BANISHMENT:
          outcome = await CosmicEndingService.triggerBanishment(characterId);
          break;
        case CosmicEnding.DESTRUCTION:
          outcome = await CosmicEndingService.triggerDestruction(characterId);
          break;
        case CosmicEnding.BARGAIN:
          outcome = await CosmicEndingService.triggerBargain(characterId);
          break;
        case CosmicEnding.AWAKENING:
          outcome = await CosmicEndingService.triggerAwakening(characterId);
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
   * GET /api/cosmic/ending/rewards/:endingType
   * Get rewards for a specific ending
   */
  static async getEndingRewards(req: Request, res: Response): Promise<void> {
    try {
      const endingType = req.params.endingType as CosmicEnding;
      const validEndings = [
        CosmicEnding.BANISHMENT,
        CosmicEnding.DESTRUCTION,
        CosmicEnding.BARGAIN,
        CosmicEnding.AWAKENING
      ];

      if (!validEndings.includes(endingType)) {
        throw new AppError('Invalid ending type', 400);
      }

      const rewards = CosmicEndingService.getEndingRewards(endingType);

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
