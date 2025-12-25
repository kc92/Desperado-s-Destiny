/**
 * Gang Controller
 *
 * Handles HTTP requests for gang operations
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GangService } from '../services/gang.service';
import { Gang } from '../models/Gang.model';
import { GangInvitation } from '../models/GangInvitation.model';
import { Character, ICharacter } from '../models/Character.model';
import { GangRole, GangUpgradeType, GangSearchFilters } from '@desperados/shared';
import { AuthRequest } from '../middleware/auth.middleware';
import { isValidUpgradeType } from '../utils/gangUpgrades';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';

/**
 * C4 SECURITY FIX: Helper to verify character ownership
 * Prevents IDOR attacks where attacker uses another user's characterId
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

export class GangController {
  /**
   * POST /api/gangs/create
   * Create a new gang
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { characterId, name, tag } = req.body;

      if (!characterId || !name || !tag) {
        res.status(400).json({
          success: false,
          error: 'characterId, name, and tag are required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const gang = await GangService.createGang(userId, characterId, name, tag);

      res.status(201).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error in create gang:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gangs
   * List gangs with filters
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const filters: GangSearchFilters = {
        sortBy: req.query.sortBy as 'level' | 'members' | 'territories' | 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        search: req.query.search as string,
        minLevel: req.query.minLevel ? parseInt(req.query.minLevel as string) : undefined,
        maxLevel: req.query.maxLevel ? parseInt(req.query.maxLevel as string) : undefined,
        hasSlots: req.query.hasSlots === 'true',
        limit: Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50)),
        offset: Math.max(0, parseInt(req.query.offset as string) || 0),
      };

      const { gangs, total } = await GangService.getGangsByFilters(filters);

      res.status(200).json({
        success: true,
        data: {
          gangs: gangs.map(g => ({
            _id: g._id,
            name: g.name,
            tag: g.tag,
            level: g.level,
            memberCount: g.members.length,
            territoriesCount: g.territories.length,
            createdAt: g.createdAt,
          })),
          pagination: {
            total,
            limit: filters.limit,
            offset: filters.offset,
          },
        },
      });
    } catch (error) {
      logger.error('Error listing gangs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list gangs',
      });
    }
  }

  /**
   * GET /api/gangs/:id
   * Get gang by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const gang = await Gang.findById(id).populate('members.characterId', 'name level');
      if (!gang) {
        res.status(404).json({ success: false, error: 'Gang not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error getting gang:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get gang',
      });
    }
  }

  /**
   * POST /api/gangs/:id/join
   * Join a gang via invitation
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async join(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId, invitationId } = req.body;

      if (!characterId || !invitationId) {
        res.status(400).json({
          success: false,
          error: 'characterId and invitationId are required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const gang = await GangService.joinGang(id, characterId, invitationId);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error joining gang:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/:id/leave
   * Leave a gang
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async leave(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      await GangService.leaveGang(id, characterId);

      res.status(200).json({
        success: true,
        message: 'Successfully left gang',
      });
    } catch (error) {
      logger.error('Error leaving gang:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * DELETE /api/gangs/:id/members/:characterId
   * Kick a member
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async kick(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id, characterId: targetId } = req.params;
      const { kickerId } = req.body;

      if (!kickerId) {
        res.status(400).json({
          success: false,
          error: 'kickerId is required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), kickerId, res);
      if (!character) return;

      const gang = await GangService.kickMember(id, kickerId, targetId);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error kicking member:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * PATCH /api/gangs/:id/members/:characterId/promote
   * Promote or demote a member
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async promote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id, characterId: targetId } = req.params;
      const { promoterId, newRole } = req.body;

      if (!promoterId || !newRole) {
        res.status(400).json({
          success: false,
          error: 'promoterId and newRole are required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), promoterId, res);
      if (!character) return;

      if (!Object.values(GangRole).includes(newRole)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role',
        });
        return;
      }

      const gang = await GangService.promoteMember(id, promoterId, targetId, newRole);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error promoting member:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/:id/bank/deposit
   * Deposit gold to gang bank
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async depositBank(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId, amount } = req.body;

      if (!characterId || amount === undefined) {
        res.status(400).json({
          success: false,
          error: 'characterId and amount are required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
        return;
      }

      const { gang, transaction } = await GangService.depositToBank(id, characterId, amount);

      res.status(200).json({
        success: true,
        data: {
          gang: gang.toSafeObject(),
          transaction,
        },
      });
    } catch (error) {
      logger.error('Error depositing to bank:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/:id/bank/withdraw
   * Withdraw gold from gang bank
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async withdrawBank(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId, amount } = req.body;

      if (!characterId || amount === undefined) {
        res.status(400).json({
          success: false,
          error: 'characterId and amount are required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be positive',
        });
        return;
      }

      const { gang, transaction } = await GangService.withdrawFromBank(id, characterId, amount);

      res.status(200).json({
        success: true,
        data: {
          gang: gang.toSafeObject(),
          transaction,
        },
      });
    } catch (error) {
      logger.error('Error withdrawing from bank:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/:id/upgrades/:upgradeType
   * Purchase an upgrade
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async purchaseUpgrade(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id, upgradeType } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      if (!isValidUpgradeType(upgradeType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid upgrade type',
        });
        return;
      }

      const gang = await GangService.purchaseUpgrade(id, characterId, upgradeType as GangUpgradeType);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error purchasing upgrade:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * DELETE /api/gangs/:id
   * Disband gang
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async disband(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      await GangService.disbandGang(id, characterId);

      res.status(200).json({
        success: true,
        message: 'Gang disbanded successfully',
      });
    } catch (error) {
      logger.error('Error disbanding gang:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gangs/:id/transactions
   * Get gang bank transaction history
   */
  static async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const { transactions, total } = await GangService.getGangTransactions(id, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            total,
            limit,
            offset,
          },
        },
      });
    } catch (error) {
      logger.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transactions',
      });
    }
  }

  /**
   * GET /api/gangs/:id/stats
   * Get gang statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await GangService.getGangStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting gang stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get gang statistics',
      });
    }
  }

  /**
   * POST /api/gangs/:id/invitations
   * Send gang invitation
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async sendInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { inviterId, recipientId } = req.body;

      if (!inviterId || !recipientId) {
        res.status(400).json({
          success: false,
          error: 'inviterId and recipientId are required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), inviterId, res);
      if (!character) return;

      const invitation = await GangService.sendInvitation(id, inviterId, recipientId);

      res.status(201).json({
        success: true,
        data: invitation,
      });
    } catch (error) {
      logger.error('Error sending invitation:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gangs/invitations/:characterId
   * Get invitations for a character
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async getInvitations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { characterId } = req.params;

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const invitations = await GangInvitation.findPendingByRecipient(character._id as mongoose.Types.ObjectId);

      res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      logger.error('Error getting invitations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get invitations',
      });
    }
  }

  /**
   * POST /api/gangs/invitations/:id/accept
   * Accept gang invitation
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async acceptInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const invitation = await GangInvitation.findById(id);
      if (!invitation) {
        res.status(404).json({ success: false, error: 'Invitation not found' });
        return;
      }

      if (invitation.recipientId.toString() !== characterId) {
        res.status(403).json({ success: false, error: 'Invitation is for a different character' });
        return;
      }

      const gang = await GangService.joinGang(
        invitation.gangId.toString(),
        characterId,
        id
      );

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error accepting invitation:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/invitations/:id/reject
   * Reject gang invitation
   * C4 SECURITY FIX: Verifies character ownership
   */
  static async rejectInvitation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { characterId } = req.body;

      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required',
        });
        return;
      }

      // C4 SECURITY FIX: Verify character ownership
      const character = await verifyCharacterOwnership(userId.toString(), characterId, res);
      if (!character) return;

      const invitation = await GangInvitation.findById(id);
      if (!invitation) {
        res.status(404).json({ success: false, error: 'Invitation not found' });
        return;
      }

      if (invitation.recipientId.toString() !== characterId) {
        res.status(403).json({ success: false, error: 'Invitation is for a different character' });
        return;
      }

      invitation.reject();
      await invitation.save();

      res.status(200).json({
        success: true,
        message: 'Invitation rejected',
      });
    } catch (error) {
      logger.error('Error rejecting invitation:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  // ==========================================
  // NEW ENDPOINTS FOR CLIENT COMPATIBILITY
  // ==========================================

  /**
   * GET /api/gangs/current
   * Get the current user's gang
   */
  static async getCurrentGang(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Get user's active character
      const character = await Character.findOne({ userId, isActive: true });
      if (!character) {
        res.status(404).json({ success: false, error: 'No active character found' });
        return;
      }

      if (!character.gangId) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'Character is not in a gang',
        });
        return;
      }

      const gang = await Gang.findById(character.gangId).populate('members.characterId', 'name level');
      if (!gang) {
        res.status(404).json({ success: false, error: 'Gang not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
      });
    } catch (error) {
      logger.error('Error getting current gang:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get current gang',
      });
    }
  }

  /**
   * GET /api/gangs/check-name
   * Check if a gang name is available
   */
  static async checkNameAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query;

      if (!name || typeof name !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Name query parameter is required',
        });
        return;
      }

      const exists = await Gang.exists({ name: { $regex: new RegExp(`^${name}$`, 'i') }, isActive: true });

      res.status(200).json({
        success: true,
        data: {
          name,
          available: !exists,
        },
      });
    } catch (error) {
      logger.error('Error checking name availability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check name availability',
      });
    }
  }

  /**
   * GET /api/gangs/check-tag
   * Check if a gang tag is available
   */
  static async checkTagAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { tag } = req.query;

      if (!tag || typeof tag !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Tag query parameter is required',
        });
        return;
      }

      const exists = await Gang.exists({ tag: { $regex: new RegExp(`^${tag}$`, 'i') }, isActive: true });

      res.status(200).json({
        success: true,
        data: {
          tag,
          available: !exists,
        },
      });
    } catch (error) {
      logger.error('Error checking tag availability:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check tag availability',
      });
    }
  }

  /**
   * GET /api/gangs/search-characters
   * Search for characters to invite to gang
   */
  static async searchCharacters(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string' || q.length < 2) {
        res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters',
        });
        return;
      }

      // Find characters without a gang that match the search
      const characters = await Character.find({
        name: { $regex: q, $options: 'i' },
        gangId: { $exists: false },
        isActive: true,
      })
        .select('name level faction')
        .limit(20)
        .lean();

      res.status(200).json({
        success: true,
        data: characters,
      });
    } catch (error) {
      logger.error('Error searching characters:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search characters',
      });
    }
  }

  /**
   * POST /api/gangs/leave
   * Leave current gang (without specifying gangId in URL)
   */
  static async leaveCurrentGang(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Get user's active character
      const character = await Character.findOne({ userId, isActive: true });
      if (!character) {
        res.status(404).json({ success: false, error: 'No active character found' });
        return;
      }

      if (!character.gangId) {
        res.status(400).json({
          success: false,
          error: 'Character is not in a gang',
        });
        return;
      }

      await GangService.leaveGang(character.gangId.toString(), character._id.toString());

      res.status(200).json({
        success: true,
        message: 'Successfully left gang',
      });
    } catch (error) {
      logger.error('Error leaving gang:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * GET /api/gangs/invitations/pending
   * Get pending invitations for the current user's character
   */
  static async getPendingInvitations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      // Get user's active character
      const character = await Character.findOne({ userId, isActive: true });
      if (!character) {
        res.status(404).json({ success: false, error: 'No active character found' });
        return;
      }

      const invitations = await GangInvitation.findPendingByRecipient(character._id as mongoose.Types.ObjectId);

      res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      logger.error('Error getting pending invitations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pending invitations',
      });
    }
  }

  /**
   * POST /api/gangs/:id/kick
   * Alternative kick endpoint that accepts characterId in body (for client compatibility)
   */
  static async kickAlt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id: gangId } = req.params;
      const { characterId: targetId } = req.body;

      if (!targetId) {
        res.status(400).json({
          success: false,
          error: 'characterId is required in body',
        });
        return;
      }

      // Get user's active character as the kicker
      const character = await Character.findOne({ userId, isActive: true });
      if (!character) {
        res.status(404).json({ success: false, error: 'No active character found' });
        return;
      }

      const gang = await GangService.kickMember(gangId, character._id.toString(), targetId);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
        message: 'Member kicked successfully',
      });
    } catch (error) {
      logger.error('Error kicking member:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/:id/promote
   * Alternative promote endpoint that accepts characterId in body (for client compatibility)
   */
  static async promoteAlt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id: gangId } = req.params;
      const { characterId: targetId, role: newRole } = req.body;

      if (!targetId || !newRole) {
        res.status(400).json({
          success: false,
          error: 'characterId and role are required in body',
        });
        return;
      }

      // Get user's active character as the promoter
      const character = await Character.findOne({ userId, isActive: true });
      if (!character) {
        res.status(404).json({ success: false, error: 'No active character found' });
        return;
      }

      if (!Object.values(GangRole).includes(newRole)) {
        res.status(400).json({
          success: false,
          error: 'Invalid role',
        });
        return;
      }

      const gang = await GangService.promoteMember(gangId, character._id.toString(), targetId, newRole);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
        message: 'Member role updated successfully',
      });
    } catch (error) {
      logger.error('Error promoting member:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }

  /**
   * POST /api/gangs/:id/upgrades/purchase
   * Alternative upgrade purchase endpoint that accepts upgradeType in body
   */
  static async purchaseUpgradeAlt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const { id: gangId } = req.params;
      const { upgradeType } = req.body;

      if (!upgradeType) {
        res.status(400).json({
          success: false,
          error: 'upgradeType is required in body',
        });
        return;
      }

      // Get user's active character
      const character = await Character.findOne({ userId, isActive: true });
      if (!character) {
        res.status(404).json({ success: false, error: 'No active character found' });
        return;
      }

      if (!isValidUpgradeType(upgradeType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid upgrade type',
        });
        return;
      }

      const gang = await GangService.purchaseUpgrade(gangId, character._id.toString(), upgradeType);

      res.status(200).json({
        success: true,
        data: gang.toSafeObject(),
        message: 'Upgrade purchased successfully',
      });
    } catch (error) {
      logger.error('Error purchasing upgrade:', error);
      res.status(400).json({
        success: false,
        error: sanitizeErrorMessage(error),
      });
    }
  }
}
