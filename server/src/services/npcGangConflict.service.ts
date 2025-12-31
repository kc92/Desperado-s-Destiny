/**
 * NPC Gang Conflict Service
 *
 * Handles all interactions between player gangs and NPC gangs
 */

import mongoose from 'mongoose';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import { NPCGangRelationship, INPCGangRelationship } from '../models/NPCGangRelationship.model';
import { TerritoryZone } from '../models/TerritoryZone.model';
import {
  NPCGangId,
  NPCGang,
  NPCGangOverview,
  TributePaymentResult,
  ChallengeNPCZoneResult,
  ChallengeMissionResult,
  FinalBattleResult,
  NPCAttackResult,
  AttackType,
  RelationshipChangeReason,
  RELATIONSHIP_THRESHOLDS,
  MissionAcceptanceResult,
  ActiveNPCMission,
  NPCMissionType,
} from '@desperados/shared';
import { ALL_NPC_GANGS, getNPCGangById } from '../data/npcGangs';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { RaidService } from './raid.service';

export class NPCGangConflictService {
  /**
   * Get all NPC gangs
   */
  static async getAllNPCGangs(): Promise<NPCGang[]> {
    return ALL_NPC_GANGS;
  }

  /**
   * Get specific NPC gang details
   */
  static async getNPCGang(npcGangId: NPCGangId): Promise<NPCGang> {
    const gang = getNPCGangById(npcGangId);
    if (!gang) {
      throw new Error(`NPC Gang not found: ${npcGangId}`);
    }
    return gang;
  }

  /**
   * Get player gang's relationship with NPC gang
   */
  static async getRelationship(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId
  ): Promise<INPCGangRelationship> {
    let relationship = await NPCGangRelationship.findRelationship(playerGangId, npcGangId);

    if (!relationship) {
      relationship = await NPCGangRelationship.initializeRelationship(playerGangId, npcGangId);
    }

    return relationship;
  }

  /**
   * Get comprehensive NPC gang overview for player gang
   */
  static async getNPCGangOverview(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId
  ): Promise<NPCGangOverview> {
    const gang = getNPCGangById(npcGangId);
    if (!gang) {
      throw new Error(`NPC Gang not found: ${npcGangId}`);
    }

    const relationship = await this.getRelationship(playerGangId, npcGangId);

    // Filter missions based on relationship
    const availableMissions = gang.missions.filter(
      mission => relationship.relationshipScore >= mission.minRelationship &&
                 relationship.canAcceptMissions()
    );

    // Get active missions (would need ActiveNPCMission model - simplified for now)
    const activeMissions: ActiveNPCMission[] = [];

    // Get recent attacks (would need NPCAttack model - simplified for now)
    const recentAttacks: NPCAttackResult[] = [];

    // Check if can challenge
    const playerGang = await Gang.findById(playerGangId);
    const canChallenge = playerGang && playerGang.level >= 15 && !relationship.activeConflict;
    const challengeCost = 1000;

    return {
      gang,
      relationship: relationship.toObject() as any,
      availableMissions,
      activeMissions,
      recentAttacks,
      canChallenge: !!canChallenge,
      challengeCost,
    };
  }

  /**
   * Pay tribute to NPC gang
   */
  static async payTribute(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId,
    characterId: mongoose.Types.ObjectId
  ): Promise<TributePaymentResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(playerGangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can pay tribute');
      }

      const npcGang = getNPCGangById(npcGangId);
      if (!npcGang) {
        throw new Error(`NPC Gang not found: ${npcGangId}`);
      }

      const relationship = await NPCGangRelationship.findRelationship(playerGangId, npcGangId);
      if (!relationship) {
        throw new Error('Relationship not found');
      }

      // Calculate tribute cost (increases with negative relationship)
      const baseTribute = npcGang.tributeCost;
      const relationshipMultiplier = relationship.relationshipScore < 0
        ? 1 + Math.abs(relationship.relationshipScore) / 100
        : 1;
      const tributeAmount = Math.floor(baseTribute * relationshipMultiplier);

      if (!gang.canAfford(tributeAmount)) {
        throw new Error(`Insufficient gang funds. Need ${tributeAmount}, have ${gang.bank}`);
      }

      // Deduct from gang bank
      gang.bank -= tributeAmount;
      await gang.save({ session });

      // Update relationship
      const oldScore = relationship.relationshipScore;
      relationship.payTribute();
      await relationship.save({ session });

      await session.commitTransaction();

      const relationshipChange = relationship.relationshipScore - oldScore;

      logger.info(
        `Gang ${gang.name} paid ${tributeAmount} tribute to ${npcGang.name}. ` +
        `Relationship: ${oldScore} -> ${relationship.relationshipScore}`
      );

      return {
        success: true,
        npcGangId,
        npcGangName: npcGang.name,
        amountPaid: tributeAmount,
        relationshipChange,
        newRelationship: relationship.relationshipScore,
        newAttitude: relationship.attitude,
        message: `Paid $${tributeAmount} tribute to ${npcGang.name}. Relationship improved.`,
        streak: relationship.tributeStreak,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error paying tribute:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Challenge NPC gang for territory
   */
  static async challengeTerritory(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId,
    zoneId: string,
    characterId: mongoose.Types.ObjectId
  ): Promise<ChallengeNPCZoneResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(playerGangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!gang.isLeader(characterId)) {
        throw new Error('Only the gang leader can challenge territory');
      }

      if (gang.level < 15) {
        throw new Error('Gang must be level 15 or higher to challenge NPC territory');
      }

      const npcGang = getNPCGangById(npcGangId);
      if (!npcGang) {
        throw new Error(`NPC Gang not found: ${npcGangId}`);
      }

      const zone = await TerritoryZone.findBySlug(zoneId);
      if (!zone) {
        throw new Error(`Zone not found: ${zoneId}`);
      }

      if (!npcGang.controlledZones.includes(zoneId)) {
        throw new Error(`${npcGang.name} does not control ${zone.name}`);
      }

      const relationship = await NPCGangRelationship.findRelationship(playerGangId, npcGangId);
      if (!relationship) {
        throw new Error('Relationship not found');
      }

      if (relationship.challengeProgress && !relationship.isChallengeComplete()) {
        throw new Error('Already have an active challenge');
      }

      // Cost to start challenge
      const challengeCost = 1000;
      if (!gang.canAfford(challengeCost)) {
        throw new Error(`Insufficient gang funds. Need ${challengeCost}, have ${gang.bank}`);
      }

      gang.bank -= challengeCost;
      await gang.save({ session });

      // Start challenge
      relationship.startChallenge(zoneId, 3);
      relationship.changeRelationship(-20, RelationshipChangeReason.TERRITORY_ATTACKED);
      await relationship.save({ session });

      await session.commitTransaction();

      logger.info(
        `Gang ${gang.name} challenged ${npcGang.name} for zone ${zone.name}`
      );

      return {
        success: true,
        npcGangId,
        npcGangName: npcGang.name,
        zoneId,
        zoneName: zone.name,
        challengeStarted: true,
        missionsRequired: 3,
        message: `Challenge initiated for ${zone.name}. Complete 3 different mission types to unlock the final battle.`,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error challenging territory:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Complete challenge mission
   */
  static async completeChallengeMission(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId,
    missionType: string
  ): Promise<ChallengeMissionResult> {
    const relationship = await NPCGangRelationship.findRelationship(playerGangId, npcGangId);
    if (!relationship) {
      throw new Error('Relationship not found');
    }

    if (!relationship.challengeProgress) {
      throw new Error('No active challenge');
    }

    const npcGang = getNPCGangById(npcGangId);
    if (!npcGang) {
      throw new Error(`NPC Gang not found: ${npcGangId}`);
    }

    const isComplete = relationship.completeChallengeMission(missionType);
    await relationship.save();

    const progress = relationship.challengeProgress;

    logger.info(
      `Gang ${playerGangId} completed challenge mission (${missionType}) ` +
      `for ${npcGang.name}. Progress: ${progress.missionsCompleted}/${progress.missionsRequired}`
    );

    return {
      success: true,
      npcGangId,
      zoneId: progress.targetZone,
      missionType,
      missionsCompleted: progress.missionsCompleted,
      missionsRequired: progress.missionsRequired,
      challengeComplete: isComplete,
      message: isComplete
        ? 'Challenge complete! You can now attempt the final battle.'
        : `Progress: ${progress.missionsCompleted}/${progress.missionsRequired} missions complete.`,
    };
  }

  /**
   * Fight final battle for territory
   */
  static async fightFinalBattle(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId,
    characterId: mongoose.Types.ObjectId
  ): Promise<FinalBattleResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(playerGangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!gang.isMember(characterId)) {
        throw new Error('Character is not a gang member');
      }

      const npcGang = getNPCGangById(npcGangId);
      if (!npcGang) {
        throw new Error(`NPC Gang not found: ${npcGangId}`);
      }

      const relationship = await NPCGangRelationship.findRelationship(playerGangId, npcGangId);
      if (!relationship) {
        throw new Error('Relationship not found');
      }

      if (!relationship.isChallengeComplete()) {
        throw new Error('Challenge not complete. Finish all required missions first.');
      }

      const zoneId = relationship.challengeProgress!.targetZone;
      const zone = await TerritoryZone.findBySlug(zoneId);
      if (!zone) {
        throw new Error(`Zone not found: ${zoneId}`);
      }

      // Calculate victory chance based on gang strength
      const gangStrength = gang.level * gang.members.length;
      const npcStrength = npcGang.strength;
      const victoryChance = Math.min(0.9, gangStrength / (gangStrength + npcStrength));
      const victory = SecureRNG.chance(victoryChance);

      let rewards = {
        gold: 0,
        xp: 0,
        items: [] as string[],
      };

      if (victory) {
        // Transfer zone control
        zone.controlledBy = null;
        zone.influence = [];
        zone.contestedBy = [];
        await zone.save({ session });

        // Add influence for player gang
        zone.addInfluence(playerGangId, gang.name, 100, false);
        await zone.save({ session });

        // Rewards
        rewards = {
          gold: 1000 + (npcGang.strength * 5),
          xp: 500 * gang.members.length,
          items: ['Territory Control Document'],
        };

        gang.bank += rewards.gold;
        gang.addTerritory(zoneId);
        gang.incrementWins();
        await gang.save({ session });

        // Distribute XP to all gang members
        const xpPerMember = Math.floor(rewards.xp / gang.members.length);
        for (const member of gang.members) {
          const memberChar = await Character.findById(member.characterId).session(session);
          if (memberChar) {
            (memberChar as any).xp += xpPerMember;
            await memberChar.save({ session });
          }
        }

        // Clear challenge
        relationship.challengeProgress = undefined;
        relationship.changeRelationship(-50, RelationshipChangeReason.TERRITORY_ATTACKED);
        relationship.activeConflict = true;
        relationship.conflictReason = 'Conquered territory';
        await relationship.save({ session });

        logger.info(
          `Gang ${gang.name} won final battle against ${npcGang.name} for ${zone.name}`
        );
      } else {
        // Defeat
        gang.incrementLosses();
        await gang.save({ session });

        relationship.challengeProgress = undefined;
        relationship.changeRelationship(-30, RelationshipChangeReason.TERRITORY_ATTACKED);
        await relationship.save({ session });

        logger.info(
          `Gang ${gang.name} lost final battle against ${npcGang.name} for ${zone.name}`
        );
      }

      await session.commitTransaction();

      return {
        success: true,
        victory,
        npcGangId,
        zoneId,
        zoneName: zone.name,
        rewards,
        message: victory
          ? `Victory! Your gang has conquered ${zone.name} from ${npcGang.name}!`
          : `Defeat. ${npcGang.name} defended ${zone.name}. Your challenge has failed.`,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error in final battle:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Process NPC gang attack on player gang
   */
  static async processNPCAttack(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId,
    attackType: AttackType
  ): Promise<NPCAttackResult> {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const gang = await Gang.findById(playerGangId).session(session);
      if (!gang) {
        throw new Error('Gang not found');
      }

      const npcGang = getNPCGangById(npcGangId);
      if (!npcGang) {
        throw new Error(`NPC Gang not found: ${npcGangId}`);
      }

      const attackPattern = npcGang.attackPatterns.find(a => a.type === attackType);
      if (!attackPattern) {
        throw new Error(`Attack type ${attackType} not found for ${npcGang.name}`);
      }

      // Apply damage
      const goldLost = Math.min(gang.bank, attackPattern.damage.goldLoss);
      gang.bank -= goldLost;
      await gang.save({ session });

      // Apply influence loss to controlled zones
      const zones = await TerritoryZone.findControlledByGang(playerGangId);
      let influenceLost = 0;
      if (zones.length > 0) {
        const randomZone = SecureRNG.select(zones);
        const lossAmount = attackPattern.damage.influenceLoss;
        randomZone.removeInfluence(playerGangId, lossAmount);
        await randomZone.save({ session });
        influenceLost = lossAmount;
      }

      // Record the attack as a Raid document for unified tracking
      await RaidService.recordNPCAttack(
        npcGangId,
        npcGang.name,
        playerGangId,
        gang.name,
        attackType,
        {
          goldLost,
          influenceLost,
          membersInjured: 0,
        },
        zones.length > 0 ? zones[0].id : undefined,
        session
      );

      await session.commitTransaction();

      logger.info(
        `${npcGang.name} attacked ${gang.name} (${attackType}). ` +
        `Damage: ${goldLost} gold, ${influenceLost} influence`
      );

      return {
        npcGangId,
        npcGangName: npcGang.name,
        attackType,
        damage: {
          goldLost,
          influenceLost,
          membersInjured: 0,
        },
        zoneAffected: zones.length > 0 ? zones[0].id : undefined,
        canRetaliate: true,
        message: attackPattern.description,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error processing NPC attack:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Accept NPC gang mission
   */
  static async acceptMission(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId,
    missionId: string,
    characterId: mongoose.Types.ObjectId
  ): Promise<MissionAcceptanceResult> {
    const gang = await Gang.findById(playerGangId);
    if (!gang) {
      throw new Error('Gang not found');
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    if (!gang.isMember(characterId)) {
      throw new Error('Character is not a gang member');
    }

    const npcGang = getNPCGangById(npcGangId);
    if (!npcGang) {
      throw new Error(`NPC Gang not found: ${npcGangId}`);
    }

    const missionTemplate = npcGang.missions.find(m => m.id === missionId);
    if (!missionTemplate) {
      throw new Error(`Mission not found: ${missionId}`);
    }

    const relationship = await NPCGangRelationship.findRelationship(playerGangId, npcGangId);
    if (!relationship) {
      throw new Error('Relationship not found');
    }

    if (!relationship.canAcceptMissions()) {
      throw new Error('Cannot accept missions while hostile or in conflict');
    }

    if (relationship.relationshipScore < missionTemplate.minRelationship) {
      throw new Error(
        `Insufficient reputation. Need ${missionTemplate.minRelationship}, ` +
        `have ${relationship.relationshipScore}`
      );
    }

    // Check requirements
    for (const req of missionTemplate.requirements) {
      // Implementation would check actual requirements
      // Simplified for now
    }

    // Create active mission (would use ActiveNPCMission model)
    const activeMission: ActiveNPCMission = {
      _id: new mongoose.Types.ObjectId().toString(),
      playerGangId: playerGangId.toString(),
      npcGangId,
      missionId: missionTemplate.id,
      missionName: missionTemplate.name,
      missionType: missionTemplate.type,
      description: missionTemplate.description,
      requirements: missionTemplate.requirements,
      rewards: missionTemplate.rewards,
      progress: {
        current: 0,
        required: 1,
      },
      status: 'active',
      acceptedAt: new Date(),
      expiresAt: new Date(Date.now() + missionTemplate.cooldown * 60 * 60 * 1000),
    };

    logger.info(
      `Gang ${gang.name} accepted mission ${missionTemplate.name} from ${npcGang.name}`
    );

    return {
      success: true,
      mission: activeMission,
      message: `Mission "${missionTemplate.name}" accepted. Complete it to earn rewards.`,
    };
  }

  /**
   * Initialize relationships for new gang
   */
  static async initializeGangRelationships(playerGangId: mongoose.Types.ObjectId): Promise<void> {
    for (const npcGang of ALL_NPC_GANGS) {
      await NPCGangRelationship.initializeRelationship(playerGangId, npcGang.id);
    }

    logger.info(`Initialized NPC gang relationships for gang ${playerGangId}`);
  }

  /**
   * Get all relationships for a player gang
   */
  static async getGangRelationships(
    playerGangId: mongoose.Types.ObjectId
  ): Promise<Array<{ gang: NPCGang; relationship: INPCGangRelationship }>> {
    const relationships = await NPCGangRelationship.findByPlayerGang(playerGangId);

    return relationships.map(rel => {
      const gang = getNPCGangById(rel.npcGangId);
      return {
        gang: gang!,
        relationship: rel,
      };
    });
  }
}
