/**
 * Energy Controller
 *
 * Handles HTTP requests for energy management endpoints
 */

import { Request, Response } from 'express';
import { EnergyService } from '../services/energy.service';
import deityDreamService from '../services/deityDream.service';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';
import { ENERGY } from '@desperados/shared';

export class EnergyController {
  /**
   * GET /api/energy/status
   * Get current energy status for authenticated character
   *
   * FIX: Now uses non-mutating EnergyService.getStatus() and returns
   * response format that matches client's expected EnergyStatus interface
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const isPremium = (req.character as any)?.isPremium || false;

      // Use the proper non-mutating getStatus method
      const status = await EnergyService.getStatus(characterId);

      // Calculate regen rate per minute (FREE_REGEN_PER_HOUR / 60)
      const baseRegenPerMinute = ENERGY.FREE_REGEN_PER_HOUR / 60;
      const regenRate = isPremium ? baseRegenPerMinute * 1.5 : baseRegenPerMinute;

      // Calculate next regen timestamp (1 minute from now if not full)
      const nextRegenAt = status.currentEnergy >= status.maxEnergy
        ? new Date().toISOString()
        : new Date(Date.now() + 60000).toISOString();

      // Return response in format expected by client's useEnergy hook
      res.json({
        success: true,
        data: {
          energy: {
            current: Math.floor(status.currentEnergy),
            max: status.maxEnergy,
            regenRate: regenRate, // energy per minute
            lastUpdate: status.lastUpdate.toISOString(),
            nextRegenAt: nextRegenAt,
            bonuses: [], // TODO: Implement energy bonuses from items/buffs
            totalBonusRegen: 0,
            isExhausted: status.currentEnergy <= 0
          },
          // Also include legacy format for backwards compatibility
          currentEnergy: Math.floor(status.currentEnergy),
          maxEnergy: status.maxEnergy,
          lastUpdate: status.lastUpdate,
          timeUntilFullMs: status.timeUntilFull,
          timeUntilFullMinutes: Math.ceil(status.timeUntilFull / 60000),
          isFull: status.currentEnergy >= status.maxEnergy
        }
      });
    } catch (error) {
      logger.error('Error getting energy status:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * POST /api/energy/spend
   * Spend energy for an action
   * Body: { amount: number }
   */
  static async spend(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { amount } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid positive energy amount is required'
        });
        return;
      }

      const success = await EnergyService.spendEnergy(characterId, amount);

      if (!success) {
        res.status(400).json({
          success: false,
          error: 'Insufficient energy'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: `Spent ${amount} energy`,
          amountSpent: amount
        }
      });
    } catch (error) {
      logger.error('Error spending energy:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * POST /api/energy/grant
   * Grant energy to a character (admin or item use)
   * Body: { amount: number, allowOverMax?: boolean }
   */
  static async grant(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const { amount, allowOverMax = false } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid positive energy amount is required'
        });
        return;
      }

      await EnergyService.grantEnergy(characterId, amount, allowOverMax);

      res.json({
        success: true,
        data: {
          message: `Granted ${amount} energy`,
          amountGranted: amount,
          allowedOverMax: allowOverMax
        }
      });
    } catch (error) {
      logger.error('Error granting energy:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * GET /api/energy/can-afford/:cost
   * Check if character can afford an action with given energy cost
   */
  static async canAfford(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const cost = parseInt(req.params.cost, 10);

      if (isNaN(cost) || cost < 0) {
        res.status(400).json({
          success: false,
          error: 'Valid energy cost is required'
        });
        return;
      }

      const canAfford = EnergyService.canAffordAction(character, cost);

      res.json({
        success: true,
        data: {
          canAfford,
          currentEnergy: Math.floor(character.energy),
          requiredEnergy: cost,
          deficit: canAfford ? 0 : cost - Math.floor(character.energy)
        }
      });
    } catch (error) {
      logger.error('Error checking energy affordability:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * POST /api/energy/regenerate
   * Force regeneration calculation and return updated energy
   *
   * FIX: Now uses atomic EnergyService.getStatus() and returns response format
   * that matches client's expected RegenResult interface
   */
  static async regenerate(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id.toString();

      // Get current status (calculates regen without mutating)
      const beforeStatus = await EnergyService.getStatus(characterId);

      // If there's regen to apply, do it atomically
      if (beforeStatus.regeneratedEnergy > 0) {
        // Grant the regenerated energy to persist it
        await EnergyService.grant(characterId, beforeStatus.regeneratedEnergy, false);
      }

      // Get updated status
      const afterStatus = await EnergyService.getStatus(characterId);

      // Calculate next regen timestamp
      const nextRegenAt = afterStatus.currentEnergy >= afterStatus.maxEnergy
        ? new Date().toISOString()
        : new Date(Date.now() + 60000).toISOString();

      res.json({
        success: true,
        data: {
          regen: {
            energyGained: Math.floor(beforeStatus.regeneratedEnergy),
            currentEnergy: Math.floor(afterStatus.currentEnergy),
            maxEnergy: afterStatus.maxEnergy,
            nextRegenAt: nextRegenAt
          },
          // Legacy format for backwards compatibility
          regenerated: Math.floor(beforeStatus.regeneratedEnergy),
          currentEnergy: Math.floor(afterStatus.currentEnergy),
          maxEnergy: afterStatus.maxEnergy,
          lastUpdate: afterStatus.lastUpdate
        }
      });
    } catch (error) {
      logger.error('Error regenerating energy:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }

  /**
   * POST /api/energy/rest
   * Rest to restore energy and potentially receive divine dreams
   *
   * The character enters a resting state which:
   * 1. Instantly restores a portion of max energy
   * 2. May trigger divine dreams from The Gambler or Outlaw King
   * 3. Dreams provide visions, warnings, or omens
   *
   * Body: { restType?: 'short' | 'long' }
   * - short: Restore 25% energy, lower dream chance (default)
   * - long: Restore 50% energy, higher dream chance
   */
  static async rest(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const characterId = character._id.toString();
      const { restType = 'short' } = req.body;

      // Validate rest type
      if (restType !== 'short' && restType !== 'long') {
        res.status(400).json({
          success: false,
          error: 'Invalid rest type. Use "short" or "long"'
        });
        return;
      }

      // Calculate energy restoration
      const restorePercent = restType === 'long' ? 0.5 : 0.25;
      const energyToRestore = Math.floor(character.maxEnergy * restorePercent);

      // Grant energy (capped at max)
      const result = await EnergyService.grant(characterId, energyToRestore, false);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to restore energy'
        });
        return;
      }

      // Check for divine dreams during rest
      // Longer rests have higher dream chance
      const dreamResult = await deityDreamService.checkForDream(characterId, restType);

      logger.info(`Character ${character.name} rested (${restType}). Restored ${energyToRestore} energy.`);

      res.json({
        success: true,
        data: {
          restType,
          energyRestored: energyToRestore,
          currentEnergy: result.currentEnergy,
          maxEnergy: result.maxEnergy,
          dream: dreamResult ? {
            received: true,
            deity: dreamResult.deity,
            dreamType: dreamResult.dreamType,
            message: dreamResult.message
          } : {
            received: false
          }
        }
      });
    } catch (error) {
      logger.error('Error during rest:', error);
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error)
      });
    }
  }
}
