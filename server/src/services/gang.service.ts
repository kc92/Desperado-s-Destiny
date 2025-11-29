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
import { calculateUpgradeCost, canUpgrade } from '../utils/gangUpgrades';
import logger from '../utils/logger';

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

      if (character.level < GANG_CREATION.MIN_LEVEL) {
        throw new Error(`Character must be level ${GANG_CREATION.MIN_LEVEL} or higher to create a gang`);
      }

      if (character.gold < GANG_CREATION.COST) {
        throw new Error(`Insufficient gold. Need ${GANG_CREATION.COST}, have ${character.gold}`);
      }

      const existingGang = await Gang.findOne({
        'members.characterId': new mongoose.Types.ObjectId(characterId),
        isActive: true,
      }).session(session);
      if (existingGang) {
        throw new Error('Character is already in a gang');
      }

      const nameTaken = await Gang.isNameTaken(name);
      if (nameTaken) {
        throw new Error('Gang name is already taken');
      }

      const tagTaken = await Gang.isTagTaken(tag);
      if (tagTaken) {
        throw new Error('Gang tag is already taken');
      }

      const { GoldService } = await import('./gold.service');
      await GoldService.deductGold(
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

      if (gang.members.length >= gang.getMaxMembers()) {
        throw new Error('Gang is at maximum capacity');
      }

      gang.addMember(character._id as mongoose.Types.ObjectId, GangRole.MEMBER);
      await gang.save({ session });

      invitation.accept();
      await invitation.save({ session });

      character.gangId = gang._id as mongoose.Types.ObjectId;
      await character.save({ session });

      await session.commitTransaction();

      logger.info(
        `Character ${character.name} joined gang ${gang.name}`
      );

      return gang;
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
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isMember(characterId)) {
        throw new Error('Character is not a member of this gang');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const { GoldService } = await import('./gold.service');
      await GoldService.deductGold(
        characterId,
        amount,
        TransactionSource.GANG_DEPOSIT,
        { gangId: gang._id, gangName: gang.name },
        session
      );

      const balanceBefore = gang.bank;
      gang.bank += amount;
      gang.stats.totalRevenue += amount;
      const balanceAfter = gang.bank;

      const member = gang.members.find(m => m.characterId.toString() === characterId);
      if (member) {
        member.contribution += amount;
      }

      await gang.save({ session });

      const transaction = await GangBankTransaction.create([{
        gangId: gang._id,
        characterId: character._id,
        type: GangBankTransactionType.DEPOSIT,
        amount,
        balanceBefore,
        balanceAfter,
        timestamp: new Date(),
      }], { session });

      await session.commitTransaction();

      logger.info(
        `Character ${character.name} deposited ${amount} gold to gang ${gang.name} bank`
      );

      return {
        gang,
        transaction: transaction[0],
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error depositing to gang bank:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Withdraw gold from gang bank
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
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(gangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      if (!gang.isOfficer(characterId)) {
        throw new Error('Only officers and leaders can withdraw from gang bank');
      }

      if (!gang.canAfford(amount)) {
        throw new Error(`Insufficient gang bank funds. Have ${gang.bank}, need ${amount}`);
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const balanceBefore = gang.bank;
      gang.bank -= amount;
      const balanceAfter = gang.bank;

      await gang.save({ session });

      const { GoldService: GoldServiceWithdraw } = await import('./gold.service');
      await GoldServiceWithdraw.addGold(
        characterId,
        amount,
        TransactionSource.GANG_WITHDRAWAL,
        { gangId: gang._id, gangName: gang.name },
        session
      );

      const transaction = await GangBankTransaction.create([{
        gangId: gang._id,
        characterId: character._id,
        type: GangBankTransactionType.WITHDRAWAL,
        amount: -amount,
        balanceBefore,
        balanceAfter,
        timestamp: new Date(),
      }], { session });

      await session.commitTransaction();

      logger.info(
        `Character ${character.name} withdrew ${amount} gold from gang ${gang.name} bank`
      );

      return {
        gang,
        transaction: transaction[0],
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error withdrawing from gang bank:', error);
      throw error;
    } finally {
      session.endSession();
    }
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

      if (!gang.canAfford(cost)) {
        throw new Error(`Insufficient gang bank funds. Have ${gang.bank}, need ${cost}`);
      }

      const balanceBefore = gang.bank;
      gang.bank -= cost;
      gang.upgrades[upgradeType] = currentLevel + 1;
      const balanceAfter = gang.bank;

      await gang.save({ session });

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
        `Gang ${gang.name} purchased ${upgradeType} upgrade level ${currentLevel + 1} for ${cost} gold`
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
          const { GoldService: GoldServiceDisband } = await import('./gold.service');
          await GoldServiceDisband.addGold(
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
        `Gang ${gang.name} disbanded. Distributed ${distributionAmount} gold to each of ${memberCount} members`
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
    netGold: number;
    topContributors: Array<{ characterId: string; characterName: string; contribution: number }>;
  }> {
    const gang = await Gang.findById(gangId).populate('members.characterId', 'name');
    if (!gang) {
      throw new Error('Gang not found');
    }

    const transactions = await GangBankTransaction.find({ gangId }).lean();

    const totalDeposits = transactions
      .filter(t => t.type === GangBankTransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = Math.abs(
      transactions
        .filter(t => t.type === GangBankTransactionType.WITHDRAWAL)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const totalUpgradeSpending = Math.abs(
      transactions
        .filter(t => t.type === GangBankTransactionType.UPGRADE_PURCHASE)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const topContributors = gang.members
      .map(m => ({
        characterId: m.characterId.toString(),
        characterName: (m.characterId as unknown as ICharacter).name,
        contribution: m.contribution,
      }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 10);

    return {
      totalDeposits,
      totalWithdrawals,
      totalUpgradeSpending,
      netGold: totalDeposits - totalWithdrawals - totalUpgradeSpending,
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

    if (gang.members.length >= gang.getMaxMembers()) {
      throw new Error('Gang is at maximum capacity');
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

    const invitation = await GangInvitation.create({
      gangId: gang._id,
      gangName: gang.name,
      inviterId: inviter._id,
      inviterName: inviter.name,
      recipientId: recipient._id,
      recipientName: recipient.name,
    });

    logger.info(
      `Gang invitation sent from ${gang.name} to character ${recipient.name}`
    );

    return invitation;
  }
}
