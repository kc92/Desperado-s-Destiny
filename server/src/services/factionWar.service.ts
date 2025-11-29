/**
 * Faction War Service
 *
 * Handles faction war event creation, management, and resolution
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import mongoose from 'mongoose';
import {
  TerritoryFactionId,
  WarEventType,
  WarPhase,
  WarEventStatus,
  WarEventTemplate,
  WarRewardType,
  WAR_SCORING,
  WAR_REWARDS,
} from '@desperados/shared';
import { FactionWarEvent, IFactionWarEvent } from '../models/FactionWarEvent.model';
import { WarParticipant, IWarParticipant } from '../models/WarParticipant.model';
import { Character, ICharacter } from '../models/Character.model';
import { Territory, ITerritory } from '../models/Territory.model';
import { getTemplateById, getRandomTemplate } from '../data/warEventTemplates';
import { WarObjectivesService } from './warObjectives.service';
import logger from '../utils/logger';

export class FactionWarService {
  /**
   * Create a new war event from template
   */
  static async createWarEvent(
    templateId: string,
    attackingFaction: TerritoryFactionId,
    defendingFaction: TerritoryFactionId,
    targetTerritory: string,
    customStartTime?: Date
  ): Promise<IFactionWarEvent> {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error(`War event template not found: ${templateId}`);
    }

    // Validate territory exists
    const territory = await Territory.findBySlug(targetTerritory);
    if (!territory) {
      throw new Error(`Territory not found: ${targetTerritory}`);
    }

    // Calculate timing
    const announcedAt = new Date();
    const startsAt = customStartTime || new Date(
      announcedAt.getTime() + template.announcementHours * 60 * 60 * 1000
    );
    const endsAt = new Date(
      startsAt.getTime() + template.durationHours * 60 * 60 * 1000
    );

    // Generate objectives
    const primaryObjectives = WarObjectivesService.generateObjectives(
      template,
      'primary',
      template.primaryObjectiveCount
    );
    const secondaryObjectives = WarObjectivesService.generateObjectives(
      template,
      'secondary',
      template.secondaryObjectiveCount
    );
    const bonusObjectives = WarObjectivesService.generateObjectives(
      template,
      'bonus',
      template.bonusObjectiveCount
    );

    // Generate rewards
    const victoryRewards = this.generateVictoryRewards(template);
    const participationRewards = this.generateParticipationRewards(template);
    const mvpRewards = this.generateMVPRewards(template);

    // Create event
    const warEvent = new FactionWarEvent({
      eventType: template.eventType,
      name: template.name,
      description: template.description,
      lore: template.lore,
      attackingFaction,
      defendingFaction,
      alliedFactions: new Map(),
      targetTerritory,
      adjacentTerritories: await this.getAdjacentTerritories(targetTerritory),
      announcedAt,
      startsAt,
      endsAt,
      currentPhase: WarPhase.ANNOUNCEMENT,
      primaryObjectives,
      secondaryObjectives,
      bonusObjectives,
      attackerScore: 0,
      defenderScore: 0,
      objectivesCompleted: new Map(),
      totalParticipants: 0,
      attackerCount: 0,
      defenderCount: 0,
      victoryRewards,
      participationRewards,
      mvpRewards,
      status: WarEventStatus.SCHEDULED,
      casualties: { attacker: 0, defender: 0 },
      templateId,
    });

    await warEvent.save();

    logger.info(`Created war event: ${warEvent.name} (${warEvent._id})`);

    return warEvent;
  }

  /**
   * Character joins a war event
   */
  static async joinWarEvent(
    warEventId: string,
    characterId: string,
    side: TerritoryFactionId
  ): Promise<IWarParticipant> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const warEvent = await FactionWarEvent.findById(warEventId).session(session);
      if (!warEvent) {
        throw new Error('War event not found');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Validate eligibility
      if (!warEvent.canJoin(character.level)) {
        throw new Error('Character does not meet requirements for this war event');
      }

      // Check if already joined
      const existing = await WarParticipant.findOne({
        warEventId: new mongoose.Types.ObjectId(warEventId),
        characterId: new mongoose.Types.ObjectId(characterId),
      }).session(session);

      if (existing) {
        throw new Error('Character already joined this war event');
      }

      // Validate faction alignment
      const isAttacker =
        side === warEvent.attackingFaction ||
        warEvent.alliedFactions.get(side) === 'attacker';
      const isDefender =
        side === warEvent.defendingFaction ||
        warEvent.alliedFactions.get(side) === 'defender';

      if (!isAttacker && !isDefender) {
        throw new Error('Faction is not involved in this war event');
      }

      // Create participant
      const participant = new WarParticipant({
        warEventId: warEvent._id,
        characterId: character._id,
        characterName: character.name,
        characterLevel: character.level,
        gangId: character.gangId,
        gangName: character.gangId ? 'Unknown Gang' : undefined, // TODO: populate gang name
        side,
        joinedAt: new Date(),
        objectivesCompleted: [],
        killCount: 0,
        duelWins: 0,
        supportActions: 0,
        totalScore: 0,
        contributionBreakdown: {
          combat: 0,
          strategic: 0,
          support: 0,
          leadership: 0,
        },
        rewardsEarned: [],
        mvpCandidate: false,
      });

      await participant.save({ session });

      // Update event participant counts
      warEvent.totalParticipants += 1;
      if (isAttacker) {
        warEvent.attackerCount += 1;
      } else {
        warEvent.defenderCount += 1;
      }
      await warEvent.save({ session });

      await session.commitTransaction();

      logger.info(
        `Character ${character.name} joined war event ${warEvent.name} on side ${side}`
      );

      return participant;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get active war events
   */
  static async getActiveEvents(): Promise<IFactionWarEvent[]> {
    return FactionWarEvent.findActiveEvents();
  }

  /**
   * Get upcoming war events
   */
  static async getUpcomingEvents(): Promise<IFactionWarEvent[]> {
    return FactionWarEvent.findUpcomingEvents();
  }

  /**
   * Get war event by ID with participants
   */
  static async getWarEventDetails(warEventId: string): Promise<{
    event: IFactionWarEvent;
    participants: IWarParticipant[];
    leaderboard: IWarParticipant[];
  }> {
    const event = await FactionWarEvent.findById(warEventId);
    if (!event) {
      throw new Error('War event not found');
    }

    const eventObjId = new mongoose.Types.ObjectId(warEventId);
    const participants = await WarParticipant.findByWarEvent(eventObjId);
    const leaderboard = await WarParticipant.getLeaderboard(eventObjId, 50);

    return { event, participants, leaderboard };
  }

  /**
   * Update war event phases
   */
  static async updateEventPhases(): Promise<number> {
    const events = await FactionWarEvent.find({
      status: { $in: [WarEventStatus.SCHEDULED, WarEventStatus.ACTIVE] },
    });

    let updated = 0;
    for (const event of events) {
      const phaseChanged = event.updatePhase();
      if (phaseChanged) {
        await event.save();
        updated++;

        logger.info(`War event ${event.name} transitioned to phase ${event.currentPhase}`);

        // Handle phase-specific logic
        if (event.currentPhase === WarPhase.RESOLUTION) {
          await this.resolveWarEvent(event);
        }
      }
    }

    return updated;
  }

  /**
   * Resolve a completed war event
   */
  static async resolveWarEvent(event: IFactionWarEvent): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Determine winner
      const winner = event.calculateWinner();
      event.winner = winner;
      event.status = WarEventStatus.COMPLETED;

      // Calculate influence change
      const template = getTemplateById(event.templateId);
      if (template) {
        event.influenceChange = winner
          ? template.victoryInfluenceGain
          : template.victoryInfluenceGain / 2; // Tie = half influence
      }

      await event.save({ session });

      // Distribute rewards
      await this.distributeRewards(event, session);

      // Mark MVP candidates
      await this.markMVPCandidates(event, session);

      await session.commitTransaction();

      logger.info(
        `War event ${event.name} resolved. Winner: ${winner || 'TIE'}, Influence: ${event.influenceChange}`
      );
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error resolving war event ${event._id}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Distribute rewards to participants
   */
  static async distributeRewards(
    event: IFactionWarEvent,
    session: mongoose.ClientSession
  ): Promise<void> {
    const participants = await WarParticipant.find({ warEventId: event._id }).session(session);

    for (const participant of participants) {
      // Participation rewards for everyone
      for (const reward of event.participationRewards) {
        participant.grantReward(reward);
      }

      // Victory rewards for winning side
      if (event.winner) {
        const isWinner =
          participant.side === event.winner ||
          event.alliedFactions.get(participant.side) ===
            (event.winner === event.attackingFaction ? 'attacker' : 'defender');

        if (isWinner) {
          for (const reward of event.victoryRewards) {
            participant.grantReward(reward);
          }
        }
      }

      await participant.save({ session });
    }
  }

  /**
   * Mark MVP candidates
   */
  static async markMVPCandidates(
    event: IFactionWarEvent,
    session: mongoose.ClientSession
  ): Promise<void> {
    const participants = await WarParticipant.find({ warEventId: event._id })
      .sort({ totalScore: -1 })
      .session(session);

    if (participants.length === 0) return;

    // Top 5% are MVP candidates
    const mvpCount = Math.max(1, Math.ceil(participants.length * ((WAR_SCORING as any).MVP_TOP_PERCENTAGE || 0.05)));

    for (let i = 0; i < mvpCount && i < participants.length; i++) {
      participants[i].mvpCandidate = true;

      // Grant MVP rewards
      for (const reward of event.mvpRewards) {
        participants[i].grantReward(reward);
      }

      await participants[i].save({ session });
    }

    logger.info(`Marked ${mvpCount} MVP candidates for war event ${event.name}`);
  }

  /**
   * Get adjacent territories
   */
  private static async getAdjacentTerritories(territoryId: string): Promise<string[]> {
    // TODO: Implement proper adjacency logic when territory graph is available
    // For now, return empty array
    return [];
  }

  /**
   * Generate victory rewards based on template
   */
  private static generateVictoryRewards(template: WarEventTemplate): any[] {
    return [
      {
        type: WarRewardType.GOLD,
        amount: Math.floor(WAR_REWARDS.BASE_GOLD_VICTORY * template.victoryGoldMultiplier),
        description: `Victory gold bonus for ${template.name}`,
      },
      {
        type: WarRewardType.XP,
        amount: Math.floor(WAR_REWARDS.BASE_XP_VICTORY * template.victoryXpMultiplier),
        description: `Victory XP bonus for ${template.name}`,
      },
      {
        type: WarRewardType.REPUTATION,
        amount: template.victoryInfluenceGain,
        description: 'Faction reputation increase',
      },
    ];
  }

  /**
   * Generate participation rewards
   */
  private static generateParticipationRewards(template: WarEventTemplate): any[] {
    return [
      {
        type: WarRewardType.GOLD,
        amount: template.participationGoldBase,
        description: `Participation reward for ${template.name}`,
      },
      {
        type: WarRewardType.XP,
        amount: template.participationXpBase,
        description: `Participation XP for ${template.name}`,
      },
    ];
  }

  /**
   * Generate MVP rewards
   */
  private static generateMVPRewards(template: WarEventTemplate): any[] {
    return [
      {
        type: WarRewardType.GOLD,
        amount: Math.floor(
          WAR_REWARDS.BASE_GOLD_VICTORY * template.victoryGoldMultiplier * WAR_REWARDS.MVP_MULTIPLIER
        ),
        description: `MVP gold bonus for ${template.name}`,
      },
      {
        type: WarRewardType.XP,
        amount: Math.floor(
          WAR_REWARDS.BASE_XP_VICTORY * template.victoryXpMultiplier * WAR_REWARDS.MVP_MULTIPLIER
        ),
        description: `MVP XP bonus for ${template.name}`,
      },
      {
        type: WarRewardType.TITLE,
        title: `War Hero of ${template.name}`,
        description: 'Special title for top performers',
      },
    ];
  }

  /**
   * Get war statistics
   */
  static async getWarStatistics(warEventId: string): Promise<any> {
    const event = await FactionWarEvent.findById(warEventId);
    if (!event) {
      throw new Error('War event not found');
    }

    const eventObjId = new mongoose.Types.ObjectId(warEventId);
    const participants = await WarParticipant.findByWarEvent(eventObjId);

    const totalKills = participants.reduce((sum, p) => sum + p.killCount, 0);
    const totalDuels = participants.reduce((sum, p) => sum + p.duelWins, 0);

    const attackers = participants.filter(p => p.side === event.attackingFaction);
    const defenders = participants.filter(p => p.side === event.defendingFaction);

    const topAttacker = attackers.sort((a, b) => b.totalScore - a.totalScore)[0];
    const topDefender = defenders.sort((a, b) => b.totalScore - a.totalScore)[0];
    const overallMVP = participants.sort((a, b) => b.totalScore - a.totalScore)[0];

    const allObjectives = event.getAllObjectives();
    const completedObjectives = allObjectives.filter(obj => obj.completed).length;

    return {
      eventId: event._id.toString(),
      eventName: event.name,
      eventType: event.eventType,
      totalParticipants: event.totalParticipants,
      attackerCount: event.attackerCount,
      defenderCount: event.defenderCount,
      attackerScore: event.attackerScore,
      defenderScore: event.defenderScore,
      totalObjectives: allObjectives.length,
      completedObjectives,
      attackerObjectives: allObjectives.filter(
        obj => obj.completed && obj.completedBy === event.attackingFaction
      ).length,
      defenderObjectives: allObjectives.filter(
        obj => obj.completed && obj.completedBy === event.defendingFaction
      ).length,
      totalKills,
      totalDuels,
      topAttacker: topAttacker ? this.formatLeaderboardEntry(topAttacker, 1) : undefined,
      topDefender: topDefender ? this.formatLeaderboardEntry(topDefender, 1) : undefined,
      overallMVP: overallMVP ? this.formatLeaderboardEntry(overallMVP, 1) : undefined,
    };
  }

  /**
   * Format leaderboard entry
   */
  private static formatLeaderboardEntry(participant: IWarParticipant, rank: number): any {
    return {
      rank,
      characterId: participant.characterId.toString(),
      characterName: participant.characterName,
      gangName: participant.gangName,
      side: participant.side,
      score: participant.totalScore,
      killCount: participant.killCount,
      objectivesCompleted: participant.objectivesCompleted.length,
      mvp: participant.mvpCandidate,
    };
  }
}
