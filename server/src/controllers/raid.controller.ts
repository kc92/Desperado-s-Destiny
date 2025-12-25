/**
 * Raid Controller
 *
 * Handles HTTP requests for raid operations
 * Phase 2.3 - Full Raid System
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { RaidService } from '../services/raid.service';
import { Gang } from '../models/Gang.model';
import { Character, ICharacter } from '../models/Character.model';
import { RaidTargetType, RaidParticipantRole, GuardSkillTier, InsuranceLevel } from '@desperados/shared';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

/**
 * Helper to verify character ownership
 */
async function verifyCharacterOwnership(
  userId: string,
  characterId: string,
  res: Response
): Promise<ICharacter | null> {
  const character = await Character.findById(characterId);

  if (!character) {
    res.status(404).json({ success: false, error: 'Character not found' });
    return null;
  }

  if (character.userId.toString() !== userId.toString()) {
    logger.warn(`[SECURITY] IDOR attempt: user ${userId} tried to use character ${characterId}`);
    res.status(403).json({ success: false, error: 'You do not own this character' });
    return null;
  }

  return character;
}

/**
 * Helper to verify gang membership
 */
async function verifyGangMembership(
  characterId: string,
  res: Response
): Promise<{ gang: any; character: ICharacter } | null> {
  const character = await Character.findById(characterId);
  if (!character) {
    res.status(404).json({ success: false, error: 'Character not found' });
    return null;
  }

  const gang = await Gang.findOne({ 'members.characterId': character._id });
  if (!gang) {
    res.status(400).json({ success: false, error: 'Character is not in a gang' });
    return null;
  }

  return { gang, character };
}

export class RaidController {
  /**
   * GET /api/raids/targets/:targetType
   * Get available raid targets for a target type
   */
  static async getAvailableTargets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetType } = req.params;
      const { characterId } = req.query;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId as string,
        res
      );
      if (!character) return;

      // Get gang
      const membership = await verifyGangMembership(characterId as string, res);
      if (!membership) return;

      // Validate target type
      if (!Object.values(RaidTargetType).includes(targetType as RaidTargetType)) {
        res.status(400).json({ success: false, error: 'Invalid target type' });
        return;
      }

      const targets = await RaidService.getAvailableTargets(
        membership.gang._id,
        targetType as RaidTargetType
      );

      res.json({ success: true, data: targets });
    } catch (error) {
      logger.error('Error getting raid targets:', error);
      res.status(500).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/raids/plan
   * Plan a new raid
   */
  static async planRaid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId, targetType, targetId } = req.body;

      if (!characterId || !targetType || !targetId) {
        res.status(400).json({
          success: false,
          error: 'characterId, targetType, and targetId are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      // Get gang
      const membership = await verifyGangMembership(characterId, res);
      if (!membership) return;

      const raid = await RaidService.planRaid(
        membership.gang._id,
        new mongoose.Types.ObjectId(characterId),
        targetType as RaidTargetType,
        new mongoose.Types.ObjectId(targetId)
      );

      res.status(201).json({ success: true, data: raid });
    } catch (error) {
      logger.error('Error planning raid:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/raids/:raidId/join
   * Join an existing raid
   */
  static async joinRaid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { raidId } = req.params;
      const { characterId, role } = req.body;

      if (!characterId || !role) {
        res.status(400).json({
          success: false,
          error: 'characterId and role are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      // Validate role (can't join as leader)
      if (role === RaidParticipantRole.LEADER) {
        res.status(400).json({ success: false, error: 'Cannot join as leader' });
        return;
      }

      const raid = await RaidService.joinRaid(
        new mongoose.Types.ObjectId(raidId),
        new mongoose.Types.ObjectId(characterId),
        role as Exclude<RaidParticipantRole, 'leader'>
      );

      res.json({ success: true, data: raid });
    } catch (error) {
      logger.error('Error joining raid:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/raids/:raidId/schedule
   * Schedule raid execution time
   */
  static async scheduleRaid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { raidId } = req.params;
      const { characterId, scheduledFor } = req.body;

      if (!characterId || !scheduledFor) {
        res.status(400).json({
          success: false,
          error: 'characterId and scheduledFor are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      const raid = await RaidService.scheduleRaid(
        new mongoose.Types.ObjectId(raidId),
        new Date(scheduledFor),
        new mongoose.Types.ObjectId(characterId)
      );

      res.json({ success: true, data: raid });
    } catch (error) {
      logger.error('Error scheduling raid:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/raids/:raidId/cancel
   * Cancel a raid
   */
  static async cancelRaid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { raidId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      const raid = await RaidService.cancelRaid(
        new mongoose.Types.ObjectId(raidId),
        new mongoose.Types.ObjectId(characterId)
      );

      res.json({ success: true, data: raid });
    } catch (error) {
      logger.error('Error cancelling raid:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/raids/:raidId/execute
   * Execute a raid immediately (for testing or leader actions)
   */
  static async executeRaidNow(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { raidId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      const result = await RaidService.executeRaid(new mongoose.Types.ObjectId(raidId));

      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error executing raid:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/raids/active
   * Get active raids for the character's gang
   */
  static async getActiveRaids(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId } = req.query;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId as string,
        res
      );
      if (!character) return;

      // Get gang
      const membership = await verifyGangMembership(characterId as string, res);
      if (!membership) return;

      const raids = await RaidService.getActiveRaids(membership.gang._id);

      res.json({ success: true, data: raids });
    } catch (error) {
      logger.error('Error getting active raids:', error);
      res.status(500).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/raids/history
   * Get raid history for the character's gang
   */
  static async getRaidHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId, limit } = req.query;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId as string,
        res
      );
      if (!character) return;

      // Get gang
      const membership = await verifyGangMembership(characterId as string, res);
      if (!membership) return;

      const raids = await RaidService.getRaidHistory(
        membership.gang._id,
        limit ? parseInt(limit as string) : 20
      );

      res.json({ success: true, data: raids });
    } catch (error) {
      logger.error('Error getting raid history:', error);
      res.status(500).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/raids/:raidId
   * Get raid details
   */
  static async getRaidDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { raidId } = req.params;

      const raid = await RaidService.getRaidById(new mongoose.Types.ObjectId(raidId));
      if (!raid) {
        res.status(404).json({ success: false, error: 'Raid not found' });
        return;
      }

      res.json({ success: true, data: raid });
    } catch (error) {
      logger.error('Error getting raid details:', error);
      res.status(500).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/raids/summary
   * Get gang raids summary
   */
  static async getGangRaidsSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { characterId } = req.query;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId as string,
        res
      );
      if (!character) return;

      // Get gang
      const membership = await verifyGangMembership(characterId as string, res);
      if (!membership) return;

      const summary = await RaidService.getGangRaidsSummary(membership.gang._id);

      res.json({ success: true, data: summary });
    } catch (error) {
      logger.error('Error getting raids summary:', error);
      res.status(500).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * GET /api/raids/properties/:propertyId/defense
   * Get property defense details
   */
  static async getPropertyDefense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const defense = await RaidService.getPropertyDefense(
        new mongoose.Types.ObjectId(propertyId)
      );

      res.json({ success: true, data: defense });
    } catch (error) {
      logger.error('Error getting property defense:', error);
      res.status(500).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * POST /api/raids/properties/:propertyId/guards
   * Hire a guard for a property
   */
  static async hireGuard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const { characterId, guardName, skillTier } = req.body;

      if (!characterId || !guardName || !skillTier) {
        res.status(400).json({
          success: false,
          error: 'characterId, guardName, and skillTier are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      // Validate skill tier
      if (!Object.values(GuardSkillTier).includes(skillTier as GuardSkillTier)) {
        res.status(400).json({ success: false, error: 'Invalid guard skill tier' });
        return;
      }

      const property = await RaidService.hireGuard(
        new mongoose.Types.ObjectId(propertyId),
        new mongoose.Types.ObjectId(characterId),
        guardName,
        skillTier as GuardSkillTier
      );

      res.status(201).json({ success: true, data: property });
    } catch (error) {
      logger.error('Error hiring guard:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * DELETE /api/raids/properties/:propertyId/guards/:guardId
   * Fire a guard from a property
   */
  static async fireGuard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId, guardId } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({ success: false, error: 'characterId is required' });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      const property = await RaidService.fireGuard(
        new mongoose.Types.ObjectId(propertyId),
        new mongoose.Types.ObjectId(characterId),
        guardId
      );

      res.json({ success: true, data: property });
    } catch (error) {
      logger.error('Error firing guard:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }

  /**
   * PUT /api/raids/properties/:propertyId/insurance
   * Set property insurance level
   */
  static async setInsurance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const { characterId, level } = req.body;

      if (!characterId || level === undefined) {
        res.status(400).json({
          success: false,
          error: 'characterId and level are required',
        });
        return;
      }

      // Verify character ownership
      const character = await verifyCharacterOwnership(
        req.user!._id.toString(),
        characterId,
        res
      );
      if (!character) return;

      // Validate insurance level
      if (!Object.values(InsuranceLevel).includes(level as InsuranceLevel)) {
        res.status(400).json({ success: false, error: 'Invalid insurance level' });
        return;
      }

      const property = await RaidService.setInsurance(
        new mongoose.Types.ObjectId(propertyId),
        new mongoose.Types.ObjectId(characterId),
        level as InsuranceLevel
      );

      res.json({ success: true, data: property });
    } catch (error) {
      logger.error('Error setting insurance:', error);
      res.status(400).json({ success: false, error: sanitizeErrorMessage(error) });
    }
  }
}
