/**
 * Raid Service
 *
 * Handles gang-vs-gang and gang-vs-property raids
 * Phase 2.3 - Full Raid System
 */

import mongoose, { ClientSession } from 'mongoose';
import { Raid, IRaid } from '../models/Raid.model';
import { Gang, IGang } from '../models/Gang.model';
import { Property, IProperty } from '../models/Property.model';
import { Character } from '../models/Character.model';
import { TerritoryZone } from '../models/TerritoryZone.model';
import { GangWar } from '../models/GangWar.model';
import { Notification, NotificationType } from '../models/Notification.model';
import {
  RaidTargetType,
  RaidStatus,
  RaidOutcome,
  RaidParticipantRole,
  IRaidResult,
  IRaidParticipant,
  IRaidDTO,
  IRaidTargetPreview,
  IPropertyGuard,
  GuardSkillTier,
  InsuranceLevel,
  IPropertyDefenseDTO,
  IGangRaidsSummary,
  RAID_TIMING,
  RAID_PARTICIPANTS,
  RAID_BASE_SUCCESS_RATE,
  RAID_DAMAGE_RANGES,
  RAID_WAR_BONUSES,
  RAID_PLANNING_COST,
  GUARD_TIERS,
  INSURANCE_TIERS,
  RAID_XP_PER_OUTCOME,
  RAID_OUTCOME_MULTIPLIERS,
  RAID_OUTCOME_THRESHOLDS,
  PROPERTY_DEFENSE,
  COUNTER_ATTACK,
  RAID_CONTRIBUTION_POINTS,
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { v4 as uuidv4 } from 'uuid';
import * as raidSocketHandlers from '../sockets/raidHandlers';
import { WarContributionService } from './warContribution.service';
import { WarContributionType } from '@desperados/shared';
import { TransactionSource } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';

export class RaidService {
  /**
   * Plan a new raid
   */
  static async planRaid(
    attackingGangId: mongoose.Types.ObjectId,
    leaderId: mongoose.Types.ObjectId,
    targetType: RaidTargetType,
    targetId: mongoose.Types.ObjectId
  ): Promise<IRaid> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Get attacking gang
      const attackingGang = await Gang.findById(attackingGangId).session(session);
      if (!attackingGang) {
        throw new Error('Attacking gang not found');
      }

      // Get leader
      const leader = await Character.findById(leaderId).session(session);
      if (!leader) {
        throw new Error('Leader character not found');
      }

      // Validate leader is in gang
      if (!attackingGang.isMember(leaderId)) {
        throw new Error('Leader must be a member of the attacking gang');
      }

      // Validate target
      const validation = await this.validateTarget(attackingGangId, targetType, targetId);
      if (!validation.valid) {
        throw new Error(validation.reason || 'Invalid target');
      }

      // Get target info
      const targetInfo = await this.getTargetInfo(targetType, targetId);

      // Check if gang can afford planning cost
      const planningCost = RAID_PLANNING_COST[targetType];
      if (!attackingGang.canAfford(planningCost)) {
        throw new Error(`Insufficient funds. Need ${planningCost} gold to plan raid.`);
      }

      // Deduct planning cost
      attackingGang.bank -= planningCost;
      await attackingGang.save({ session });

      // Create raid
      const raid = new Raid({
        attackingGangId,
        attackingGangName: attackingGang.name,
        defendingGangId: targetInfo.defendingGangId,
        defendingGangName: targetInfo.defendingGangName,
        targetType,
        targetId,
        targetName: targetInfo.targetName,
        zoneId: targetInfo.zoneId,
        status: RaidStatus.PLANNING,
        plannedAt: new Date(),
        leaderId,
        leaderName: leader.name,
        participants: [{
          characterId: leaderId.toString(),
          characterName: leader.name,
          role: RaidParticipantRole.LEADER,
          contribution: 0,
          joinedAt: new Date(),
        }],
        isWarRaid: await this.checkIfWarRaid(attackingGangId, targetInfo.defendingGangId),
      });

      await raid.save({ session });
      await session.commitTransaction();

      logger.info(`Raid planned by ${attackingGang.name} against ${targetInfo.targetName}`);

      // Emit socket event for real-time update
      try {
        await raidSocketHandlers.emitRaidPlanned(attackingGangId, {
          raidId: raid._id.toString(),
          attackingGangId: raid.attackingGangId.toString(),
          attackingGangName: raid.attackingGangName,
          targetType: raid.targetType,
          targetId: raid.targetId.toString(),
          targetName: raid.targetName,
          zoneId: raid.zoneId,
          status: raid.status,
          plannedAt: raid.plannedAt,
          leaderId: raid.leaderId.toString(),
          leaderName: raid.leaderName,
          participants: raid.participants,
          isWarRaid: raid.isWarRaid,
        });
      } catch (socketError) {
        logger.warn('Failed to emit raid:planned socket event:', socketError);
      }

      return raid;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error planning raid:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Join an existing raid
   */
  static async joinRaid(
    raidId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    role: Exclude<RaidParticipantRole, 'leader'>
  ): Promise<IRaid> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const raid = await Raid.findById(raidId).session(session);
      if (!raid) {
        throw new Error('Raid not found');
      }

      if (!raid.canJoin()) {
        throw new Error('Cannot join raid in current status');
      }

      // Check max participants
      if (raid.participants.length >= RAID_PARTICIPANTS.MAX_PARTICIPANTS) {
        throw new Error('Maximum participants reached');
      }

      // Check if already a participant
      if (raid.isParticipant(characterId.toString())) {
        throw new Error('Already a participant in this raid');
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Verify character is in attacking gang
      const gang = await Gang.findById(raid.attackingGangId).session(session);
      if (!gang || !gang.isMember(characterId)) {
        throw new Error('Character must be a member of the attacking gang');
      }

      // Add participant
      raid.participants.push({
        characterId: characterId.toString(),
        characterName: character.name,
        role,
        contribution: 0,
        joinedAt: new Date(),
      });

      await raid.save({ session });
      await session.commitTransaction();

      logger.info(`${character.name} joined raid ${raidId} as ${role}`);

      // Emit socket event
      try {
        await raidSocketHandlers.emitRaidJoined(
          raid.attackingGangId,
          {
            raidId: raid._id.toString(),
            attackingGangId: raid.attackingGangId.toString(),
            attackingGangName: raid.attackingGangName,
            targetType: raid.targetType,
            targetId: raid.targetId.toString(),
            targetName: raid.targetName,
            zoneId: raid.zoneId,
            status: raid.status,
            plannedAt: raid.plannedAt,
            leaderId: raid.leaderId.toString(),
            leaderName: raid.leaderName,
            participants: raid.participants,
            isWarRaid: raid.isWarRaid,
          },
          characterId.toString(),
          character.name
        );
      } catch (socketError) {
        logger.warn('Failed to emit raid:joined socket event:', socketError);
      }

      return raid;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error joining raid:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Schedule raid execution time
   */
  static async scheduleRaid(
    raidId: mongoose.Types.ObjectId,
    scheduledFor: Date,
    leaderId: mongoose.Types.ObjectId
  ): Promise<IRaid> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const raid = await Raid.findById(raidId).session(session);
      if (!raid) {
        throw new Error('Raid not found');
      }

      // Verify leader
      if (raid.leaderId.toString() !== leaderId.toString()) {
        throw new Error('Only the raid leader can schedule');
      }

      if (raid.status !== RaidStatus.PLANNING) {
        throw new Error('Raid must be in planning status to schedule');
      }

      // Validate scheduling time
      const now = new Date();
      const minTime = new Date(now.getTime() + RAID_TIMING.MIN_PLANNING_TIME_MS);
      const maxTime = new Date(now.getTime() + RAID_TIMING.MAX_PLANNING_TIME_MS);

      if (scheduledFor < minTime) {
        throw new Error(`Raid must be scheduled at least 30 minutes in advance`);
      }

      if (scheduledFor > maxTime) {
        throw new Error(`Raid must be scheduled within 24 hours`);
      }

      raid.status = RaidStatus.SCHEDULED;
      raid.scheduledFor = scheduledFor;

      await raid.save({ session });

      // Send notification to defenders if they exist
      if (raid.defendingGangId) {
        await this.sendRaidNotifications(raid, 'scheduled', session);
      }

      await session.commitTransaction();

      logger.info(`Raid ${raidId} scheduled for ${scheduledFor.toISOString()}`);

      // Emit socket event
      try {
        await raidSocketHandlers.emitRaidScheduled(
          raid.attackingGangId,
          raid.defendingGangId,
          {
            raidId: raid._id.toString(),
            attackingGangId: raid.attackingGangId.toString(),
            attackingGangName: raid.attackingGangName,
            defendingGangId: raid.defendingGangId?.toString(),
            defendingGangName: raid.defendingGangName,
            targetType: raid.targetType,
            targetId: raid.targetId.toString(),
            targetName: raid.targetName,
            zoneId: raid.zoneId,
            status: raid.status,
            plannedAt: raid.plannedAt,
            scheduledFor: raid.scheduledFor,
            leaderId: raid.leaderId.toString(),
            leaderName: raid.leaderName,
            participants: raid.participants,
            isWarRaid: raid.isWarRaid,
          }
        );
      } catch (socketError) {
        logger.warn('Failed to emit raid:scheduled socket event:', socketError);
      }

      return raid;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error scheduling raid:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute a raid
   */
  static async executeRaid(raidId: mongoose.Types.ObjectId): Promise<IRaidResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const raid = await Raid.findById(raidId).session(session);
      if (!raid) {
        throw new Error('Raid not found');
      }

      if (raid.status !== RaidStatus.SCHEDULED) {
        throw new Error('Raid must be scheduled to execute');
      }

      // Update status
      raid.status = RaidStatus.IN_PROGRESS;
      raid.startedAt = new Date();

      // Calculate powers
      raid.attackPower = await this.calculateAttackPower(raid.participants, session);
      raid.defensePower = await this.calculateDefensePower(raid.targetType, raid.targetId, session);

      // Apply war bonuses
      if (raid.isWarRaid) {
        raid.attackPower *= (1 + RAID_WAR_BONUSES.ATTACKER_DAMAGE_BONUS);
        raid.defensePower *= (1 - RAID_WAR_BONUSES.DEFENDER_DEFENSE_PENALTY);
      }

      // Roll for success
      raid.successRoll = SecureRNG.range(0, 100);

      // Calculate effective success rate
      const baseSuccessRate = RAID_BASE_SUCCESS_RATE[raid.targetType];
      const powerDifference = (raid.attackPower - raid.defensePower) / Math.max(raid.defensePower, 1);
      const effectiveSuccessRate = Math.max(0.1, Math.min(0.95, baseSuccessRate + (powerDifference * 0.2)));
      const adjustedRoll = raid.successRoll * effectiveSuccessRate * 100;

      // Determine outcome
      const outcome = this.determineOutcome(adjustedRoll);

      // Apply damage based on outcome
      const result = await this.applyRaidDamage(raid, outcome, session);

      // Update raid with result
      raid.result = result;
      raid.completedAt = new Date();
      raid.status = outcome === RaidOutcome.FAILURE || outcome === RaidOutcome.CRITICAL_FAILURE
        ? RaidStatus.FAILED
        : result.damageDealt > 0
          ? RaidStatus.COMPLETED
          : RaidStatus.DEFENDED;

      // Award contribution points
      await this.awardContributionPoints(raid, session);

      await raid.save({ session });

      // Update target immunity
      await this.setTargetImmunity(raid.targetType, raid.targetId, session);

      // Send notifications
      await this.sendRaidNotifications(raid, 'completed', session);

      await session.commitTransaction();

      logger.info(`Raid ${raidId} completed with outcome: ${outcome}`);

      // Emit socket event for raid completion
      try {
        await raidSocketHandlers.emitRaidCompleted(
          raid.attackingGangId,
          raid.defendingGangId,
          {
            raidId: raid._id.toString(),
            attackingGangId: raid.attackingGangId.toString(),
            attackingGangName: raid.attackingGangName,
            defendingGangId: raid.defendingGangId?.toString(),
            defendingGangName: raid.defendingGangName,
            targetType: raid.targetType,
            targetId: raid.targetId.toString(),
            targetName: raid.targetName,
            zoneId: raid.zoneId,
            status: raid.status,
            plannedAt: raid.plannedAt,
            startedAt: raid.startedAt,
            completedAt: raid.completedAt,
            leaderId: raid.leaderId.toString(),
            leaderName: raid.leaderName,
            participants: raid.participants,
            attackPower: raid.attackPower,
            defensePower: raid.defensePower,
            isWarRaid: raid.isWarRaid,
            result: raid.result,
          }
        );
      } catch (socketError) {
        logger.warn('Failed to emit raid:completed socket event:', socketError);
      }

      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error executing raid:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel a raid
   */
  static async cancelRaid(
    raidId: mongoose.Types.ObjectId,
    cancelledBy: mongoose.Types.ObjectId
  ): Promise<IRaid> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const raid = await Raid.findById(raidId).session(session);
      if (!raid) {
        throw new Error('Raid not found');
      }

      if (!raid.canCancel()) {
        throw new Error('Raid cannot be cancelled in current status');
      }

      // Verify canceller is leader or gang leader
      const gang = await Gang.findById(raid.attackingGangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const isRaidLeader = raid.leaderId.toString() === cancelledBy.toString();
      const isGangLeader = gang.isLeader(cancelledBy);

      if (!isRaidLeader && !isGangLeader) {
        throw new Error('Only raid leader or gang leader can cancel');
      }

      raid.status = RaidStatus.CANCELLED;
      raid.completedAt = new Date();

      await raid.save({ session });
      await session.commitTransaction();

      logger.info(`Raid ${raidId} cancelled`);

      // Emit socket event
      try {
        await raidSocketHandlers.emitRaidCancelled(
          raid.attackingGangId,
          raid.defendingGangId,
          {
            raidId: raid._id.toString(),
            attackingGangId: raid.attackingGangId.toString(),
            attackingGangName: raid.attackingGangName,
            defendingGangId: raid.defendingGangId?.toString(),
            defendingGangName: raid.defendingGangName,
            targetType: raid.targetType,
            targetId: raid.targetId.toString(),
            targetName: raid.targetName,
            zoneId: raid.zoneId,
            status: raid.status,
            plannedAt: raid.plannedAt,
            scheduledFor: raid.scheduledFor,
            leaderId: raid.leaderId.toString(),
            leaderName: raid.leaderName,
            participants: raid.participants,
            isWarRaid: raid.isWarRaid,
          }
        );
      } catch (socketError) {
        logger.warn('Failed to emit raid:cancelled socket event:', socketError);
      }

      return raid;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error cancelling raid:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Calculate attack power from participants
   */
  static async calculateAttackPower(
    participants: IRaidParticipant[],
    session?: ClientSession
  ): Promise<number> {
    let totalPower = 0;

    for (const participant of participants) {
      const character = await Character.findById(participant.characterId).session(session || null);
      if (character) {
        // Base power from character stats (combat + cunning for tactical ability)
        const combatPower = (character.stats?.combat || 10) +
                           (character.stats?.cunning || 10) +
                           (character.level * 2);

        // Role multipliers
        const roleMultiplier = participant.role === RaidParticipantRole.LEADER
          ? 1.5
          : participant.role === RaidParticipantRole.SCOUT
            ? 0.8
            : 1.0;

        totalPower += combatPower * roleMultiplier;
      }
    }

    // Participant count bonus
    const participantBonus = 1 + (participants.length - 1) * RAID_PARTICIPANTS.PARTICIPANT_POWER_BONUS;
    totalPower *= participantBonus;

    return Math.floor(totalPower);
  }

  /**
   * Calculate defense power for a target
   */
  static async calculateDefensePower(
    targetType: RaidTargetType,
    targetId: mongoose.Types.ObjectId,
    session?: ClientSession
  ): Promise<number> {
    let defensePower = 0;

    switch (targetType) {
      case RaidTargetType.PROPERTY: {
        const property = await Property.findById(targetId).session(session || null);
        if (property) {
          defensePower = property.calculateDefenseLevel();
          // Debug logging to verify guards are being counted
          logger.debug(
            `[Raid] Property defense calculation: propertyId=${targetId}, ` +
            `guards=${property.guards?.length || 0}, defenseLevel=${defensePower}`
          );
        }
        break;
      }
      case RaidTargetType.TREASURY:
      case RaidTargetType.TERRITORY_INFLUENCE: {
        const gang = await Gang.findById(targetId).session(session || null);
        if (gang) {
          // Gang-level defense from level and members
          defensePower = gang.level * 10 + gang.members.length * 5;
        }
        break;
      }
      case RaidTargetType.PRODUCTION: {
        const property = await Property.findById(targetId).session(session || null);
        if (property) {
          const baseDefense = property.calculateDefenseLevel();
          const workerBonus = property.workers.filter(w => w.isActive).length * 3;
          defensePower = baseDefense + workerBonus;
          // Debug logging to verify guards and workers are being counted
          logger.debug(
            `[Raid] Production defense calculation: propertyId=${targetId}, ` +
            `guards=${property.guards?.length || 0}, workers=${property.workers?.length || 0}, ` +
            `baseDefense=${baseDefense}, workerBonus=${workerBonus}, totalDefense=${defensePower}`
          );
        }
        break;
      }
    }

    return Math.max(defensePower, 10); // Minimum defense of 10
  }

  /**
   * Determine raid outcome from roll
   */
  static determineOutcome(adjustedRoll: number): RaidOutcome {
    if (adjustedRoll >= RAID_OUTCOME_THRESHOLDS.CRITICAL_SUCCESS) {
      return RaidOutcome.CRITICAL_SUCCESS;
    } else if (adjustedRoll >= RAID_OUTCOME_THRESHOLDS.SUCCESS) {
      return RaidOutcome.SUCCESS;
    } else if (adjustedRoll >= RAID_OUTCOME_THRESHOLDS.PARTIAL_SUCCESS) {
      return RaidOutcome.PARTIAL_SUCCESS;
    } else if (adjustedRoll >= RAID_OUTCOME_THRESHOLDS.FAILURE) {
      return RaidOutcome.FAILURE;
    } else {
      return RaidOutcome.CRITICAL_FAILURE;
    }
  }

  /**
   * Apply raid damage based on outcome
   */
  static async applyRaidDamage(
    raid: IRaid,
    outcome: RaidOutcome,
    session: ClientSession
  ): Promise<IRaidResult> {
    const multiplier = RAID_OUTCOME_MULTIPLIERS[outcome];
    const damageConfig = RAID_DAMAGE_RANGES[raid.targetType];

    const result: IRaidResult = {
      outcome,
      damageDealt: 0,
      xpAwarded: RAID_XP_PER_OUTCOME[outcome],
      goldAwarded: 0,
    };

    if (multiplier === 0) {
      // Handle failure/critical failure
      if (outcome === RaidOutcome.CRITICAL_FAILURE && SecureRNG.chance(COUNTER_ATTACK.CHANCE)) {
        // Counter-attack damages attacker
        const gang = await Gang.findById(raid.attackingGangId).session(session);
        if (gang) {
          const counterDamage = SecureRNG.range(
            Math.floor(gang.bank * COUNTER_ATTACK.GOLD_LOSS_RANGE[0]),
            Math.floor(gang.bank * COUNTER_ATTACK.GOLD_LOSS_RANGE[1])
          );
          gang.bank = Math.max(0, gang.bank - counterDamage);
          await gang.save({ session });
          result.goldAwarded = -counterDamage;
        }
      }
      return result;
    }

    switch (raid.targetType) {
      case RaidTargetType.PROPERTY: {
        const property = await Property.findById(raid.targetId).session(session);
        if (property && damageConfig.storage && damageConfig.condition) {
          // Storage damage
          const storageDamagePercent = SecureRNG.float(damageConfig.storage[0], damageConfig.storage[1]) * multiplier;
          const itemsToRemove = Math.floor(property.storage.currentUsage * storageDamagePercent);

          // Remove items proportionally
          let removedGoldValue = 0;
          for (const item of property.storage.items) {
            const removeQty = Math.floor(item.quantity * storageDamagePercent);
            if (removeQty > 0) {
              property.withdrawItem(item.itemId, removeQty);
              removedGoldValue += removeQty * 10; // Estimate 10g per item
            }
          }

          // Condition damage
          const conditionDamage = Math.floor(
            SecureRNG.float(damageConfig.condition[0], damageConfig.condition[1]) * multiplier
          );
          property.condition = Math.max(0, property.condition - conditionDamage);

          // Record raid in history
          property.addRaidToHistory({
            raidId: raid._id.toString(),
            attackingGangId: raid.attackingGangId.toString(),
            attackingGangName: raid.attackingGangName,
            outcome,
            damageReceived: conditionDamage,
            date: new Date(),
          });
          property.lastRaidAt = new Date();

          await property.save({ session });

          result.storageLostPercent = storageDamagePercent;
          result.conditionDamage = conditionDamage;
          result.goldAwarded = removedGoldValue;
          result.damageDealt = conditionDamage;

          // Handle insurance
          if (property.insuranceLevel !== InsuranceLevel.NONE && property.insurancePaidUntil && property.insurancePaidUntil > new Date()) {
            const recovery = INSURANCE_TIERS[property.insuranceLevel].recovery;
            result.insuranceRecovery = Math.floor(removedGoldValue * recovery);
          }
        }
        break;
      }

      case RaidTargetType.TREASURY: {
        const gang = await Gang.findById(raid.targetId).session(session);
        if (gang && damageConfig.gold) {
          const goldStealPercent = SecureRNG.float(damageConfig.gold[0], damageConfig.gold[1]) * multiplier;
          const goldStolen = Math.floor(gang.bank * goldStealPercent);

          gang.bank = Math.max(0, gang.bank - goldStolen);
          await gang.save({ session });

          // Add to attacking gang
          const attackingGang = await Gang.findById(raid.attackingGangId).session(session);
          if (attackingGang) {
            attackingGang.bank += goldStolen;
            await attackingGang.save({ session });
          }

          result.goldStolen = goldStolen;
          result.goldAwarded = goldStolen;
          result.damageDealt = goldStolen;
        }
        break;
      }

      case RaidTargetType.TERRITORY_INFLUENCE: {
        if (damageConfig.influence) {
          const influenceLoss = Math.floor(
            SecureRNG.float(damageConfig.influence[0], damageConfig.influence[1]) * multiplier
          );

          // Find zone and remove influence
          const zone = await TerritoryZone.findOne({ zoneId: raid.zoneId }).session(session);
          if (zone && raid.defendingGangId) {
            zone.removeInfluence(raid.defendingGangId, influenceLoss);
            await zone.save({ session });
          }

          result.influenceLost = influenceLoss;
          result.damageDealt = influenceLoss;
        }
        break;
      }

      case RaidTargetType.PRODUCTION: {
        const property = await Property.findById(raid.targetId).session(session);
        if (property && damageConfig.haltHours) {
          const haltHours = Math.floor(
            SecureRNG.float(damageConfig.haltHours[0], damageConfig.haltHours[1]) * multiplier
          );

          // Halt production by delaying completion times
          for (const slot of property.productionSlots) {
            if (slot.isActive && slot.completesAt) {
              slot.completesAt = new Date(slot.completesAt.getTime() + haltHours * 60 * 60 * 1000);
            }
          }

          await property.save({ session });

          result.productionHaltHours = haltHours;
          result.damageDealt = haltHours;
        }
        break;
      }
    }

    return result;
  }

  /**
   * Award contribution points to participants
   */
  static async awardContributionPoints(raid: IRaid, session: ClientSession): Promise<void> {
    const isSuccess = raid.result?.outcome === RaidOutcome.SUCCESS ||
                     raid.result?.outcome === RaidOutcome.CRITICAL_SUCCESS ||
                     raid.result?.outcome === RaidOutcome.PARTIAL_SUCCESS;

    // Find warId if this is a war raid
    let warId: mongoose.Types.ObjectId | undefined;
    if (raid.isWarRaid && raid.defendingGangId) {
      const activeWar = await GangWar.findOne({
        $or: [
          { attackingGangId: raid.attackingGangId, defendingGangId: raid.defendingGangId, status: 'ACTIVE' },
          { attackingGangId: raid.defendingGangId, defendingGangId: raid.attackingGangId, status: 'ACTIVE' },
        ],
      }).session(session);
      if (activeWar) {
        warId = activeWar._id as mongoose.Types.ObjectId;
      }
    }

    for (const participant of raid.participants) {
      let points = 0;

      if (isSuccess) {
        switch (participant.role) {
          case RaidParticipantRole.LEADER:
            points = RAID_CONTRIBUTION_POINTS.LEADER_SUCCESS;
            break;
          case RaidParticipantRole.ATTACKER:
            points = RAID_CONTRIBUTION_POINTS.ATTACKER_SUCCESS;
            break;
          case RaidParticipantRole.SCOUT:
            points = RAID_CONTRIBUTION_POINTS.SCOUT_SUCCESS;
            break;
        }
        if (raid.result?.outcome === RaidOutcome.CRITICAL_SUCCESS) {
          points += RAID_CONTRIBUTION_POINTS.CRITICAL_SUCCESS_BONUS;
        }
      } else {
        switch (participant.role) {
          case RaidParticipantRole.LEADER:
            points = RAID_CONTRIBUTION_POINTS.LEADER_FAILURE;
            break;
          case RaidParticipantRole.ATTACKER:
            points = RAID_CONTRIBUTION_POINTS.ATTACKER_FAILURE;
            break;
          case RaidParticipantRole.SCOUT:
            points = RAID_CONTRIBUTION_POINTS.SCOUT_FAILURE;
            break;
        }
      }

      participant.contribution = points;

      // Record war contribution if this is a war raid
      if (warId) {
        const contributionType = participant.role === RaidParticipantRole.LEADER
          ? WarContributionType.RAID_LED
          : WarContributionType.RAID_PARTICIPATED;

        await WarContributionService.recordContribution(
          warId,
          raid.attackingGangId,
          new mongoose.Types.ObjectId(participant.characterId),
          contributionType,
          undefined,
          {
            raidId: raid._id.toString(),
            targetType: raid.targetType,
            targetName: raid.targetName,
            outcome: raid.result?.outcome,
            raidPoints: points
          }
        );
      }
    }

    // If this is a war raid and it was defended, record defender contribution
    if (warId && raid.defendingGangId && raid.status === RaidStatus.DEFENDED) {
      // Award RAID_DEFENDED to the defending gang leader
      const defendingGang = await Gang.findById(raid.defendingGangId).session(session);
      if (defendingGang) {
        await WarContributionService.recordContribution(
          warId,
          raid.defendingGangId,
          defendingGang.leaderId,
          WarContributionType.RAID_DEFENDED,
          undefined,
          {
            raidId: raid._id.toString(),
            targetType: raid.targetType,
            targetName: raid.targetName,
            outcome: raid.result?.outcome
          }
        );
      }
    }
  }

  /**
   * Set target immunity after raid
   */
  static async setTargetImmunity(
    targetType: RaidTargetType,
    targetId: mongoose.Types.ObjectId,
    session: ClientSession
  ): Promise<void> {
    const immunityUntil = new Date(Date.now() + RAID_TIMING.RAID_IMMUNITY_AFTER_RAID_MS);

    if (targetType === RaidTargetType.PROPERTY || targetType === RaidTargetType.PRODUCTION) {
      const property = await Property.findById(targetId).session(session);
      if (property) {
        property.raidImmunityUntil = immunityUntil;
        await property.save({ session });
      }
    }
  }

  /**
   * Validate target
   */
  static async validateTarget(
    attackingGangId: mongoose.Types.ObjectId,
    targetType: RaidTargetType,
    targetId: mongoose.Types.ObjectId
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check cooldown
    const recentRaid = await Raid.findRecentRaidsOnTarget(
      attackingGangId,
      targetId,
      RAID_TIMING.COOLDOWN_PER_TARGET_MS
    );
    if (recentRaid) {
      return { valid: false, reason: 'Target on cooldown from recent raid' };
    }

    // Check immunity
    if (targetType === RaidTargetType.PROPERTY || targetType === RaidTargetType.PRODUCTION) {
      const property = await Property.findById(targetId);
      if (!property) {
        return { valid: false, reason: 'Property not found' };
      }
      if (property.isRaidImmune()) {
        return { valid: false, reason: 'Property has raid immunity' };
      }
      // Cannot raid own gang's properties
      const gang = await Gang.findById(attackingGangId);
      if (gang && property.ownerId) {
        if (gang.isMember(property.ownerId)) {
          return { valid: false, reason: 'Cannot raid your own gang member\'s property' };
        }
      }
    }

    if (targetType === RaidTargetType.TREASURY) {
      const targetGang = await Gang.findById(targetId);
      if (!targetGang) {
        return { valid: false, reason: 'Target gang not found' };
      }
      if (targetGang._id.toString() === attackingGangId.toString()) {
        return { valid: false, reason: 'Cannot raid own gang treasury' };
      }
    }

    return { valid: true };
  }

  /**
   * Get target info for raid
   */
  static async getTargetInfo(
    targetType: RaidTargetType,
    targetId: mongoose.Types.ObjectId
  ): Promise<{
    targetName: string;
    zoneId: string;
    defendingGangId?: mongoose.Types.ObjectId;
    defendingGangName?: string;
  }> {
    switch (targetType) {
      case RaidTargetType.PROPERTY:
      case RaidTargetType.PRODUCTION: {
        const property = await Property.findById(targetId);
        if (!property) throw new Error('Property not found');

        // Find owner's gang
        let defendingGangId: mongoose.Types.ObjectId | undefined;
        let defendingGangName: string | undefined;

        if (property.ownerId) {
          const gang = await Gang.findOne({ 'members.characterId': property.ownerId });
          if (gang) {
            defendingGangId = gang._id as mongoose.Types.ObjectId;
            defendingGangName = gang.name;
          }
        }

        return {
          targetName: property.name,
          zoneId: property.locationId,
          defendingGangId,
          defendingGangName,
        };
      }
      case RaidTargetType.TREASURY: {
        const gang = await Gang.findById(targetId);
        if (!gang) throw new Error('Gang not found');
        return {
          targetName: `${gang.name} Treasury`,
          zoneId: gang.territories[0] || 'unknown',
          defendingGangId: gang._id as mongoose.Types.ObjectId,
          defendingGangName: gang.name,
        };
      }
      case RaidTargetType.TERRITORY_INFLUENCE: {
        const zone = await TerritoryZone.findById(targetId);
        if (!zone) throw new Error('Zone not found');

        // Find controlling gang
        const gangInfluences = zone.influence || [];
        const sortedInfluences = [...gangInfluences].sort((a, b) => b.influence - a.influence);
        const topInfluence = sortedInfluences[0];

        let defendingGangId: mongoose.Types.ObjectId | undefined;
        let defendingGangName: string | undefined;

        if (topInfluence) {
          const gang = await Gang.findById(topInfluence.gangId);
          if (gang) {
            defendingGangId = gang._id as mongoose.Types.ObjectId;
            defendingGangName = gang.name;
          }
        }

        return {
          targetName: zone.name,
          zoneId: zone.id,
          defendingGangId,
          defendingGangName,
        };
      }
    }
  }

  /**
   * Check if raid is during active war
   */
  static async checkIfWarRaid(
    attackingGangId: mongoose.Types.ObjectId,
    defendingGangId?: mongoose.Types.ObjectId
  ): Promise<boolean> {
    if (!defendingGangId) return false;

    const activeWar = await GangWar.findOne({
      $or: [
        { attackingGangId, defendingGangId, status: 'ACTIVE' },
        { attackingGangId: defendingGangId, defendingGangId: attackingGangId, status: 'ACTIVE' },
      ],
    });

    return !!activeWar;
  }

  /**
   * Send raid notifications
   */
  static async sendRaidNotifications(
    raid: IRaid,
    phase: 'scheduled' | 'completed',
    session: ClientSession
  ): Promise<void> {
    if (phase === 'scheduled' && raid.defendingGangId) {
      // Notify defending gang members
      const defendingGang = await Gang.findById(raid.defendingGangId).session(session);
      if (defendingGang) {
        for (const member of defendingGang.members) {
          const notification = new Notification({
            characterId: member.characterId,
            type: NotificationType.RAID_INCOMING,
            title: 'Raid Incoming!',
            message: `${raid.attackingGangName} has scheduled a raid on ${raid.targetName}`,
            link: `/gang/raids/${raid._id}`,
          });
          await notification.save({ session });
        }
      }
    }

    if (phase === 'completed') {
      // Notify attackers
      for (const participant of raid.participants) {
        const notification = new Notification({
          characterId: new mongoose.Types.ObjectId(participant.characterId),
          type: NotificationType.RAID_COMPLETED,
          title: 'Raid Complete',
          message: `Raid on ${raid.targetName}: ${raid.result?.outcome}`,
          link: `/gang/raids/${raid._id}`,
        });
        await notification.save({ session });
      }

      // Notify defenders
      if (raid.defendingGangId) {
        const defendingGang = await Gang.findById(raid.defendingGangId).session(session);
        if (defendingGang) {
          const notificationType = raid.status === RaidStatus.DEFENDED
            ? NotificationType.RAID_DEFENDED
            : NotificationType.RAID_SUFFERED;

          for (const member of defendingGang.members) {
            const notification = new Notification({
              characterId: member.characterId,
              type: notificationType,
              title: raid.status === RaidStatus.DEFENDED ? 'Raid Defended!' : 'Property Raided!',
              message: `${raid.attackingGangName}'s raid on ${raid.targetName}: ${raid.result?.outcome}`,
              link: `/gang/raids/${raid._id}`,
            });
            await notification.save({ session });
          }
        }
      }
    }
  }

  /**
   * Get available raid targets
   */
  static async getAvailableTargets(
    gangId: mongoose.Types.ObjectId,
    targetType: RaidTargetType
  ): Promise<IRaidTargetPreview[]> {
    const targets: IRaidTargetPreview[] = [];

    switch (targetType) {
      case RaidTargetType.PROPERTY:
      case RaidTargetType.PRODUCTION: {
        // Get properties not owned by gang members
        const gang = await Gang.findById(gangId);
        if (!gang) break;

        const memberIds = gang.members.map(m => m.characterId);
        const properties = await Property.find({
          ownerId: { $nin: memberIds },
          status: 'active',
        }).limit(50);

        for (const property of properties) {
          const validation = await this.validateTarget(gangId, targetType, property._id);
          const defenseLevel = property.calculateDefenseLevel();

          targets.push({
            targetId: property._id.toString(),
            targetName: property.name,
            targetType,
            ownerName: 'Unknown',
            ownerId: property.ownerId?.toString() || '',
            zoneId: property.locationId,
            zoneName: property.locationId,
            estimatedDefensePower: defenseLevel,
            defenseLevel: defenseLevel < 25 ? 'low' : defenseLevel < 50 ? 'medium' : defenseLevel < 75 ? 'high' : 'fortress',
            isImmune: property.isRaidImmune(),
            immuneUntil: property.raidImmunityUntil,
            lastRaidedAt: property.lastRaidAt,
            canRaid: validation.valid,
            cannotRaidReason: validation.reason,
            potentialLoot: {
              goldMin: 50,
              goldMax: 500,
              hasStorage: property.storage.currentUsage > 0,
            },
          });
        }
        break;
      }

      case RaidTargetType.TREASURY: {
        // Get other gangs
        const gangs = await Gang.find({
          _id: { $ne: gangId },
        }).limit(30);

        for (const targetGang of gangs) {
          const targetGangId = targetGang._id as mongoose.Types.ObjectId;
          const validation = await this.validateTarget(gangId, targetType, targetGangId);
          const defensePower = targetGang.level * 10 + targetGang.members.length * 5;

          const gangZoneId = targetGang.territories[0] || 'unknown';
          targets.push({
            targetId: targetGang._id.toString(),
            targetName: `${targetGang.name} Treasury`,
            targetType,
            ownerName: targetGang.name,
            ownerId: targetGang._id.toString(),
            gangId: targetGang._id.toString(),
            gangName: targetGang.name,
            zoneId: gangZoneId,
            zoneName: gangZoneId !== 'unknown' ? gangZoneId : 'Unknown',
            estimatedDefensePower: defensePower,
            defenseLevel: defensePower < 50 ? 'low' : defensePower < 100 ? 'medium' : defensePower < 150 ? 'high' : 'fortress',
            isImmune: false,
            canRaid: validation.valid,
            cannotRaidReason: validation.reason,
            potentialLoot: {
              goldMin: Math.floor(targetGang.bank * 0.05),
              goldMax: Math.floor(targetGang.bank * 0.25),
              hasStorage: false,
            },
          });
        }
        break;
      }
    }

    return targets;
  }

  /**
   * Get property defense details
   */
  static async getPropertyDefense(propertyId: mongoose.Types.ObjectId): Promise<IPropertyDefenseDTO> {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    const isInsured = property.insuranceLevel !== InsuranceLevel.NONE &&
                     property.insurancePaidUntil !== undefined &&
                     property.insurancePaidUntil > new Date();

    return {
      propertyId: property._id.toString(),
      propertyName: property.name,
      defenseLevel: property.calculateDefenseLevel(),
      guards: property.guards,
      maxGuards: property.maxGuards,
      insuranceLevel: property.insuranceLevel,
      insurancePaidUntil: property.insurancePaidUntil,
      isInsured,
      weeklyInsuranceCost: INSURANCE_TIERS[property.insuranceLevel].weeklyPremium,
      lastRaidAt: property.lastRaidAt,
      raidImmunityUntil: property.raidImmunityUntil,
      isImmune: property.isRaidImmune(),
      raidHistory: property.raidHistory,
      upgradeDefenseBonus: property.upgrades.reduce((sum, u) => {
        if (u.upgradeType === 'security_system') return sum + u.level * PROPERTY_DEFENSE.SECURITY_UPGRADE_DEFENSE;
        if (u.upgradeType === 'bouncer') return sum + u.level * PROPERTY_DEFENSE.BOUNCER_UPGRADE_DEFENSE;
        return sum;
      }, 0),
    };
  }

  /**
   * Hire a guard for a property
   */
  static async hireGuard(
    propertyId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    guardName: string,
    skillTier: GuardSkillTier
  ): Promise<IProperty> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const property = await Property.findById(propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      // Verify owner
      if (property.ownerId?.toString() !== characterId.toString()) {
        throw new Error('Only the property owner can hire guards');
      }

      // Check slots
      if (property.guards.length >= property.maxGuards) {
        throw new Error('Maximum guards reached');
      }

      // Get tier config
      const tierConfig = GUARD_TIERS[skillTier];

      // Check character can afford hire cost
      const character = await Character.findById(characterId).session(session);
      const currentBalance = character?.dollars ?? character?.gold ?? 0;
      if (!character || currentBalance < tierConfig.hireCost) {
        throw new Error(`Insufficient funds. Need ${tierConfig.hireCost} gold`);
      }

      // Deduct cost using DollarService
      await DollarService.deductDollars(
        characterId.toString(),
        tierConfig.hireCost,
        TransactionSource.GUARD_HIRE,
        { propertyId: propertyId.toString(), guardName, skillTier },
        session
      );

      // Create guard
      const guard: IPropertyGuard = {
        id: uuidv4(),
        name: guardName,
        skillTier,
        defense: tierConfig.defense,
        dailyWage: tierConfig.dailyWage,
        hiredAt: new Date(),
        loyalty: 100,
      };

      property.hireGuard(guard);
      await property.save({ session });

      // Send notification
      const notification = new Notification({
        characterId,
        type: NotificationType.GUARD_HIRED,
        title: 'Guard Hired',
        message: `${guardName} (${skillTier}) is now guarding ${property.name}`,
        link: `/properties/${propertyId}`,
      });
      await notification.save({ session });

      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error hiring guard:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fire a guard
   */
  static async fireGuard(
    propertyId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    guardId: string
  ): Promise<IProperty> {
    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (property.ownerId?.toString() !== characterId.toString()) {
      throw new Error('Only the property owner can fire guards');
    }

    property.fireGuard(guardId);
    await property.save();

    return property;
  }

  /**
   * Set property insurance level
   */
  static async setInsurance(
    propertyId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    level: InsuranceLevel
  ): Promise<IProperty> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const property = await Property.findById(propertyId).session(session);
      if (!property) {
        throw new Error('Property not found');
      }

      if (property.ownerId?.toString() !== characterId.toString()) {
        throw new Error('Only the property owner can set insurance');
      }

      if (level !== InsuranceLevel.NONE) {
        const tierConfig = INSURANCE_TIERS[level];
        const character = await Character.findById(characterId).session(session);
        const currentBalance = character?.dollars ?? character?.gold ?? 0;
        if (!character || currentBalance < tierConfig.weeklyPremium) {
          throw new Error(`Insufficient funds. Need ${tierConfig.weeklyPremium} gold for weekly premium`);
        }

        await DollarService.deductDollars(
          characterId.toString(),
          tierConfig.weeklyPremium,
          TransactionSource.GUARD_PREMIUM,
          { propertyId: propertyId.toString(), level },
          session
        );
      }

      property.setInsurance(level);
      await property.save({ session });

      await session.commitTransaction();

      return property;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error setting insurance:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get gang raids summary
   */
  static async getGangRaidsSummary(gangId: mongoose.Types.ObjectId): Promise<IGangRaidsSummary> {
    const activeRaids = await Raid.findActiveRaidsForGang(gangId);

    const planningRaids = activeRaids.filter(r => r.status === RaidStatus.PLANNING && r.attackingGangId.toString() === gangId.toString()).length;
    const scheduledRaids = activeRaids.filter(r => r.status === RaidStatus.SCHEDULED && r.attackingGangId.toString() === gangId.toString()).length;
    const inProgressRaids = activeRaids.filter(r => r.status === RaidStatus.IN_PROGRESS).length;
    const incomingRaids = activeRaids.filter(r => r.defendingGangId?.toString() === gangId.toString()).length;

    // Get recent completed raids
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRaids = await Raid.find({
      $or: [{ attackingGangId: gangId }, { defendingGangId: gangId }],
      completedAt: { $gte: weekAgo },
    });

    const recentRaidsCompleted = recentRaids.filter(r =>
      r.attackingGangId.toString() === gangId.toString() && r.status === RaidStatus.COMPLETED
    ).length;
    const recentRaidsDefended = recentRaids.filter(r =>
      r.defendingGangId?.toString() === gangId.toString() && r.status === RaidStatus.DEFENDED
    ).length;

    // Get next scheduled raids
    const nextScheduled = activeRaids
      .filter(r => r.status === RaidStatus.SCHEDULED && r.attackingGangId.toString() === gangId.toString())
      .sort((a, b) => (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0))[0];

    const nextIncoming = activeRaids
      .filter(r => r.status === RaidStatus.SCHEDULED && r.defendingGangId?.toString() === gangId.toString())
      .sort((a, b) => (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0))[0];

    return {
      planningRaids,
      scheduledRaids,
      inProgressRaids,
      incomingRaids,
      recentRaidsCompleted,
      recentRaidsDefended,
      nextScheduledRaid: nextScheduled ? {
        raidId: nextScheduled._id.toString(),
        targetName: nextScheduled.targetName,
        targetType: nextScheduled.targetType,
        scheduledFor: nextScheduled.scheduledFor!,
      } : undefined,
      nextIncomingRaid: nextIncoming ? {
        raidId: nextIncoming._id.toString(),
        attackerName: nextIncoming.attackingGangName,
        targetName: nextIncoming.targetName,
        scheduledFor: nextIncoming.scheduledFor!,
      } : undefined,
    };
  }

  /**
   * Get raid by ID
   */
  static async getRaidById(raidId: mongoose.Types.ObjectId): Promise<IRaid | null> {
    return Raid.findById(raidId);
  }

  /**
   * Get active raids for a gang
   */
  static async getActiveRaids(gangId: mongoose.Types.ObjectId): Promise<IRaid[]> {
    return Raid.findActiveRaidsForGang(gangId);
  }

  /**
   * Get raid history for a gang
   */
  static async getRaidHistory(
    gangId: mongoose.Types.ObjectId,
    limit: number = 20
  ): Promise<IRaid[]> {
    return Raid.find({
      $or: [{ attackingGangId: gangId }, { defendingGangId: gangId }],
      status: { $in: [RaidStatus.COMPLETED, RaidStatus.FAILED, RaidStatus.DEFENDED] },
    })
      .sort({ completedAt: -1 })
      .limit(limit);
  }

  // ============================================================================
  // NPC Gang Attack Integration
  // ============================================================================

  /**
   * Record an NPC gang attack as a Raid document
   * This provides unified tracking of all attacks (player and NPC) against a gang
   */
  static async recordNPCAttack(
    npcGangId: string,
    npcGangName: string,
    defendingGangId: mongoose.Types.ObjectId,
    defendingGangName: string,
    attackType: string,
    damage: {
      goldLost: number;
      influenceLost: number;
      membersInjured?: number;
    },
    zoneId?: string,
    session?: ClientSession
  ): Promise<IRaid> {
    const now = new Date();

    // Map NPC attack type to raid target type
    const targetType = attackType === 'raid' || attackType === 'full_assault'
      ? RaidTargetType.TREASURY
      : attackType === 'ambush'
        ? RaidTargetType.PRODUCTION
        : RaidTargetType.TERRITORY_INFLUENCE;

    // Determine outcome based on damage dealt
    const totalDamage = damage.goldLost + damage.influenceLost * 10;
    const outcome = totalDamage > 500
      ? RaidOutcome.CRITICAL_SUCCESS
      : totalDamage > 100
        ? RaidOutcome.SUCCESS
        : totalDamage > 0
          ? RaidOutcome.PARTIAL_SUCCESS
          : RaidOutcome.FAILURE;

    const result: IRaidResult = {
      outcome,
      damageDealt: totalDamage,
      goldStolen: damage.goldLost,
      influenceLost: damage.influenceLost,
      xpAwarded: 0,
      goldAwarded: damage.goldLost,
    };

    const raid = new Raid({
      // Use a placeholder ObjectId for NPC gang (they don't have real gang documents)
      attackingGangId: new mongoose.Types.ObjectId(),
      attackingGangName: npcGangName,
      defendingGangId,
      defendingGangName,
      targetType,
      targetId: defendingGangId,
      targetName: `${defendingGangName} (NPC Attack)`,
      zoneId: zoneId || 'unknown',
      status: RaidStatus.COMPLETED,
      plannedAt: now,
      startedAt: now,
      completedAt: now,
      leaderId: new mongoose.Types.ObjectId(),
      leaderName: 'NPC',
      participants: [],
      attackPower: 0,
      defensePower: 0,
      successRoll: 100,
      result,
      isWarRaid: false,
      isNPCRaid: true,
      npcGangId: npcGangId as any,
      npcAttackType: attackType as any,
    });

    if (session) {
      await raid.save({ session });
    } else {
      await raid.save();
    }

    logger.info(
      `Recorded NPC attack: ${npcGangName} attacked ${defendingGangName}, ` +
      `damage: ${damage.goldLost} gold, ${damage.influenceLost} influence`
    );

    return raid;
  }

  /**
   * Get NPC raid history for a gang
   */
  static async getNPCRaidHistory(
    gangId: mongoose.Types.ObjectId,
    limit: number = 20
  ): Promise<IRaid[]> {
    return (Raid as any).findNPCRaidsAgainstGang(gangId, limit);
  }
}
