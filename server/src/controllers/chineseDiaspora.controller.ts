/**
 * Chinese Diaspora Controller
 *
 * Handles HTTP requests for the hidden Chinese immigrant network reputation system
 */

import { Request, Response } from 'express';
import { ChineseDiasporaService } from '../services/chineseDiaspora.service';
import { AuthRequest } from '../middleware/requireAuth';
import {
  DiscoveryMethodRep,
  DiasporaReputationAction,
  DiasporaService
} from '@desperados/shared';
import logger from '../utils/logger';

export class ChineseDiasporaController {
  /**
   * GET /api/diaspora/status
   * Get character's network status (null if not discovered)
   */
  static async getStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const characterId = req.query.characterId as string;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required'
        });
        return;
      }

      const reputation = await ChineseDiasporaService.getReputationStatus(characterId);

      if (!reputation) {
        res.status(200).json({
          success: true,
          data: {
            discovered: false,
            message: 'The network remains hidden to you'
          }
        });
        return;
      }

      const levelInfo = reputation.getTrustLevelInfo();

      res.status(200).json({
        success: true,
        data: {
          discovered: true,
          trustLevel: reputation.trustLevel,
          trustLevelName: levelInfo.nameEnglish,
          trustLevelChinese: levelInfo.nameChinese,
          trustLevelPinyin: levelInfo.namePinyin,
          reputationPoints: reputation.reputationPoints,
          networkStanding: reputation.networkStanding,
          discoveryMethod: reputation.discoveryMethod,
          discoveryDate: reputation.discoveryDate,
          knownNpcs: reputation.knownNpcs.length,
          knownLocations: reputation.knownLocations.length,
          completedQuests: reputation.completedQuests.length,
          services: levelInfo.services,
          safeHouseAccess: reputation.safeHouseAccess,
          safeHouseExpiresAt: reputation.safeHouseExpiresAt,
          permanentSafeHouse: reputation.permanentSafeHouse,
          undergroundRailroadParticipant: reputation.undergroundRailroadParticipant,
          isExiled: reputation.isExiled(),
          betrayals: reputation.betrayals.length,
          vouchedBy: reputation.vouchedBy.length,
          hasVouchedFor: reputation.hasVouchedFor.length
        }
      });
    } catch (error) {
      logger.error('Error in getStatus:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reputation status'
      });
    }
  }

  /**
   * POST /api/diaspora/discover
   * Discover the network for the first time
   */
  static async discoverNetwork(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId, method, npcId, locationId } = req.body;

      if (!characterId || !method || !npcId) {
        res.status(400).json({
          success: false,
          error: 'characterId, method, and npcId are required'
        });
        return;
      }

      // Validate discovery method
      if (!Object.values(DiscoveryMethodRep).includes(method)) {
        res.status(400).json({
          success: false,
          error: 'Invalid discovery method'
        });
        return;
      }

      const result = await ChineseDiasporaService.discoverNetwork(
        characterId,
        method as DiscoveryMethodRep,
        npcId,
        locationId
      );

      res.status(result.firstDiscovery ? 201 : 200).json({
        success: true,
        data: {
          discovered: true,
          firstDiscovery: result.firstDiscovery,
          message: result.message,
          trustLevel: result.reputation.trustLevel,
          reputationPoints: result.reputation.reputationPoints,
          networkStanding: result.reputation.networkStanding
        }
      });
    } catch (error) {
      logger.error('Error in discoverNetwork:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to discover network'
      });
    }
  }

  /**
   * GET /api/diaspora/contacts
   * Get known network contacts
   */
  static async getContacts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const characterId = req.query.characterId as string;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required'
        });
        return;
      }

      const result = await ChineseDiasporaService.getKnownNPCs(characterId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getContacts:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get contacts'
      });
    }
  }

  /**
   * POST /api/diaspora/interact/:npcId
   * Interact with a network NPC
   */
  static async interactWithNPC(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { npcId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required'
        });
        return;
      }

      const result = await ChineseDiasporaService.interactWithNPC(characterId, npcId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in interactWithNPC:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to interact with NPC'
      });
    }
  }

  /**
   * POST /api/diaspora/reputation/add
   * Add reputation (for quest completion, helping NPCs, etc.)
   */
  static async addReputation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId, action, customAmount, metadata } = req.body;

      if (!characterId || !action) {
        res.status(400).json({
          success: false,
          error: 'characterId and action are required'
        });
        return;
      }

      // Validate action
      if (!Object.values(DiasporaReputationAction).includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Invalid reputation action'
        });
        return;
      }

      const result = await ChineseDiasporaService.addReputation(
        characterId,
        action as DiasporaReputationAction,
        customAmount,
        metadata
      );

      res.status(200).json({
        success: true,
        data: {
          reputationPoints: result.reputation.reputationPoints,
          trustLevel: result.reputation.trustLevel,
          change: result.change,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
          message: result.leveledUp
            ? `You have gained the trust of the network! You are now ${result.reputation.getTrustLevelInfo().nameEnglish} (${result.reputation.getTrustLevelInfo().nameChinese})`
            : `Reputation increased by ${result.change}`
        }
      });
    } catch (error) {
      logger.error('Error in addReputation:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add reputation'
      });
    }
  }

  /**
   * POST /api/diaspora/reputation/remove
   * Remove reputation (for betrayals, crimes against network, etc.)
   */
  static async removeReputation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId, action, customAmount, metadata } = req.body;

      if (!characterId || !action) {
        res.status(400).json({
          success: false,
          error: 'characterId and action are required'
        });
        return;
      }

      // Validate action
      if (!Object.values(DiasporaReputationAction).includes(action)) {
        res.status(400).json({
          success: false,
          error: 'Invalid reputation action'
        });
        return;
      }

      const result = await ChineseDiasporaService.removeReputation(
        characterId,
        action as DiasporaReputationAction,
        customAmount,
        metadata
      );

      let message = `Reputation decreased by ${Math.abs(result.change)}`;
      if (result.exiled) {
        message = 'You have been EXILED from the network. There is no redemption.';
      } else if (result.leveledDown) {
        message = `The network's trust in you has diminished. You are now ${result.reputation.getTrustLevelInfo().nameEnglish}`;
      }

      res.status(200).json({
        success: true,
        data: {
          reputationPoints: result.reputation.reputationPoints,
          trustLevel: result.reputation.trustLevel,
          change: result.change,
          leveledDown: result.leveledDown,
          exiled: result.exiled,
          message
        }
      });
    } catch (error) {
      logger.error('Error in removeReputation:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove reputation'
      });
    }
  }

  /**
   * POST /api/diaspora/vouch
   * Vouch for another character
   */
  static async vouchForCharacter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { voucherId, targetCharacterId } = req.body;

      if (!voucherId || !targetCharacterId) {
        res.status(400).json({
          success: false,
          error: 'voucherId and targetCharacterId are required'
        });
        return;
      }

      if (voucherId === targetCharacterId) {
        res.status(400).json({
          success: false,
          error: 'Cannot vouch for yourself'
        });
        return;
      }

      const result = await ChineseDiasporaService.vouchForCharacter(
        voucherId,
        targetCharacterId
      );

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        data: result.success ? {
          message: result.message,
          trustGranted: result.trustGranted
        } : undefined,
        error: !result.success ? result.message : undefined
      });
    } catch (error) {
      logger.error('Error in vouchForCharacter:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vouch for character'
      });
    }
  }

  /**
   * POST /api/diaspora/request-service
   * Request a network service
   */
  static async requestService(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId, service } = req.body;

      if (!characterId || !service) {
        res.status(400).json({
          success: false,
          error: 'characterId and service are required'
        });
        return;
      }

      // Special handling for safe house service
      if (service === DiasporaService.SAFE_HOUSE || service === DiasporaService.PERMANENT_SAFE_HOUSE) {
        const result = await ChineseDiasporaService.requestSafeHouse(characterId);

        res.status(result.success ? 200 : 400).json({
          success: result.success,
          data: result.success ? {
            message: result.message,
            duration: result.duration,
            expiresAt: result.expiresAt
          } : undefined,
          error: !result.success ? result.message : undefined
        });
        return;
      }

      // For other services, check availability
      const availableServices = await ChineseDiasporaService.getAvailableServices(characterId);

      if (!availableServices.services.includes(service as DiasporaService)) {
        res.status(403).json({
          success: false,
          error: `Service not available at your trust level. Required: ${service}`
        });
        return;
      }

      // Service is available - actual service logic would go here
      // For now, just confirm availability
      res.status(200).json({
        success: true,
        data: {
          message: `Service ${service} is available to you`,
          service
        }
      });
    } catch (error) {
      logger.error('Error in requestService:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request service'
      });
    }
  }

  /**
   * GET /api/diaspora/services
   * Get available services for character
   */
  static async getAvailableServices(req: AuthRequest, res: Response): Promise<void> {
    try {
      const characterId = req.query.characterId as string;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required'
        });
        return;
      }

      const result = await ChineseDiasporaService.getAvailableServices(characterId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getAvailableServices:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available services'
      });
    }
  }

  /**
   * GET /api/diaspora/leaderboard
   * Get leaderboard of Dragons (highest trust level)
   */
  static async getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

      const dragons = await ChineseDiasporaService.getDragonLeaderboard(limit);

      res.status(200).json({
        success: true,
        data: {
          dragons: dragons.map(d => ({
            characterId: d.characterId,
            reputationPoints: d.reputationPoints,
            trustLevel: d.trustLevel,
            discoveryDate: d.discoveryDate,
            networkStanding: d.networkStanding
          }))
        }
      });
    } catch (error) {
      logger.error('Error in getLeaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get leaderboard'
      });
    }
  }

  /**
   * POST /api/diaspora/weekly-bonus
   * Process weekly secret-keeping bonus (called by job)
   */
  static async processWeeklyBonus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required'
        });
        return;
      }

      await ChineseDiasporaService.processWeeklySecretKeeping(characterId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Weekly bonus processed'
        }
      });
    } catch (error) {
      logger.error('Error in processWeeklyBonus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process weekly bonus'
      });
    }
  }
}
