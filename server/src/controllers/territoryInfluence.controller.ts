/**
 * Territory Influence Controller
 *
 * HTTP endpoints for faction influence and territory control
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import { Response, NextFunction } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { TerritoryInfluenceService } from '../services/territoryInfluence.service';
import { TerritoryFactionId, InfluenceSource } from '@desperados/shared';
import logger from '../utils/logger';

export class TerritoryInfluenceController {
  // ========================
  // TERRITORY QUERIES
  // ========================

  /**
   * GET /api/territory-influence
   * Get all territory influence summaries
   */
  static async getAllTerritories(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const territories = await TerritoryInfluenceService.getAllTerritories();

      res.status(200).json({
        success: true,
        data: { territories },
      });
    } catch (error) {
      logger.error('Error getting all territories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get territories',
      });
    }
  }

  /**
   * GET /api/territory-influence/:territoryId
   * Get territory influence summary
   */
  static async getTerritoryInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;

      const territory = await TerritoryInfluenceService.getTerritoryInfluence(territoryId);

      res.status(200).json({
        success: true,
        data: territory,
      });
    } catch (error) {
      logger.error('Error getting territory influence:', error);
      const message = error instanceof Error ? error.message : 'Failed to get territory influence';
      res.status(404).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/territory-influence/:territoryId/history
   * Get influence history for a territory
   */
  static async getInfluenceHistory(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = await TerritoryInfluenceService.getInfluenceHistory(territoryId, limit);

      res.status(200).json({
        success: true,
        data: { history },
      });
    } catch (error) {
      logger.error('Error getting influence history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get influence history',
      });
    }
  }

  // ========================
  // FACTION QUERIES
  // ========================

  /**
   * GET /api/territory-influence/factions/:factionId/overview
   * Get faction overview across all territories
   */
  static async getFactionOverview(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { factionId } = req.params;

      const overview = await TerritoryInfluenceService.getFactionOverview(
        factionId as TerritoryFactionId
      );

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      logger.error('Error getting faction overview:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get faction overview',
      });
    }
  }

  /**
   * GET /api/territory-influence/:territoryId/benefits
   * Get alignment benefits for faction in territory
   */
  static async getAlignmentBenefits(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { factionId } = req.query;

      if (!factionId) {
        res.status(400).json({
          success: false,
          error: 'factionId query parameter is required',
        });
        return;
      }

      const benefits = await TerritoryInfluenceService.getAlignmentBenefits(
        territoryId,
        factionId as TerritoryFactionId
      );

      res.status(200).json({
        success: true,
        data: benefits,
      });
    } catch (error) {
      logger.error('Error getting alignment benefits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get alignment benefits',
      });
    }
  }

  // ========================
  // CHARACTER CONTRIBUTIONS
  // ========================

  /**
   * GET /api/territory-influence/characters/:characterId/contributions
   * Get character's influence contributions
   */
  static async getCharacterInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { characterId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const contributions = await TerritoryInfluenceService.getCharacterInfluence(characterId, limit);

      res.status(200).json({
        success: true,
        data: { contributions },
      });
    } catch (error) {
      logger.error('Error getting character influence:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get character influence',
      });
    }
  }

  // ========================
  // INFLUENCE MODIFICATION
  // ========================

  /**
   * POST /api/territory-influence/:territoryId/contribute
   * Contribute to faction influence in a territory
   * Body: { factionId, amount, source, metadata? }
   */
  static async contributeInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { factionId, amount, source, metadata } = req.body;
      const character = req.character;

      if (!factionId || amount === undefined || !source) {
        res.status(400).json({
          success: false,
          error: 'factionId, amount, and source are required',
        });
        return;
      }

      // Validate source
      if (!Object.values(InfluenceSource).includes(source)) {
        res.status(400).json({
          success: false,
          error: 'Invalid influence source',
        });
        return;
      }

      const result = await TerritoryInfluenceService.modifyInfluence(
        territoryId,
        factionId as TerritoryFactionId,
        amount,
        source,
        character?._id?.toString(),
        character?.name,
        character?.gangId?.toString(),
        undefined, // gangName - would need to be fetched
        metadata
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error contributing influence:', error);
      const message = error instanceof Error ? error.message : 'Failed to contribute influence';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/territory-influence/:territoryId/donate
   * Donate gold to faction for influence
   * Body: { factionId, donationAmount }
   */
  static async donateForInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { factionId, donationAmount } = req.body;
      const character = req.character;

      if (!factionId || !donationAmount) {
        res.status(400).json({
          success: false,
          error: 'factionId and donationAmount are required',
        });
        return;
      }

      if (typeof donationAmount !== 'number' || donationAmount <= 0) {
        res.status(400).json({
          success: false,
          error: 'donationAmount must be a positive number',
        });
        return;
      }

      const characterId = character?._id?.toString();
      const characterName = character?.name;

      if (!characterId || !characterName) {
        res.status(400).json({
          success: false,
          error: 'Character information is required',
        });
        return;
      }

      const result = await TerritoryInfluenceService.applyDonationInfluence(
        territoryId,
        factionId as TerritoryFactionId,
        characterId,
        characterName,
        donationAmount
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error donating for influence:', error);
      const message = error instanceof Error ? error.message : 'Failed to process donation';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  // ========================
  // SYSTEM OPERATIONS
  // ========================

  /**
   * POST /api/territory-influence/initialize
   * Initialize all territories with base influence (admin/setup)
   */
  static async initializeTerritories(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      await TerritoryInfluenceService.initializeTerritories();

      res.status(200).json({
        success: true,
        message: 'Territories initialized successfully',
      });
    } catch (error) {
      logger.error('Error initializing territories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize territories',
      });
    }
  }

  /**
   * POST /api/territory-influence/apply-daily-decay
   * Apply daily influence decay to all territories (cron job)
   */
  static async applyDailyDecay(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      await TerritoryInfluenceService.applyDailyDecay();

      res.status(200).json({
        success: true,
        message: 'Daily decay applied successfully',
      });
    } catch (error) {
      logger.error('Error applying daily decay:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to apply daily decay',
      });
    }
  }

  /**
   * POST /api/territory-influence/:territoryId/gang-alignment
   * Apply gang alignment influence (daily passive gain)
   * Body: { gangId, gangName, factionId, influenceAmount }
   */
  static async applyGangAlignmentInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { gangId, gangName, factionId, influenceAmount } = req.body;

      if (!gangId || !gangName || !factionId || influenceAmount === undefined) {
        res.status(400).json({
          success: false,
          error: 'gangId, gangName, factionId, and influenceAmount are required',
        });
        return;
      }

      const result = await TerritoryInfluenceService.applyGangAlignmentInfluence(
        gangId,
        gangName,
        territoryId,
        factionId as TerritoryFactionId,
        influenceAmount
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error applying gang alignment influence:', error);
      const message = error instanceof Error ? error.message : 'Failed to apply gang alignment influence';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/territory-influence/:territoryId/quest
   * Apply quest completion influence
   * Body: { factionId, questId, influenceAmount }
   */
  static async applyQuestInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { factionId, questId, influenceAmount } = req.body;
      const character = req.character;

      if (!factionId || !questId || influenceAmount === undefined) {
        res.status(400).json({
          success: false,
          error: 'factionId, questId, and influenceAmount are required',
        });
        return;
      }

      const characterId = character?._id?.toString();
      const characterName = character?.name;

      if (!characterId || !characterName) {
        res.status(400).json({
          success: false,
          error: 'Character information is required',
        });
        return;
      }

      const result = await TerritoryInfluenceService.applyQuestInfluence(
        territoryId,
        factionId as TerritoryFactionId,
        characterId,
        characterName,
        questId,
        influenceAmount
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error applying quest influence:', error);
      const message = error instanceof Error ? error.message : 'Failed to apply quest influence';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/territory-influence/:territoryId/crime
   * Apply criminal activity influence (negative for controlling faction)
   * Body: { crimeType }
   */
  static async applyCrimeInfluence(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const { territoryId } = req.params;
      const { crimeType } = req.body;
      const character = req.character;

      if (!crimeType) {
        res.status(400).json({
          success: false,
          error: 'crimeType is required',
        });
        return;
      }

      const characterId = character?._id?.toString();
      const characterName = character?.name;

      if (!characterId || !characterName) {
        res.status(400).json({
          success: false,
          error: 'Character information is required',
        });
        return;
      }

      const result = await TerritoryInfluenceService.applyCrimeInfluence(
        territoryId,
        characterId,
        characterName,
        crimeType
      );

      if (!result) {
        res.status(200).json({
          success: true,
          message: 'No controlling faction in this territory',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      logger.error('Error applying crime influence:', error);
      const message = error instanceof Error ? error.message : 'Failed to apply crime influence';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
}
