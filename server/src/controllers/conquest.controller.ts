/**
 * Conquest Controller
 *
 * HTTP endpoints for territory siege and conquest mechanics
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import { Response, NextFunction } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { conquestService } from '../services/conquest.service';
import { TerritoryFactionId as FactionId } from '@desperados/shared';
import logger from '../utils/logger';

export class ConquestController {
  // ========================
  // SIEGE ELIGIBILITY
  // ========================

  /**
   * GET /api/conquest/territories/:territoryId/eligibility
   * Check if a faction can declare siege on a territory
   */
  static async checkSiegeEligibility(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { attackingFaction, currentInfluence } = req.query;

      if (!attackingFaction) {
        res.status(400).json({
          success: false,
          error: 'attackingFaction query parameter is required',
        });
        return;
      }

      const influence = parseFloat(currentInfluence as string) || 0;

      const result = await conquestService.checkSiegeEligibility(
        territoryId,
        attackingFaction as FactionId,
        influence
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error checking siege eligibility:', error);
      const message = error instanceof Error ? error.message : 'Failed to check siege eligibility';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // SIEGE DECLARATION
  // ========================

  /**
   * POST /api/conquest/territories/:territoryId/declare-siege
   * Declare siege on a territory
   * Body: { attackingFaction, resourceCommitment, requestedAllies?, warDuration? }
   */
  static async declareSiege(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { attackingFaction, resourceCommitment, requestedAllies, warDuration } = req.body;

      if (!attackingFaction) {
        res.status(400).json({
          success: false,
          error: 'attackingFaction is required',
        });
        return;
      }

      if (!resourceCommitment || !resourceCommitment.gold || !resourceCommitment.supplies || !resourceCommitment.troops) {
        res.status(400).json({
          success: false,
          error: 'resourceCommitment with gold, supplies, and troops is required',
        });
        return;
      }

      const attempt = await conquestService.declareSiege({
        territoryId,
        attackingFaction,
        resourceCommitment,
        requestedAllies,
        warDuration,
      });

      res.status(201).json({
        success: true,
        data: { attempt },
        message: `Siege declared on ${attempt.territoryName}!`,
      });
    } catch (error) {
      logger.error('Error declaring siege:', error);
      const message = error instanceof Error ? error.message : 'Failed to declare siege';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/conquest/sieges/:siegeAttemptId/rally-defense
   * Rally defense for a siege (defending faction)
   * Body: { defendingFaction, resourceCommitment, requestedAllies? }
   */
  static async rallyDefense(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { siegeAttemptId } = req.params;
      const { defendingFaction, resourceCommitment, requestedAllies } = req.body;

      if (!defendingFaction) {
        res.status(400).json({
          success: false,
          error: 'defendingFaction is required',
        });
        return;
      }

      if (!resourceCommitment || !resourceCommitment.gold || !resourceCommitment.supplies || !resourceCommitment.troops) {
        res.status(400).json({
          success: false,
          error: 'resourceCommitment with gold, supplies, and troops is required',
        });
        return;
      }

      const attempt = await conquestService.rallyDefense({
        siegeAttemptId,
        defendingFaction,
        resourceCommitment,
        requestedAllies,
      });

      res.status(200).json({
        success: true,
        data: { attempt },
        message: 'Defense rallied successfully!',
      });
    } catch (error) {
      logger.error('Error rallying defense:', error);
      const message = error instanceof Error ? error.message : 'Failed to rally defense';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // SIEGE EXECUTION
  // ========================

  /**
   * POST /api/conquest/sieges/:siegeAttemptId/start-assault
   * Start the assault phase (war event begins)
   * Body: { warEventId? }
   */
  static async startAssault(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { siegeAttemptId } = req.params;
      const { warEventId } = req.body;

      const attempt = await conquestService.startAssault(siegeAttemptId, warEventId);

      res.status(200).json({
        success: true,
        data: { attempt },
        message: 'Assault has begun!',
      });
    } catch (error) {
      logger.error('Error starting assault:', error);
      const message = error instanceof Error ? error.message : 'Failed to start assault';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/conquest/sieges/:siegeAttemptId/complete
   * Complete a conquest attempt (resolve siege outcome)
   * Body: { attackerScore, defenderScore }
   */
  static async completeConquest(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { siegeAttemptId } = req.params;
      const { attackerScore, defenderScore } = req.body;

      if (typeof attackerScore !== 'number' || typeof defenderScore !== 'number') {
        res.status(400).json({
          success: false,
          error: 'attackerScore and defenderScore are required as numbers',
        });
        return;
      }

      const result = await conquestService.completeConquest(
        siegeAttemptId,
        attackerScore,
        defenderScore
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error completing conquest:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete conquest';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/conquest/sieges/:siegeAttemptId/cancel
   * Cancel a pending siege
   */
  static async cancelSiege(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { siegeAttemptId } = req.params;

      await conquestService.cancelSiege(siegeAttemptId);

      res.status(200).json({
        success: true,
        message: 'Siege cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling siege:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel siege';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // SIEGE QUERIES
  // ========================

  /**
   * GET /api/conquest/sieges/active
   * Get all active sieges
   */
  static async getActiveSieges(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const sieges = await conquestService.getActiveSieges();

      res.status(200).json({
        success: true,
        data: { sieges },
      });
    } catch (error) {
      logger.error('Error getting active sieges:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get active sieges',
      });
    }
  }

  /**
   * GET /api/conquest/territories/:territoryId/history
   * Get conquest history for a territory
   */
  static async getConquestHistory(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;

      const history = await conquestService.getConquestHistory(territoryId);

      res.status(200).json({
        success: true,
        data: { history },
      });
    } catch (error) {
      logger.error('Error getting conquest history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get conquest history',
      });
    }
  }

  /**
   * GET /api/conquest/factions/:factionId/statistics
   * Get faction conquest statistics
   */
  static async getFactionStatistics(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { factionId } = req.params;

      const stats = await conquestService.getFactionStatistics(factionId as FactionId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting faction statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get faction statistics',
      });
    }
  }

  // ========================
  // TERRITORY STATE MANAGEMENT
  // ========================

  /**
   * POST /api/conquest/territories/:territoryId/initialize
   * Initialize conquest state for a territory (admin/system use)
   * Body: { territoryName, initialController }
   */
  static async initializeTerritoryState(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { territoryName, initialController } = req.body;

      if (!territoryName || !initialController) {
        res.status(400).json({
          success: false,
          error: 'territoryName and initialController are required',
        });
        return;
      }

      const state = await conquestService.initializeTerritoryConquestState(
        territoryId,
        territoryName,
        initialController as FactionId
      );

      res.status(201).json({
        success: true,
        data: { state },
        message: 'Territory conquest state initialized',
      });
    } catch (error) {
      logger.error('Error initializing territory state:', error);
      const message = error instanceof Error ? error.message : 'Failed to initialize territory state';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/conquest/update-occupation-statuses
   * Update occupation statuses for all territories (admin/cron job)
   */
  static async updateOccupationStatuses(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      await conquestService.updateOccupationStatuses();

      res.status(200).json({
        success: true,
        message: 'Occupation statuses updated',
      });
    } catch (error) {
      logger.error('Error updating occupation statuses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update occupation statuses',
      });
    }
  }
}
