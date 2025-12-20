/**
 * Death Controller
 *
 * Handles HTTP requests for death, respawn, and death statistics endpoints
 */

import { Request, Response } from 'express';
import { DeathService } from '../services/death.service';
import { DeathType } from '@desperados/shared';
import logger from '../utils/logger';

export class DeathController {
  /**
   * GET /api/death/status
   * Get current death/respawn status for authenticated character
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;

      // Check if character is dead (no energy and recently died)
      const isDead = character.energy <= 0;

      res.json({
        success: true,
        data: {
          isDead,
          currentLocation: character.currentLocation,
          energy: character.energy,
          maxEnergy: character.maxEnergy
        }
      });
    } catch (error) {
      logger.error('Error getting death status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get death status'
      });
    }
  }

  /**
   * GET /api/death/history
   * Get death statistics and history for authenticated character
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;

      const stats = await DeathService.getDeathHistory(characterId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting death history:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get death history'
      });
    }
  }

  /**
   * POST /api/death/trigger
   * Trigger death for a character (typically called by other systems)
   * Body: { deathType: DeathType }
   */
  static async triggerDeath(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;
      const { deathType } = req.body;

      // Validate death type
      if (!deathType || !Object.values(DeathType).includes(deathType)) {
        res.status(400).json({
          success: false,
          error: 'Valid death type is required',
          validTypes: Object.values(DeathType)
        });
        return;
      }

      const penalty = await DeathService.handleDeath(characterId, deathType);

      res.json({
        success: true,
        data: {
          message: 'You have died...',
          penalty,
          respawnLocation: penalty.respawnLocation,
          respawnDelay: penalty.respawnDelay
        }
      });
    } catch (error) {
      logger.error('Error triggering death:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process death'
      });
    }
  }

  /**
   * POST /api/death/respawn
   * Respawn character at designated location
   * Body: { locationId?: string } (optional, uses calculated respawn location if not provided)
   */
  static async respawn(req: Request, res: Response): Promise<void> {
    try {
      const characterId = req.character!._id;
      const { locationId } = req.body;

      // Use provided location or default respawn location
      const respawnLocation = locationId || 'perdition';

      const result = await DeathService.respawnPlayer(characterId, respawnLocation);

      res.json({
        success: true,
        data: {
          message: 'You have respawned.',
          characterId: result.character._id,
          name: result.character.name,
          currentLocation: result.character.currentLocation,
          energy: result.character.energy,
          maxEnergy: result.character.maxEnergy,
          dream: result.dream
        }
      });
    } catch (error) {
      logger.error('Error respawning character:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to respawn'
      });
    }
  }

  /**
   * GET /api/death/penalties
   * Get information about death penalties for each death type
   */
  static async getPenalties(_req: Request, res: Response): Promise<void> {
    try {
      // Import penalty constants
      const { DEATH_PENALTIES, RESPAWN_DELAYS } = await import('@desperados/shared');

      const penaltyInfo = Object.values(DeathType).map(type => ({
        deathType: type,
        penalties: DEATH_PENALTIES[type],
        respawnDelay: RESPAWN_DELAYS[type]
      }));

      res.json({
        success: true,
        data: {
          penalties: penaltyInfo
        }
      });
    } catch (error) {
      logger.error('Error getting death penalties:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get death penalties'
      });
    }
  }

  /**
   * POST /api/death/check-jail
   * Check if death should result in jail time instead
   * Body: { killerType: 'lawful_npc' | 'lawful_player' | 'outlaw' }
   */
  static async checkJail(req: Request, res: Response): Promise<void> {
    try {
      const character = req.character!;
      const { killerType } = req.body;

      if (!killerType || !['lawful_npc', 'lawful_player', 'outlaw'].includes(killerType)) {
        res.status(400).json({
          success: false,
          error: 'Valid killer type is required: lawful_npc, lawful_player, or outlaw'
        });
        return;
      }

      const shouldJail = await DeathService.shouldSendToJail(character, killerType);
      let jailSentence = 0;

      if (shouldJail) {
        jailSentence = DeathService.calculateJailSentence(character.wantedLevel);
      }

      res.json({
        success: true,
        data: {
          shouldSendToJail: shouldJail,
          wantedLevel: character.wantedLevel,
          jailSentenceMinutes: jailSentence
        }
      });
    } catch (error) {
      logger.error('Error checking jail status:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check jail status'
      });
    }
  }
}
