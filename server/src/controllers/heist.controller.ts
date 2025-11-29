/**
 * Heist Controller
 *
 * HTTP endpoints for heist planning, execution, and management
 */

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { HeistService } from '../services/heist.service';
import { Gang } from '../models/Gang.model';
import { HeistPlanningRequest } from '@desperados/shared';
import logger from '../utils/logger';

export class HeistController {
  /**
   * GET /api/heists/available
   * Get available heist targets for the character's gang
   */
  static async getAvailableHeists(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to view heist targets',
        });
        return;
      }

      const heists = await HeistService.getAvailableHeists(gang._id.toString());

      res.status(200).json({
        success: true,
        data: {
          heists,
          gangId: gang._id,
          gangName: gang.name,
        },
      });
    } catch (error) {
      logger.error('Error getting available heists:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available heists',
      });
    }
  }

  /**
   * GET /api/heists
   * Get all heists for the character's gang
   */
  static async getGangHeists(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;
      const includeCompleted = req.query.includeCompleted === 'true';

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to view heists',
        });
        return;
      }

      const heists = await HeistService.getGangHeists(gang._id.toString(), includeCompleted);

      res.status(200).json({
        success: true,
        data: {
          heists,
          total: heists.length,
          gangId: gang._id,
        },
      });
    } catch (error) {
      logger.error('Error getting gang heists:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get gang heists',
      });
    }
  }

  /**
   * POST /api/heists/plan
   * Start planning a new heist
   */
  static async planHeist(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;
      const { target, roleAssignments } = req.body as HeistPlanningRequest;

      if (!target) {
        res.status(400).json({
          success: false,
          error: 'Heist target is required',
        });
        return;
      }

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to plan a heist',
        });
        return;
      }

      const heist = await HeistService.planHeist(gang._id.toString(), characterId, {
        target,
        roleAssignments: roleAssignments || [],
      });

      res.status(201).json({
        success: true,
        data: { heist },
        message: `Heist planning started for ${heist.targetName}`,
      });
    } catch (error) {
      logger.error('Error planning heist:', error);
      const message = error instanceof Error ? error.message : 'Failed to plan heist';
      const statusCode = message.includes('Only the leader') ? 403 :
                         message.includes('not found') ? 404 :
                         message.includes('cooldown') ? 429 :
                         message.includes('Insufficient') ? 400 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/heists/:heistId/progress
   * Increase planning progress for a heist
   */
  static async increasePlanning(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;
      const { heistId } = req.params;
      const { amount } = req.body;

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to contribute to heist planning',
        });
        return;
      }

      const heist = await HeistService.increasePlanning(
        gang._id.toString(),
        heistId,
        characterId,
        amount || 10
      );

      res.status(200).json({
        success: true,
        data: { heist },
        message: `Planning progress: ${heist.planningProgress}%`,
      });
    } catch (error) {
      logger.error('Error increasing planning:', error);
      const message = error instanceof Error ? error.message : 'Failed to increase planning';
      const statusCode = message.includes('not found') ? 404 :
                         message.includes('not a member') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/heists/:heistId/execute
   * Execute a planned heist
   */
  static async executeHeist(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;
      const { heistId } = req.params;

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to execute a heist',
        });
        return;
      }

      const heist = await HeistService.executeHeist(gang._id.toString(), heistId, characterId);

      res.status(200).json({
        success: true,
        data: {
          heist,
          outcome: heist.outcome,
        },
        message: `Heist ${heist.outcome || 'executed'}!`,
      });
    } catch (error) {
      logger.error('Error executing heist:', error);
      const message = error instanceof Error ? error.message : 'Failed to execute heist';
      const statusCode = message.includes('Only the leader') ? 403 :
                         message.includes('not found') ? 404 :
                         message.includes('not ready') ? 400 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/heists/:heistId/cancel
   * Cancel a heist in planning
   */
  static async cancelHeist(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;
      const { heistId } = req.params;

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to cancel a heist',
        });
        return;
      }

      await HeistService.cancelHeist(gang._id.toString(), heistId, characterId);

      res.status(200).json({
        success: true,
        message: 'Heist cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling heist:', error);
      const message = error instanceof Error ? error.message : 'Failed to cancel heist';
      const statusCode = message.includes('Only the leader') ? 403 :
                         message.includes('not found') ? 404 :
                         message.includes('Cannot cancel') ? 400 : 400;
      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * POST /api/heists/:heistId/roles
   * Assign a role to a gang member for the heist
   */
  static async assignRole(
    req: CharacterRequest,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const characterId = req.character!._id.toString();
      const characterObjectId = req.character!._id as mongoose.Types.ObjectId;
      const { heistId } = req.params;
      const { role, targetCharacterId } = req.body;

      if (!role || !targetCharacterId) {
        res.status(400).json({
          success: false,
          error: 'Role and targetCharacterId are required',
        });
        return;
      }

      // Get the character's gang
      const gang = await Gang.findByMember(characterObjectId);
      if (!gang) {
        res.status(400).json({
          success: false,
          error: 'You must be in a gang to assign heist roles',
        });
        return;
      }

      // For now, planning with role assignments is handled in planHeist
      // This endpoint can be used to modify roles after planning
      res.status(200).json({
        success: true,
        message: 'Role assignment feature - use plan endpoint with roleAssignments',
      });
    } catch (error) {
      logger.error('Error assigning role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign role',
      });
    }
  }
}
