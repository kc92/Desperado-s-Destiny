/**
 * Sanity Controller
 * Handles Sanity, Corruption, and Reality Distortion API endpoints
 */

import { Request, Response } from 'express';
import { SanityService } from '../services/sanity.service';
import { CorruptionService } from '../services/corruption.service';
import { RealityDistortionService } from '../services/realityDistortion.service';
import { MadnessType, ForbiddenKnowledgeType } from '@desperados/shared';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class SanityController {
  // ============================================
  // SANITY ENDPOINTS
  // ============================================

  /**
   * GET /api/sanity
   * Get sanity status
   */
  static async getSanityStatus(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const statistics = await SanityService.getSanityStatistics(characterId);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Error getting sanity status:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get sanity status'
        });
      }
    }
  }

  /**
   * POST /api/sanity/lose
   * Lose sanity (for testing/admin or triggered by events)
   */
  static async loseSanity(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { amount, source } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      const result = await SanityService.loseSanity(
        characterId,
        amount,
        source || 'Unknown'
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error losing sanity:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process sanity loss'
        });
      }
    }
  }

  /**
   * POST /api/sanity/restore
   * Use a sanity restoration method
   */
  static async restoreSanity(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { methodId } = req.body;

      if (!methodId) {
        throw new AppError('Method ID required', 400);
      }

      const result = await SanityService.useSanityRestoration(characterId, methodId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error restoring sanity:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to restore sanity'
        });
      }
    }
  }

  /**
   * POST /api/sanity/check
   * Perform a sanity check
   */
  static async performSanityCheck(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { difficulty } = req.body;

      if (!difficulty || typeof difficulty !== 'number' || difficulty < 1 || difficulty > 10) {
        throw new AppError('Difficulty must be between 1 and 10', 400);
      }

      const result = await SanityService.performSanityCheck(characterId, difficulty);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error performing sanity check:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to perform sanity check'
        });
      }
    }
  }

  /**
   * GET /api/sanity/hallucinations
   * Get active hallucinations
   */
  static async getHallucinations(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const hallucinations = await SanityService.getActiveHallucinations(characterId);

      res.json({
        success: true,
        data: {
          hallucinations,
          count: hallucinations.length
        }
      });
    } catch (error) {
      logger.error('Error getting hallucinations:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get hallucinations'
        });
      }
    }
  }

  /**
   * GET /api/sanity/traumas
   * Get permanent traumas
   */
  static async getTraumas(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const traumas = await SanityService.getTraumas(characterId);

      res.json({
        success: true,
        data: {
          traumas,
          count: traumas.length
        }
      });
    } catch (error) {
      logger.error('Error getting traumas:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get traumas'
        });
      }
    }
  }

  /**
   * GET /api/sanity/combat-penalty
   * Get combat penalty from sanity
   */
  static async getCombatPenalty(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const penalty = await SanityService.getCombatPenalty(characterId);

      res.json({
        success: true,
        data: {
          combatPenalty: penalty
        }
      });
    } catch (error) {
      logger.error('Error getting combat penalty:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get combat penalty'
        });
      }
    }
  }

  // ============================================
  // CORRUPTION ENDPOINTS
  // ============================================

  /**
   * GET /api/sanity/corruption
   * Get corruption status
   */
  static async getCorruptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const status = await CorruptionService.getStatus(characterId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error getting corruption status:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get corruption status'
        });
      }
    }
  }

  /**
   * POST /api/sanity/corruption/gain
   * Gain corruption (for testing/admin or triggered by events)
   */
  static async gainCorruption(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { amount, source, location } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      const result = await CorruptionService.gainCorruption(
        characterId,
        amount,
        source || 'Unknown',
        location
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error gaining corruption:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process corruption gain'
        });
      }
    }
  }

  /**
   * POST /api/sanity/corruption/purge
   * Purge corruption
   */
  static async purgeCorruption(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { amount, method } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }

      const result = await CorruptionService.loseCorruption(
        characterId,
        amount,
        method || 'Purification'
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error purging corruption:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to purge corruption'
        });
      }
    }
  }

  /**
   * GET /api/sanity/madness
   * Get active madness effects
   */
  static async getMadness(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const status = await CorruptionService.getStatus(characterId);

      res.json({
        success: true,
        data: {
          activeMadness: status.activeMadness,
          permanentMadness: status.permanentMadness,
          madnessResistance: status.madnessResistance
        }
      });
    } catch (error) {
      logger.error('Error getting madness:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get madness'
        });
      }
    }
  }

  /**
   * POST /api/sanity/madness/:madnessId/cure
   * Cure a madness effect
   */
  static async cureMadness(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { madnessId } = req.params;
      const { method } = req.body;

      if (!method) {
        throw new AppError('Cure method required', 400);
      }

      const success = await CorruptionService.cureMadness(characterId, madnessId, method);

      res.json({
        success: true,
        data: {
          cured: success,
          message: success ? 'Madness cured' : 'Cure method was not effective'
        }
      });
    } catch (error) {
      logger.error('Error curing madness:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to cure madness'
        });
      }
    }
  }

  /**
   * POST /api/sanity/knowledge/learn
   * Learn forbidden knowledge
   */
  static async learnKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { knowledge, sanityCost, corruptionCost } = req.body;

      if (!knowledge) {
        throw new AppError('Knowledge type required', 400);
      }

      const result = await CorruptionService.learnKnowledge(
        characterId,
        knowledge as ForbiddenKnowledgeType,
        sanityCost || 10,
        corruptionCost || 5
      );

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      logger.error('Error learning knowledge:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to learn knowledge'
        });
      }
    }
  }

  /**
   * GET /api/sanity/transformation-risk
   * Check transformation risk
   */
  static async checkTransformationRisk(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const risk = await CorruptionService.checkTransformation(characterId);

      res.json({
        success: true,
        data: risk
      });
    } catch (error) {
      logger.error('Error checking transformation risk:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to check transformation risk'
        });
      }
    }
  }

  /**
   * GET /api/sanity/npc-reaction
   * Calculate NPC reaction modifiers
   */
  static async getNPCReaction(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const reaction = await CorruptionService.calculateNPCReaction(characterId);

      res.json({
        success: true,
        data: reaction
      });
    } catch (error) {
      logger.error('Error calculating NPC reaction:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to calculate NPC reaction'
        });
      }
    }
  }

  /**
   * GET /api/sanity/combat-modifiers
   * Get combat modifiers from corruption
   */
  static async getCombatModifiers(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const modifiers = await CorruptionService.calculateCombatModifiers(characterId);

      res.json({
        success: true,
        data: modifiers
      });
    } catch (error) {
      logger.error('Error calculating combat modifiers:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to calculate combat modifiers'
        });
      }
    }
  }

  // ============================================
  // REALITY DISTORTION ENDPOINTS
  // ============================================

  /**
   * GET /api/sanity/distortions
   * Get active reality distortions affecting character
   */
  static async getActiveDistortions(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const distortions = RealityDistortionService.getActiveDistortions(characterId);

      res.json({
        success: true,
        data: {
          distortions,
          count: distortions.length
        }
      });
    } catch (error) {
      logger.error('Error getting distortions:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get distortions'
        });
      }
    }
  }

  /**
   * POST /api/sanity/distortions/roll
   * Roll for a reality distortion at current location
   */
  static async rollForDistortion(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const location = req.body.location || req.character?.currentLocation || 'Unknown';

      const result = await RealityDistortionService.rollForDistortion(characterId, location);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error rolling for distortion:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to roll for distortion'
        });
      }
    }
  }

  /**
   * GET /api/sanity/distortions/all
   * Get all possible distortion types
   */
  static async getAllDistortions(req: Request, res: Response): Promise<void> {
    try {
      const distortions = RealityDistortionService.getAllDistortions();

      res.json({
        success: true,
        data: {
          distortions,
          count: distortions.length
        }
      });
    } catch (error) {
      logger.error('Error getting all distortions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get distortions'
      });
    }
  }

  /**
   * GET /api/sanity/location-stability
   * Get reality stability of a location
   */
  static async getLocationStability(req: Request, res: Response): Promise<void> {
    try {
      const location = req.query.location as string || req.character?.currentLocation || 'Unknown';

      const stability = RealityDistortionService.getLocationStability(location);

      res.json({
        success: true,
        data: {
          location,
          ...stability
        }
      });
    } catch (error) {
      logger.error('Error getting location stability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get location stability'
      });
    }
  }

  /**
   * POST /api/sanity/distortions/force
   * Force a specific distortion (for admin/testing)
   */
  static async forceDistortion(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { distortionId } = req.body;

      if (!distortionId) {
        throw new AppError('Distortion ID required', 400);
      }

      const result = await RealityDistortionService.forceDistortion(characterId, distortionId);

      res.json({
        success: result.success,
        data: result
      });
    } catch (error) {
      logger.error('Error forcing distortion:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to force distortion'
        });
      }
    }
  }
}
