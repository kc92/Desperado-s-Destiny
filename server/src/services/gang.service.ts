/**
 * Gang Service
 *
 * Handles all gang operations with transaction safety
 */

import mongoose from 'mongoose';
import { Gang, IGang } from '../models/Gang.model';
import { GangBankTransaction, IGangBankTransaction } from '../models/GangBankTransaction.model';
import { GangInvitation, IGangInvitation } from '../models/GangInvitation.model';
import { Character, ICharacter } from '../models/Character.model';
import {
  GangRole,
  GangUpgradeType,
  GangBankTransactionType,
  GANG_CREATION,
  GangSearchFilters,
} from '@desperados/shared';
import { TransactionSource } from '../models/GoldTransaction.model';
import { calculateUpgradeCost, canUpgrade, getUpgradeBenefit } from '../utils/gangUpgrades';
import logger from '../utils/logger';
import karmaService from './karma.service';
import { AppError } from '../utils/errors';
import { GangBankingService } from './gangBanking.service';
import { isSuccess } from '../types/serviceResult';

export class GangService {
  /**
   * Create a new gang
   * Requires Level 10 + 2000 gold
   *
   * @param userId - User ID (for authentication)
   * @param characterId - Character creating the gang
   * @param name - Gang name
   * @param tag - Gang tag
   * @returns Created gang
   */
  static async createGang(
    userId: string,
    characterId: string,
    name: string,
    tag: string
  ): Promise<IGang> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (character.userId.toString() !== userId) {
        throw new Error('Character does not belong to this user');
      }

      // Total Level requirement (sum of all skill levels)
      const totalLevel = character.totalLevel || 30;
      if (totalLevel < GANG_CREATION.MIN_TOTAL_LEVEL) {
        throw new AppError(`Requires Total Level ${GANG_CREATION.MIN_TOTAL_LEVEL}+ to create a gang (current: ${totalLevel})`, 400);
      }

      if (character.dollars < GANG_CREATION.COST) {
        // PRODUCTION FIX: Use AppError to preserve user-facing message through sanitization
        throw new AppError(`Insufficient dollars. Need ${GANG_CREATION.COST}, have ${character.dollars}`, 400);
      }

      const existingGang = await Gang.findOne({
        'members.characterId': new mongoose.Types.ObjectId(characterId),
        isActive: true,
      }).session(session);
      if (existingGang) {
        throw new AppError('Character is already in a gang', 400);
      }

      const nameTaken = await Gang.isNameTaken(name);
      if (nameTaken) {
        throw new AppError('Gang name is already taken', 400);
      }

      const tagTaken = await Gang.isTagTaken(tag);
      if (tagTaken) {
        throw new AppError('Gang tag is already taken', 400);
      }

      const { DollarService } = await import('./dollar.service');
      await DollarService.deductDollars(
        characterId,
        GANG_CREATION.COST,
        TransactionSource.GANG_CREATION,
        { gangName: name, gangTag: tag },
        session
      );

      const gang = await Gang.create([{
        name,
        tag: tag.toUpperCase(),
        leaderId: character._id,
        members: [{
          characterId: character._id,
          role: GangRole.LEADER,
          joinedAt: new Date(),
          contribution: GANG_CREATION.COST,
        }],
        bank: 0,
        level: 1,
        perks: {
          xpBonus: 5,
          goldBonus: 0,
          energyBonus: 0,
        },
        upgrades: {
          vaultSize: 0,
          memberSlots: 0,
          warChest: 0,
          perkBooster: 0,
        },
        territories: [],
        stats: {
          totalWins: 0,
          totalLosses: 0,
          territoriesConquered: 0,
          totalRevenue: 0,
        },
        isActive: true,
      }], { session });

      character.gangId = gang[0]._id as mongoose.Types.ObjectId;
      await character.save({ session });

      // Initialize gang economy
      const { GangEconomyService } = await import('./gangEconomy.service');
      await GangEconomyService.initializeEconomy(gang[0]._id.toString(), gang[0].name);

      await session.commitTransaction();

      logger.info(
        `Gang created: ${name} [${tag}] by character ${character.name} (${characterId})`
      );

      return gang[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error creating gang:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Join a gang (via invitation)
   *
   * @param gangId - Gang to join
   * @param characterId - Character joining
   * @param invitationId - Invitation ID
   * @returns Updated gang
   */
  static async joinGang(
    gangId: string,
    characterId: string,
    invitationId: string
  ): Promise<IGang> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (character.gangId) {
        throw new Error('Character is already in a gang');
      }

      const invitation = await GangInvitation.findById(invitationId).session(session);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.gangId.toString() !== gangId) {
        throw new Error('Invitation is for a different gang');
      }

      if (invitation.recipientId.toString() !== characterId) {
        throw new Error('Invitation is for a different character');
      }

      if (!invitation.isPending()) {
        throw new Error('Invitation is not pending');
      }

      // ATOMIC OPERATION: Add member only if gang has capacity
      // This prevents race conditions where multiple concurrent join requests
      // could both pass the capacity check before either save completes
      const maxMembers = gang.getMaxMembers();
      const gangUpdateResult = await Gang.findOneAndUpdate(
        {
          _id: gangId,
          // Atomic condition: only update if members array length is less than max
          $expr: { $lt: [{ $size: '$members' }, maxMembers] }
        },
        {
          $push: {
            members: {
              characterId: character._id,
              role: GangRole.MEMBER,
              joinedAt: new Date(),
              contribution: 0
            }
          }
        },
        {
          new: true,
          session
        }
      );

      if (!gangUpdateResult) {
        throw new Error('Gang is at maximum capacity');
      }

      invitation.accept();
      await invitation.save({ session });

      character.gangId = gangUpdateResult._id as mongoose.Types.ObjectId;
      await character.save({ session });

      await session.commitTransaction();

      logger.info(
        `Character ${character.name} joined gang ${gangUpdateResult.name}`
      );

      return gangUpdateResult;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error joining gang:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Leave a gang
   *
   * @param gangId - Gang to leave
   * @param characterId - Character leaving
   */
  static async leaveGang(gangId: string, characterId: string): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (gang.isLeader(characterId)) {
        throw new Error('Leader must transfer leadership before leaving');
      }

      gang.removeMember(characterId);

      if (gang.members.length === 0) {
        gang.isActive = false;
      }

      await gang.save({ session });

      character.gangId = null;
      await character.save({ session });

      await session.commitTransaction();

      logger.info(
        `Character ${character.name} left gang ${gang.name}`
      );
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error leaving gang:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Kick a member from gang
   *
   * @param gangId - Gang ID
   * @param kickerId - Character kicking (must be officer+)
   * @param targetId - Character to kick
   * @returns Updated gang
   */
  static async kickMember(
    gangId: string,
    kickerId: string,
    targetId: string
  ): Promise<IGang> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isOfficer(kickerId)) {
        throw new Error('Only officers and leaders can kick members');
      }

      if (gang.isLeader(targetId)) {
        throw new Error('Cannot kick the leader');
      }

      if (gang.isOfficer(targetId) && !gang.isLeader(kickerId)) {
        throw new Error('Only the leader can kick officers');
      }

      const targetCharacter = await Character.findById(targetId).session(session);
      if (!targetCharacter) {
        throw new Error('Target character not found');
      }

      gang.removeMember(targetId);
      await gang.save({ session });

      targetCharacter.gangId = null;
      await targetCharacter.save({ session });

      await session.commitTransaction();

      // DEITY SYSTEM: Record karma for kicking a gang member
      // This is seen as betrayal by deities
      try {
        await karmaService.recordAction(
          kickerId,
          'GANG_BETRAYED_MEMBER',
          `Kicked ${targetCharacter.name} from gang ${gang.name}`
        );
        logger.debug(`Karma recorded for kick: GANG_BETRAYED_MEMBER for ${kickerId}`);
      } catch (karmaError) {
        logger.warn('Failed to record karma for kicking member:', karmaError);
      }

      logger.info(
        `Character ${targetId} was kicked from gang ${gang.name}`
      );

      return gang;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error kicking member:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Promote or demote a member
   *
   * @param gangId - Gang ID
   * @param promoterId - Character promoting (must be leader)
   * @param targetId - Character to promote
   * @param newRole - New role
   * @returns Updated gang
   */
  static async promoteMember(
    gangId: string,
    promoterId: string,
    targetId: string,
    newRole: GangRole
  ): Promise<IGang> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(promoterId)) {
        throw new Error('Only the leader can promote members');
      }

      if (promoterId === targetId && newRole !== GangRole.LEADER) {
        throw new Error('Leader cannot demote themselves');
      }

      gang.promoteMember(targetId, newRole);
      await gang.save({ session });

      await session.commitTransaction();

      logger.info(
        `Character ${targetId} promoted to ${newRole} in gang ${gang.name}`
      );

      return gang;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error promoting member:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Deposit gold to gang bank
   * REFACTOR: Delegates to GangBankingService for implementation
   *
   * @param gangId - Gang ID
   * @param characterId - Character depositing
   * @param amount - Amount to deposit
   * @returns Updated gang and transaction record
   */
  static async depositToBank(
    gangId: string,
    characterId: string,
    amount: number
  ): Promise<{ gang: IGang; transaction: IGangBankTransaction }> {
    const result = await GangBankingService.deposit(gangId, characterId, amount);

    if (!isSuccess(result)) {
      throw new Error(result.error?.message || 'Failed to deposit to gang bank');
    }

    return {
      gang: result.data.gang,
      transaction: result.data.transaction,
    };
  }

  /**
   * Withdraw gold from gang bank
   * REFACTOR: Delegates to GangBankingService for implementation
   *
   * @param gangId - Gang ID
   * @param characterId - Character withdrawing (must be officer+)
   * @param amount - Amount to withdraw
   * @returns Updated gang and transaction record
   */
  static async withdrawFromBank(
    gangId: string,
    characterId: string,
    amount: number
  ): Promise<{ gang: IGang; transaction: IGangBankTransaction }> {
    const result = await GangBankingService.withdraw(gangId, characterId, amount);

    if (!isSuccess(result)) {
      throw new Error(result.error?.message || 'Failed to withdraw from gang bank');
    }

    return {
      gang: result.data.gang,
      transaction: result.data.transaction,
    };
  }

  /**
   * Purchase an upgrade
   *
   * @param gangId - Gang ID
   * @param characterId - Character purchasing (must be leader)
   * @param upgradeType - Type of upgrade
   * @returns Updated gang
   */
  static async purchaseUpgrade(
    gangId: string,
    characterId: string,
    upgradeType: GangUpgradeType
  ): Promise<IGang> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can purchase upgrades');
      }

      const currentLevel = gang.upgrades[upgradeType];

      if (!canUpgrade(upgradeType, currentLevel)) {
        throw new Error(`Upgrade ${upgradeType} is already at maximum level`);
      }

      const cost = calculateUpgradeCost(upgradeType, currentLevel);

      // ATOMIC OPERATION: Deduct from gang bank and update upgrade level atomically
      const updateKey = `upgrades.${upgradeType}`;
      const updateResult = await Gang.findOneAndUpdate(
        {
          _id: gangId,
          bank: { $gte: cost },  // Atomic check: must have enough funds
          [updateKey]: currentLevel  // Ensure upgrade level hasn't changed
        },
        {
          $inc: { bank: -cost },
          $set: { [updateKey]: currentLevel + 1 }
        },
        {
          new: true,
          session
        }
      );

      if (!updateResult) {
        // Re-check to provide accurate error message
        const currentGang = await Gang.findById(gangId).session(session);
        if (currentGang && currentGang.upgrades[upgradeType] !== currentLevel) {
          throw new Error('Upgrade level has changed. Please try again.');
        }
        throw new Error(`Insufficient gang bank funds. Have ${currentGang?.bank || 0}, need ${cost}`);
      }

      const balanceAfter = updateResult.bank;
      const balanceBefore = balanceAfter + cost;

      await GangBankTransaction.create([{
        gangId: gang._id,
        characterId,
        type: GangBankTransactionType.UPGRADE_PURCHASE,
        amount: -cost,
        balanceBefore,
        balanceAfter,
        metadata: {
          upgradeType,
          upgradeLevel: currentLevel + 1,
        },
        timestamp: new Date(),
      }], { session });

      await session.commitTransaction();

      logger.info(
        `Gang ${gang.name} purchased ${upgradeType} upgrade level ${currentLevel + 1} for ${cost} dollars`
      );

      return gang;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error purchasing upgrade:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Disband a gang
   * Distributes bank gold equally to all members
   *
   * @param gangId - Gang ID
   * @param characterId - Character disbanding (must be leader)
   */
  static async disbandGang(gangId: string, characterId: string): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the leader can disband the gang');
      }

      const memberCount = gang.members.length;
      const distributionAmount = memberCount > 0 ? Math.floor(gang.bank / memberCount) : 0;

      if (distributionAmount > 0) {
        for (const member of gang.members) {
          const { DollarService: DollarServiceDisband } = await import('./dollar.service');
          await DollarServiceDisband.addDollars(
            member.characterId,
            distributionAmount,
            TransactionSource.GANG_DISBAND_REFUND,
            { gangId: gang._id, gangName: gang.name },
            session
          );

          await GangBankTransaction.create([{
            gangId: gang._id,
            characterId: member.characterId,
            type: GangBankTransactionType.DISBAND_DISTRIBUTION,
            amount: distributionAmount,
            balanceBefore: gang.bank,
            balanceAfter: gang.bank - distributionAmount,
            timestamp: new Date(),
          }], { session });

          const character = await Character.findById(member.characterId).session(session);
          if (character) {
            character.gangId = null;
            await character.save({ session });
          }
        }
      } else {
        for (const member of gang.members) {
          const character = await Character.findById(member.characterId).session(session);
          if (character) {
            character.gangId = null;
            await character.save({ session });
          }
        }
      }

      gang.bank = 0;
      gang.isActive = false;
      await gang.save({ session });

      await session.commitTransaction();

      logger.info(
        `Gang ${gang.name} disbanded. Distributed ${distributionAmount} dollars to each of ${memberCount} members`
      );
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error disbanding gang:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang transaction history
   *
   * @param gangId - Gang ID
   * @param limit - Maximum transactions to return
   * @param offset - Number of transactions to skip
   * @returns Transactions and total count
   */
  static async getGangTransactions(
    gangId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ transactions: IGangBankTransaction[]; total: number }> {
    const transactions = await GangBankTransaction.find({ gangId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .populate('characterId', 'name')
      .lean() as unknown as IGangBankTransaction[];

    const total = await GangBankTransaction.countDocuments({ gangId });

    return { transactions, total };
  }

  /**
   * Get gangs by filters (for browsing/search)
   *
   * @param filters - Search filters
   * @returns Gangs and total count
   */
  static async getGangsByFilters(
    filters: GangSearchFilters
  ): Promise<{ gangs: IGang[]; total: number }> {
    const {
      sortBy = 'level',
      sortOrder = 'desc',
      search,
      minLevel,
      maxLevel,
      hasSlots,
      limit = 50,
      offset = 0,
    } = filters;

    const query: Record<string, unknown> = { isActive: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { tag: new RegExp(search, 'i') },
      ];
    }

    if (minLevel !== undefined) {
      query.level = { ...query.level as Record<string, unknown>, $gte: minLevel };
    }

    if (maxLevel !== undefined) {
      query.level = { ...query.level as Record<string, unknown>, $lte: maxLevel };
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    let gangsQuery = Gang.find(query).sort(sort).skip(offset).limit(limit);

    if (hasSlots) {
      gangsQuery = gangsQuery.where('members.length').lt(15);
    }

    const gangs = await gangsQuery.populate('leaderId', 'name').lean() as unknown as IGang[];
    const total = await Gang.countDocuments(query);

    return { gangs, total };
  }

  /**
   * Get gang statistics
   *
   * @param gangId - Gang ID
   * @returns Gang statistics
   */
  static async getGangStats(gangId: string): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalUpgradeSpending: number;
    netDollars: number;
    topContributors: Array<{ characterId: string; characterName: string; contribution: number }>;
  }> {
    // Use aggregation pipeline to get all stats in a single query
    const gangObjectId = new mongoose.Types.ObjectId(gangId);

    // Get transaction stats using aggregation
    const transactionStats = await GangBankTransaction.aggregate([
      { $match: { gangId: gangObjectId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get gang with member data using aggregation
    const gangStats = await Gang.aggregate([
      { $match: { _id: gangObjectId } },
      { $unwind: '$members' },
      {
        $lookup: {
          from: 'characters',
          localField: 'members.characterId',
          foreignField: '_id',
          as: 'memberData'
        }
      },
      { $unwind: '$memberData' },
      {
        $group: {
          _id: '$_id',
          members: {
            $push: {
              characterId: '$members.characterId',
              characterName: '$memberData.name',
              contribution: '$members.contribution'
            }
          }
        }
      }
    ]);

    if (!gangStats || gangStats.length === 0) {
      throw new Error('Gang not found');
    }

    // Process transaction stats
    const statsMap = new Map(transactionStats.map(s => [s._id, s.total]));
    const totalDeposits = statsMap.get(GangBankTransactionType.DEPOSIT) || 0;
    const totalWithdrawals = Math.abs(statsMap.get(GangBankTransactionType.WITHDRAWAL) || 0);
    const totalUpgradeSpending = Math.abs(statsMap.get(GangBankTransactionType.UPGRADE_PURCHASE) || 0);

    // Process top contributors
    const topContributors = gangStats[0].members
      .map((m: { characterId: mongoose.Types.ObjectId; characterName: string; contribution: number }) => ({
        characterId: m.characterId.toString(),
        characterName: m.characterName,
        contribution: m.contribution,
      }))
      .sort((a: { contribution: number }, b: { contribution: number }) => b.contribution - a.contribution)
      .slice(0, 10);

    return {
      totalDeposits,
      totalWithdrawals,
      totalUpgradeSpending,
      netDollars: totalDeposits - totalWithdrawals - totalUpgradeSpending,
      topContributors,
    };
  }

  /**
   * Send gang invitation
   *
   * @param gangId - Gang ID
   * @param inviterId - Character sending invitation (must be officer+)
   * @param recipientId - Character receiving invitation
   * @returns Created invitation
   */
  static async sendInvitation(
    gangId: string,
    inviterId: string,
    recipientId: string
  ): Promise<IGangInvitation> {
    const gang = await Gang.findById(gangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    if (!gang.isOfficer(inviterId)) {
      throw new Error('Only officers and leaders can send invitations');
    }

    const inviter = await Character.findById(inviterId);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    const recipient = await Character.findById(recipientId);
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    if (recipient.gangId) {
      throw new Error('Recipient is already in a gang');
    }

    const hasPending = await GangInvitation.hasPendingInvitation(gang._id as mongoose.Types.ObjectId, recipient._id as mongoose.Types.ObjectId);
    if (hasPending) {
      throw new Error('Pending invitation already exists for this character');
    }

    // Re-fetch gang to get current member count before creating invitation
    // This provides a more accurate capacity check, though the atomic check
    // in joinGang() is the final authority when the invitation is accepted
    const currentGang = await Gang.findById(gangId);
    if (!currentGang) {
      throw new Error('Gang not found');
    }

    if (currentGang.members.length >= currentGang.getMaxMembers()) {
      throw new Error('Gang is at maximum capacity');
    }

    const invitation = await GangInvitation.create({
      gangId: currentGang._id,
      gangName: currentGang.name,
      inviterId: inviter._id,
      inviterName: inviter.name,
      recipientId: recipient._id,
      recipientName: recipient.name,
    });

    logger.info(
      `Gang invitation sent from ${currentGang.name} to character ${recipient.name}`
    );

    return invitation;
  }

  // ==========================================================================
  // TRAINING GROUNDS - Passive Training Time Reduction
  // ==========================================================================

  /**
   * Get training time reduction bonus from gang Training Grounds upgrade
   * Used by skill.service.ts to calculate passive training time
   *
   * @param gangId - Gang ID (or null if character has no gang)
   * @returns Reduction as decimal (0.05 = 5%, 0.10 = 10%, 0.15 = 15%)
   */
  static async getTrainingFacilityBonus(gangId: string | null): Promise<number> {
    if (!gangId) {
      return 0;
    }

    try {
      const gang = await Gang.findById(gangId);
      if (!gang || !gang.isActive) {
        return 0;
      }

      const trainingLevel = gang.upgrades?.trainingGrounds || 0;
      if (trainingLevel === 0) {
        return 0;
      }

      // getUpgradeBenefit returns 0.05 * level (5% per level)
      const bonus = getUpgradeBenefit(GangUpgradeType.TRAINING_GROUNDS, trainingLevel);

      logger.debug(`Gang ${gang.name} Training Grounds L${trainingLevel} = ${bonus * 100}% reduction`);

      return bonus;
    } catch (error) {
      logger.error('Error getting training facility bonus:', error);
      return 0;
    }
  }

  /**
   * Get training time reduction for a character by their character ID
   * Convenience method that looks up the character's gang first
   *
   * @param characterId - Character ID
   * @returns Reduction as decimal
   */
  static async getTrainingFacilityBonusByCharacter(characterId: string): Promise<number> {
    try {
      const character = await Character.findById(characterId);
      if (!character || !character.gangId) {
        return 0;
      }

      return this.getTrainingFacilityBonus(character.gangId.toString());
    } catch (error) {
      logger.error('Error getting training facility bonus by character:', error);
      return 0;
    }
  }
}
