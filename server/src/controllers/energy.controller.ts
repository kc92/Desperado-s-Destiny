/**
 * Energy Controller
 *
 * Handles HTTP requests for energy management endpoints
 */

import { Request, Response } from 'express';
import { EnergyService } from '../services/energy.service';
import logger from '../utils/logger';

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

      const timeUntilFull = EnergyService.getTimeUntilFullEnergy(character);

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
        error: error instanceof Error ? error.message : 'Failed to get energy status'
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
        error: error instanceof Error ? error.message : 'Failed to spend energy'
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
        error: error instanceof Error ? error.message : 'Failed to grant energy'
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
        error: error instanceof Error ? error.message : 'Failed to check energy'
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
      const regenAmount = EnergyService.calculateRegenAmount(character);

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
        error: error instanceof Error ? error.message : 'Failed to regenerate energy'
      });
    }
  }
}
