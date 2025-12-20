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

export class EnergyController {
  /**
   * GET /api/energy/status
   * Get current energy status for authenticated character
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      // Regenerate energy before returning status
      EnergyService.regenerateEnergy(character);

      const timeUntilFull = await EnergyService.getTimeUntilFullEnergy(character);

      res.json({
        success: true,
        data: {
          currentEnergy: Math.floor(character.energy),
          maxEnergy: character.maxEnergy,
          lastUpdate: character.lastEnergyUpdate,
          timeUntilFullMs: timeUntilFull,
          timeUntilFullMinutes: Math.ceil(timeUntilFull / 60000),
          isFull: character.energy >= character.maxEnergy
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
   */
  static async regenerate(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      // Calculate regeneration
      const regenAmount = await EnergyService.calculateRegenAmount(character);

      // Apply regeneration
      EnergyService.regenerateEnergy(character);

      // Save the character
      await character.save();

      res.json({
        success: true,
        data: {
          regenerated: Math.floor(regenAmount),
          currentEnergy: Math.floor(character.energy),
          maxEnergy: character.maxEnergy,
          lastUpdate: character.lastEnergyUpdate
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
