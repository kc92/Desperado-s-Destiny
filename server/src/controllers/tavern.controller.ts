/**
 * Tavern Controller
 *
 * Handles HTTP requests for tavern social activities and buffs.
 * Part of the Tavern Rest & Social System.
 */

import { Request, Response } from 'express';
import { TavernService } from '../services/tavern.service';
import { TAVERN_ACTIVITIES, TAVERN_CONFIG } from '@desperados/shared';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

export class TavernController {
  /**
   * GET /api/tavern/activities
   * Get available tavern activities at current location
   */
  static async getActivities(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      const activities = await TavernService.getAvailableActivities(character);

      if (activities.length === 0) {
        res.json({
          success: true,
          data: {
            isInTavern: false,
            activities: [],
            message: 'You must be in a saloon or tavern to access these activities.'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          isInTavern: true,
          activities: activities.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            cost: a.baseCost,
            energyCost: a.energyCost,
            regenBonus: Math.round((a.regenBonus + a.locationBonus) * 100),
            locationBonus: Math.round(a.locationBonus * 100),
            durationMinutes: a.durationMinutes,
            cooldownMinutes: a.cooldownMinutes,
            xpReward: a.xpReward,
            canAfford: a.canAfford,
            hasEnergy: a.hasEnergy,
            onCooldown: a.cooldownStatus.onCooldown,
            cooldownRemainingMs: a.cooldownStatus.remainingMs,
            cooldownEndsAt: a.cooldownStatus.cooldownEndsAt
          })),
          config: {
            maxRegenBuff: Math.round(TAVERN_CONFIG.MAX_REGEN_BUFF * 100),
            inTavernBonus: Math.round((TAVERN_CONFIG.IN_TAVERN_MULTIPLIER - 1) * 100)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting tavern activities:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * POST /api/tavern/activities/:activityId
   * Perform a tavern activity
   */
  static async performActivity(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const { activityId } = req.params;

      const result = await TavernService.performActivity(character, activityId);

      // Save character after activity
      await character.save();

      res.json({
        success: true,
        data: {
          activity: {
            id: result.activity.id,
            name: result.activity.name
          },
          buff: {
            effectId: result.buffApplied.effectId,
            magnitude: Math.round(result.buffApplied.magnitude * 100),
            durationMinutes: result.buffApplied.durationMinutes,
            expiresAt: result.buffApplied.expiresAt.toISOString()
          },
          xpAwarded: result.xpAwarded,
          locationBonus: Math.round(result.locationBonus * 100),
          cooldownEndsAt: result.cooldownEndsAt.toISOString(),
          message: result.message,
          character: {
            dollars: character.dollars,
            energy: Math.floor(character.energy)
          }
        }
      });
    } catch (error: any) {
      logger.error('Error performing tavern activity:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * GET /api/tavern/buffs
   * Get active buffs for character
   */
  static async getBuffs(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      const buffs = TavernService.getActiveBuffs(character);
      const isInTavern = await TavernService.isCharacterInTavern(character);
      const totalMultiplier = TavernService.getRegenBuffMultiplier(character, isInTavern);

      res.json({
        success: true,
        data: {
          buffs: buffs.map(b => ({
            effectId: b.effectId,
            name: b.name,
            magnitude: Math.round(b.magnitude * 100),
            remainingMs: b.remainingMs,
            expiresAt: b.expiresAt.toISOString(),
            sourceName: b.sourceName
          })),
          isInTavern,
          totalRegenBonus: Math.round((totalMultiplier - 1) * 100),
          inTavernBonusActive: isInTavern && buffs.length > 0
        }
      });
    } catch (error) {
      logger.error('Error getting tavern buffs:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }
}
