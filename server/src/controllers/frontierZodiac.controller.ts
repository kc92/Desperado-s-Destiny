/**
 * Frontier Zodiac Controller
 * Handles API endpoints for the Western-themed zodiac calendar system
 */

import { Request, Response } from 'express';
import { frontierZodiacService } from '../services/frontierZodiac.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class FrontierZodiacController {
  /**
   * GET /api/zodiac/current
   * Get the current zodiac sign based on real-world date
   */
  static async getCurrentSign(req: Request, res: Response): Promise<void> {
    try {
      const currentSign = frontierZodiacService.getCurrentSign();
      const peakDayInfo = frontierZodiacService.isPeakDay();

      if (!currentSign) {
        res.status(404).json({
          success: false,
          error: 'Could not determine current zodiac sign'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          currentSign,
          isPeakDay: peakDayInfo.isPeak,
          peakDayBonusMultiplier: peakDayInfo.bonusMultiplier,
          message: peakDayInfo.isPeak
            ? `Today is the peak day for ${currentSign.name}! All bonuses are doubled!`
            : `The ${currentSign.name} rules the sky. ${currentSign.description}`
        }
      });
    } catch (error) {
      logger.error('Error getting current zodiac sign:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get current zodiac sign'
      });
    }
  }

  /**
   * GET /api/zodiac/signs
   * Get all zodiac signs with their details
   */
  static async getAllSigns(req: Request, res: Response): Promise<void> {
    try {
      const signs = frontierZodiacService.getAllSigns();
      const currentSign = frontierZodiacService.getCurrentSign();

      res.json({
        success: true,
        data: {
          signs,
          count: signs.length,
          currentSignId: currentSign?.id || null
        }
      });
    } catch (error) {
      logger.error('Error getting all zodiac signs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get zodiac signs'
      });
    }
  }

  /**
   * GET /api/zodiac/signs/:signId
   * Get a specific zodiac sign by ID
   */
  static async getSignById(req: Request, res: Response): Promise<void> {
    try {
      const { signId } = req.params;
      const sign = frontierZodiacService.getSignById(signId);

      if (!sign) {
        res.status(404).json({
          success: false,
          error: 'Zodiac sign not found'
        });
        return;
      }

      const oppositeSign = frontierZodiacService.getOppositeSign(signId);
      const currentSign = frontierZodiacService.getCurrentSign();

      res.json({
        success: true,
        data: {
          sign,
          oppositeSign,
          isCurrentSign: currentSign?.id === signId
        }
      });
    } catch (error) {
      logger.error('Error getting zodiac sign:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get zodiac sign'
      });
    }
  }

  /**
   * GET /api/zodiac/progress
   * Get character's zodiac progress (requires authentication)
   */
  static async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const progress = await frontierZodiacService.getCharacterProgress(characterId);

      // Convert Map to object for JSON serialization
      const constellationsObject: Record<string, any> = {};
      progress.constellations.forEach((value, key) => {
        constellationsObject[key] = value;
      });

      res.json({
        success: true,
        data: {
          ...progress,
          constellations: constellationsObject
        }
      });
    } catch (error) {
      logger.error('Error getting zodiac progress:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get zodiac progress'
        });
      }
    }
  }

  /**
   * POST /api/zodiac/birth-sign
   * Set character's birth sign (one-time selection)
   */
  static async setBirthSign(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { signId } = req.body;
      if (!signId) {
        throw new AppError('Sign ID is required', 400);
      }

      const result = await frontierZodiacService.setBirthSign(characterId, signId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error setting birth sign:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to set birth sign'
        });
      }
    }
  }

  /**
   * POST /api/zodiac/constellation/:signId/claim
   * Claim reward for completing a constellation
   */
  static async claimConstellationReward(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { signId } = req.params;
      if (!signId) {
        throw new AppError('Sign ID is required', 400);
      }

      const reward = await frontierZodiacService.claimConstellationReward(characterId, signId);

      res.json({
        success: true,
        data: {
          reward,
          message: `Congratulations! You have completed the ${reward.constellationName} constellation!`
        }
      });
    } catch (error) {
      logger.error('Error claiming constellation reward:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to claim constellation reward'
        });
      }
    }
  }

  /**
   * GET /api/zodiac/bonuses
   * Get active bonuses for the current character
   */
  static async getActiveBonuses(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const bonuses = await frontierZodiacService.getActiveBonuses(characterId);

      // Convert Maps to objects for JSON serialization
      const activityBonuses: Record<string, number> = {};
      bonuses.totalActivityBonuses.forEach((value, key) => {
        activityBonuses[key] = value;
      });

      const skillBonuses: Record<string, number> = {};
      bonuses.totalSkillBonuses.forEach((value, key) => {
        skillBonuses[key] = value;
      });

      const specialBonuses: Record<string, number> = {};
      bonuses.totalSpecialBonuses.forEach((value, key) => {
        specialBonuses[key] = value;
      });

      res.json({
        success: true,
        data: {
          currentSign: bonuses.currentSign,
          birthSign: bonuses.birthSign,
          isPeakDay: bonuses.isPeakDay,
          activeBonuses: bonuses.activeBonuses,
          summary: {
            activityBonuses,
            skillBonuses,
            specialBonuses
          },
          isBirthSignActive: bonuses.birthSign?.id === bonuses.currentSign?.id,
          bonusMultiplier: bonuses.isPeakDay ? 2.0 : (bonuses.birthSign?.id === bonuses.currentSign?.id ? 2.0 : 1.0)
        }
      });
    } catch (error) {
      logger.error('Error getting active bonuses:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get active bonuses'
        });
      }
    }
  }

  /**
   * GET /api/zodiac/peak-day
   * Check if today is a peak day and get details
   */
  static async getPeakDay(req: Request, res: Response): Promise<void> {
    try {
      const peakDayInfo = frontierZodiacService.isPeakDay();

      res.json({
        success: true,
        data: {
          isPeakDay: peakDayInfo.isPeak,
          sign: peakDayInfo.sign,
          bonusMultiplier: peakDayInfo.bonusMultiplier,
          message: peakDayInfo.isPeak && peakDayInfo.sign
            ? `Today is the peak day for ${peakDayInfo.sign.name}! The ${peakDayInfo.sign.constellation.name} shines brightest tonight.`
            : 'Today is not a peak day. Check back soon!'
        }
      });
    } catch (error) {
      logger.error('Error getting peak day info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get peak day info'
      });
    }
  }

  /**
   * POST /api/zodiac/peak-day/attend
   * Record attendance for a peak day (requires authentication)
   */
  static async attendPeakDay(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const result = await frontierZodiacService.recordPeakDayAttendance(characterId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error attending peak day:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to record peak day attendance'
        });
      }
    }
  }

  /**
   * GET /api/zodiac/compatibility/:signId1/:signId2
   * Check compatibility between two signs
   */
  static async getCompatibility(req: Request, res: Response): Promise<void> {
    try {
      const { signId1, signId2 } = req.params;

      if (!signId1 || !signId2) {
        throw new AppError('Both sign IDs are required', 400);
      }

      const sign1 = frontierZodiacService.getSignById(signId1);
      const sign2 = frontierZodiacService.getSignById(signId2);

      if (!sign1 || !sign2) {
        throw new AppError('One or both zodiac signs not found', 404);
      }

      const compatibility = frontierZodiacService.getCompatibility(signId1, signId2);

      res.json({
        success: true,
        data: {
          sign1,
          sign2,
          compatibility
        }
      });
    } catch (error) {
      logger.error('Error getting sign compatibility:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get compatibility'
        });
      }
    }
  }

  /**
   * GET /api/zodiac/leaderboard
   * Get zodiac leaderboard
   */
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const metric = (req.query.metric as 'totalFragments' | 'constellationsCompleted') || 'totalFragments';
      const limit = parseInt(req.query.limit as string) || 100;

      if (!['totalFragments', 'constellationsCompleted'].includes(metric)) {
        throw new AppError('Invalid metric. Must be totalFragments or constellationsCompleted', 400);
      }

      const result = await frontierZodiacService.getLeaderboard(metric, Math.min(limit, 500));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error getting zodiac leaderboard:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get leaderboard'
        });
      }
    }
  }

  /**
   * GET /api/zodiac/star-walkers
   * Get all Star Walkers (players who completed all 12 constellations)
   */
  static async getStarWalkers(req: Request, res: Response): Promise<void> {
    try {
      const starWalkers = await frontierZodiacService.getStarWalkers();
      const rewards = frontierZodiacService.getStarWalkerRewards();

      res.json({
        success: true,
        data: {
          starWalkers,
          count: starWalkers.length,
          rewards
        }
      });
    } catch (error) {
      logger.error('Error getting star walkers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get star walkers'
      });
    }
  }

  /**
   * POST /api/zodiac/fragments/award (Internal/Admin use)
   * Award star fragments to a character
   */
  static async awardFragments(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character?._id?.toString();
      if (!characterId) {
        throw new AppError('Character not found', 404);
      }

      const { signId, amount } = req.body;

      if (!signId) {
        throw new AppError('Sign ID is required', 400);
      }

      if (!amount || amount <= 0) {
        throw new AppError('Amount must be a positive number', 400);
      }

      const result = await frontierZodiacService.addStarFragments(characterId, signId, amount);

      res.json({
        success: true,
        data: {
          ...result,
          message: result.constellationProgress.justCompleted
            ? `Congratulations! You have completed the constellation!`
            : `${result.fragmentsAdded} star fragments added to ${signId}`
        }
      });
    } catch (error) {
      logger.error('Error awarding fragments:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to award fragments'
        });
      }
    }
  }

  /**
   * GET /api/zodiac/date/:month/:day
   * Get the zodiac sign for a specific date
   */
  static async getSignForDate(req: Request, res: Response): Promise<void> {
    try {
      const month = parseInt(req.params.month);
      const day = parseInt(req.params.day);

      if (isNaN(month) || month < 1 || month > 12) {
        throw new AppError('Invalid month. Must be 1-12', 400);
      }

      if (isNaN(day) || day < 1 || day > 31) {
        throw new AppError('Invalid day. Must be 1-31', 400);
      }

      const sign = frontierZodiacService.getSignForDate(month, day);

      if (!sign) {
        res.status(404).json({
          success: false,
          error: 'No zodiac sign found for this date'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          month,
          day,
          sign
        }
      });
    } catch (error) {
      logger.error('Error getting sign for date:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get sign for date'
        });
      }
    }
  }
}

export default FrontierZodiacController;
