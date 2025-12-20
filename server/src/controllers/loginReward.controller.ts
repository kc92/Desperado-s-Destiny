/**
 * Login Reward Controller
 * Phase B - Competitor Parity Plan
 *
 * Handles HTTP requests for login reward operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { LoginRewardService } from '../services/loginReward.service';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

export class LoginRewardController {
  /**
   * GET /api/login-rewards/status
   * Get claim status and current day information
   */
  static async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const status = await LoginRewardService.checkLoginStatus(character._id as any);

      res.json({
        success: true,
        data: {
          ...status,
          serverTime: new Date().toISOString(),
          serverTimezone: 'UTC'
        }
      });
    } catch (error: any) {
      logger.error('Error getting login reward status:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/login-rewards/calendar
   * Get full 28-day calendar with claimed status
   */
  static async getCalendar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const calendar = await LoginRewardService.getRewardCalendar(character._id as any);

      res.json({
        success: true,
        data: calendar
      });
    } catch (error: any) {
      logger.error('Error getting login reward calendar:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/login-rewards/current
   * Get current day's reward preview
   */
  static async getCurrentReward(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const current = await LoginRewardService.getCurrentReward(character._id as any);

      res.json({
        success: true,
        data: current
      });
    } catch (error: any) {
      logger.error('Error getting current login reward:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/login-rewards/claim
   * Claim today's reward
   */
  static async claimReward(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const result = await LoginRewardService.claimDailyReward(character._id as any);

      // Refresh character data for response
      const updatedCharacter = await Character.findById(character._id);

      res.json({
        success: true,
        data: {
          ...result,
          character: {
            gold: updatedCharacter?.gold,
            energy: updatedCharacter?.energy
          }
        }
      });
    } catch (error: any) {
      logger.error('Error claiming login reward:', error);

      // Check for specific error types
      if (error.message.includes('Already claimed')) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/login-rewards/monthly
   * Claim monthly bonus (requires all 28 days claimed)
   */
  static async claimMonthlyBonus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const character = await Character.findOne({
        userId: req.user!._id,
        isActive: true
      });

      if (!character) {
        res.status(404).json({ error: 'No active character found' });
        return;
      }

      const result = await LoginRewardService.claimMonthlyBonus(character._id as any);

      // Refresh character data for response
      const updatedCharacter = await Character.findById(character._id);

      res.json({
        success: true,
        data: {
          ...result,
          character: {
            gold: updatedCharacter?.gold,
            energy: updatedCharacter?.energy
          }
        }
      });
    } catch (error: any) {
      logger.error('Error claiming monthly bonus:', error);

      // Check for specific error types
      if (error.message.includes('Must claim all 28 days') ||
          error.message.includes('already claimed')) {
        res.status(400).json({ error: error.message });
        return;
      }

      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/login-rewards/statistics
   * Get login reward statistics
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

      const stats = await LoginRewardService.getStatistics(character._id as any);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      logger.error('Error getting login reward statistics:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * POST /api/login-rewards/reset (Admin only)
   * Reset a character's login reward progress
   */
  static async resetProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({ error: 'characterId is required' });
        return;
      }

      await LoginRewardService.resetProgress(characterId);

      res.json({
        success: true,
        message: `Login reward progress reset for character ${characterId}`
      });
    } catch (error: any) {
      logger.error('Error resetting login reward progress:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
