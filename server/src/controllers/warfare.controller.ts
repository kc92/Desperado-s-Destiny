/**
 * Warfare Controller
 *
 * HTTP endpoints for territory warfare, fortifications, and resistance
 * Combines fortification.service and resistance.service functionality
 */

import { Response, NextFunction } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { fortificationService } from '../services/fortification.service';
import { resistanceService } from '../services/resistance.service';
import {
  FortificationType,
  FactionId,
  ResistanceActivityType,
} from '@desperados/shared';
import logger from '../utils/logger';

export class WarfareController {
  // ========================
  // FORTIFICATION ENDPOINTS
  // ========================

  /**
   * GET /api/warfare/territories/:territoryId/fortifications
   * Get all fortifications for a territory
   */
  static async getTerritoryFortifications(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;

      const result = await fortificationService.getTerritoryFortifications(territoryId);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Territory conquest state not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting territory fortifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get territory fortifications',
      });
    }
  }

  /**
   * GET /api/warfare/territories/:territoryId/fortifications/:fortificationId
   * Get info about a specific fortification
   */
  static async getFortificationInfo(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId, fortificationId } = req.params;

      const result = await fortificationService.getFortificationInfo(territoryId, fortificationId);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Fortification not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting fortification info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get fortification info',
      });
    }
  }

  /**
   * POST /api/warfare/territories/:territoryId/fortifications
   * Build a new fortification
   */
  static async buildFortification(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { fortificationType, factionId } = req.body;

      if (!fortificationType) {
        res.status(400).json({
          success: false,
          error: 'fortificationType is required',
        });
        return;
      }

      if (!factionId) {
        res.status(400).json({
          success: false,
          error: 'factionId is required',
        });
        return;
      }

      // Validate fortification type
      if (!Object.values(FortificationType).includes(fortificationType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid fortification type',
        });
        return;
      }

      const result = await fortificationService.buildFortification({
        territoryId,
        fortificationType,
        factionId,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          fortification: result.fortification,
          cost: result.cost,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error building fortification:', error);
      const message = error instanceof Error ? error.message : 'Failed to build fortification';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * PUT /api/warfare/territories/:territoryId/fortifications/:fortificationId/upgrade
   * Upgrade an existing fortification
   */
  static async upgradeFortification(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId, fortificationId } = req.params;
      const { factionId } = req.body;

      if (!factionId) {
        res.status(400).json({
          success: false,
          error: 'factionId is required',
        });
        return;
      }

      const result = await fortificationService.upgradeFortification({
        territoryId,
        fortificationId,
        factionId,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          fortification: result.fortification,
          cost: result.cost,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error upgrading fortification:', error);
      const message = error instanceof Error ? error.message : 'Failed to upgrade fortification';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * PUT /api/warfare/territories/:territoryId/fortifications/:fortificationId/repair
   * Repair a damaged fortification
   */
  static async repairFortification(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId, fortificationId } = req.params;
      const { factionId } = req.body;

      if (!factionId) {
        res.status(400).json({
          success: false,
          error: 'factionId is required',
        });
        return;
      }

      const result = await fortificationService.repairFortification({
        territoryId,
        fortificationId,
        factionId,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          fortification: result.fortification,
          cost: result.cost,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error repairing fortification:', error);
      const message = error instanceof Error ? error.message : 'Failed to repair fortification';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * DELETE /api/warfare/territories/:territoryId/fortifications/:fortificationId
   * Demolish a fortification
   */
  static async demolishFortification(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId, fortificationId } = req.params;
      const { factionId } = req.body;

      if (!factionId) {
        res.status(400).json({
          success: false,
          error: 'factionId is required',
        });
        return;
      }

      const result = await fortificationService.demolishFortification(
        territoryId,
        fortificationId,
        factionId as FactionId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error demolishing fortification:', error);
      const message = error instanceof Error ? error.message : 'Failed to demolish fortification';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/warfare/territories/:territoryId/recommendations
   * Get fortification build recommendations
   */
  static async getBuildRecommendations(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;

      const result = await fortificationService.getBuildRecommendations(territoryId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting build recommendations:', error);
      const message = error instanceof Error ? error.message : 'Failed to get recommendations';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/warfare/territories/:territoryId/siege-damage
   * Apply siege damage to fortifications (admin/system use)
   */
  static async applySiegeDamage(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { siegeIntensity, duration } = req.body;

      if (typeof siegeIntensity !== 'number' || typeof duration !== 'number') {
        res.status(400).json({
          success: false,
          error: 'siegeIntensity and duration are required as numbers',
        });
        return;
      }

      const result = await fortificationService.applySiegeDamage(
        territoryId,
        siegeIntensity,
        duration
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `Siege damage applied to ${result.fortificationsDamaged} fortifications`,
      });
    } catch (error) {
      logger.error('Error applying siege damage:', error);
      const message = error instanceof Error ? error.message : 'Failed to apply siege damage';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // RESISTANCE ENDPOINTS
  // ========================

  /**
   * GET /api/warfare/territories/:territoryId/resistance
   * Get resistance activities for a territory
   */
  static async getResistanceActivities(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;

      const result = await resistanceService.getResistanceActivities(territoryId);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Territory conquest state not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting resistance activities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get resistance activities',
      });
    }
  }

  /**
   * GET /api/warfare/territories/:territoryId/resistance/actions
   * Get available resistance actions for a faction
   */
  static async getAvailableResistanceActions(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { faction } = req.query;

      if (!faction) {
        res.status(400).json({
          success: false,
          error: 'faction query parameter is required',
        });
        return;
      }

      const result = await resistanceService.getAvailableResistanceActions(
        territoryId,
        faction as FactionId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting available resistance actions:', error);
      const message = error instanceof Error ? error.message : 'Failed to get resistance actions';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/warfare/territories/:territoryId/resistance/execute
   * Execute a resistance action
   */
  static async executeResistanceAction(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { activityType, faction, resourcesCommitted } = req.body;

      if (!activityType || !faction || resourcesCommitted === undefined) {
        res.status(400).json({
          success: false,
          error: 'activityType, faction, and resourcesCommitted are required',
        });
        return;
      }

      // Validate activity type
      if (!Object.values(ResistanceActivityType).includes(activityType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resistance activity type',
        });
        return;
      }

      const result = await resistanceService.executeResistanceAction({
        territoryId,
        activityType,
        faction,
        resourcesCommitted,
      });

      if (!result.success) {
        const statusCode = result.consequences?.caught ? 400 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.message,
          consequences: result.consequences,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          activity: result.activity,
          effects: result.effects,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error executing resistance action:', error);
      const message = error instanceof Error ? error.message : 'Failed to execute resistance action';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/warfare/territories/:territoryId/resistance/suppress
   * Suppress resistance (for controlling faction)
   */
  static async suppressResistance(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { controllingFaction, resourcesCommitted } = req.body;

      if (!controllingFaction || resourcesCommitted === undefined) {
        res.status(400).json({
          success: false,
          error: 'controllingFaction and resourcesCommitted are required',
        });
        return;
      }

      const result = await resistanceService.suppressResistance(
        territoryId,
        controllingFaction as FactionId,
        resourcesCommitted
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          resistanceReduced: result.resistanceReduced,
          activitiesEliminated: result.activitiesEliminated,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error suppressing resistance:', error);
      const message = error instanceof Error ? error.message : 'Failed to suppress resistance';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // LIBERATION ENDPOINTS
  // ========================

  /**
   * POST /api/warfare/territories/:territoryId/liberation/start
   * Start a liberation campaign
   */
  static async startLiberationCampaign(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { liberatingFaction, initialResources } = req.body;

      if (!liberatingFaction || !initialResources) {
        res.status(400).json({
          success: false,
          error: 'liberatingFaction and initialResources are required',
        });
        return;
      }

      const { gold, supplies, troops } = initialResources;
      if (gold === undefined || supplies === undefined || troops === undefined) {
        res.status(400).json({
          success: false,
          error: 'initialResources must include gold, supplies, and troops',
        });
        return;
      }

      const result = await resistanceService.startLiberationCampaign(
        territoryId,
        liberatingFaction as FactionId,
        { gold, supplies, troops }
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
          requirements: result.requirements,
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: { campaign: result.campaign },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error starting liberation campaign:', error);
      const message = error instanceof Error ? error.message : 'Failed to start liberation campaign';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // DIPLOMACY ENDPOINTS
  // ========================

  /**
   * POST /api/warfare/territories/:territoryId/diplomacy/propose
   * Propose a diplomatic solution
   */
  static async proposeDiplomaticSolution(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { proposingFaction, targetFaction, solutionType, customTerms } = req.body;

      if (!proposingFaction || !targetFaction || !solutionType) {
        res.status(400).json({
          success: false,
          error: 'proposingFaction, targetFaction, and solutionType are required',
        });
        return;
      }

      const validSolutionTypes = ['partial_return', 'power_sharing', 'tribute', 'truce'];
      if (!validSolutionTypes.includes(solutionType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid solution type. Must be one of: partial_return, power_sharing, tribute, truce',
        });
        return;
      }

      const result = await resistanceService.proposeDiplomaticSolution(
        territoryId,
        proposingFaction as FactionId,
        targetFaction as FactionId,
        solutionType,
        customTerms
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          proposal: result.proposal,
          acceptanceChance: result.acceptanceChance,
        },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error proposing diplomatic solution:', error);
      const message = error instanceof Error ? error.message : 'Failed to propose diplomatic solution';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/warfare/diplomacy/:proposalId/accept
   * Accept a diplomatic proposal
   */
  static async acceptDiplomaticSolution(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { proposalId } = req.params;
      const { acceptingFaction } = req.body;

      if (!acceptingFaction) {
        res.status(400).json({
          success: false,
          error: 'acceptingFaction is required',
        });
        return;
      }

      const result = await resistanceService.acceptDiplomaticSolution(
        proposalId,
        acceptingFaction as FactionId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { effects: result.effects },
        message: result.message,
      });
    } catch (error) {
      logger.error('Error accepting diplomatic solution:', error);
      const message = error instanceof Error ? error.message : 'Failed to accept diplomatic solution';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
}
