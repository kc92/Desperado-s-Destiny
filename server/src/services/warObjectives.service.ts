/**
 * War Objectives Service
 *
 * Handles war objective management, progress tracking, and completion
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import mongoose from 'mongoose';
import {
  TerritoryFactionId,
  WarObjectiveType,
  ObjectivePriority,
  ContributionType,
  WarEventTemplate,
  WarContributionResult,
  FACTION_WAR_SCORING,
} from '@desperados/shared';
import { FactionWarEvent, IFactionWarEvent, IWarObjective } from '../models/FactionWarEvent.model';
import { WarParticipant, IWarParticipant } from '../models/WarParticipant.model';
import {
  selectRandomObjectives,
  scaleObjectiveTarget,
  getEventTypeMultiplier,
  getObjectiveTemplate,
} from '../data/warObjectives';
import logger from '../utils/logger';

export class WarObjectivesService {
  /**
   * Generate objectives for a war event
   */
  static generateObjectives(
    template: WarEventTemplate,
    priority: 'primary' | 'secondary' | 'bonus',
    count: number
  ): IWarObjective[] {
    const priorityMap: Record<string, ObjectivePriority> = {
      primary: ObjectivePriority.PRIMARY,
      secondary: ObjectivePriority.SECONDARY,
      bonus: ObjectivePriority.BONUS,
    };

    const objectivePriority = priorityMap[priority];
    const templates = selectRandomObjectives(objectivePriority, count, template.minLevel);
    const eventMultiplier = getEventTypeMultiplier(template.eventType);

    return templates.map((objTemplate, index) => {
      const scaledTarget = scaleObjectiveTarget(
        objTemplate,
        template.maxParticipants,
        eventMultiplier
      );

      return {
        id: `${priority}_${objTemplate.id}_${index}`,
        type: objTemplate.type,
        priority: objTemplate.priority,
        name: objTemplate.name,
        description: objTemplate.description,
        target: scaledTarget,
        current: 0,
        completed: false,
        pointsPerProgress: objTemplate.defaultPoints,
        completionBonus: objTemplate.defaultBonus,
        timeLimit: objTemplate.timeLimit,
        minLevel: objTemplate.minLevel,
        requiredSkills: objTemplate.requiredSkills,
      };
    });
  }

  /**
   * Contribute progress to an objective
   */
  static async contributeToObjective(
    warEventId: string,
    characterId: string,
    objectiveId: string,
    amount: number = 1
  ): Promise<WarContributionResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const warEvent = await FactionWarEvent.findById(warEventId).session(session);
      if (!warEvent) {
        throw new Error('War event not found');
      }

      if (!warEvent.isActive()) {
        throw new Error('War event is not active');
      }

      const participant = await WarParticipant.findOne({
        warEventId: new mongoose.Types.ObjectId(warEventId),
        characterId: new mongoose.Types.ObjectId(characterId),
      }).session(session);

      if (!participant) {
        throw new Error('Character is not participating in this war event');
      }

      const objective = warEvent.getObjective(objectiveId);
      if (!objective) {
        throw new Error('Objective not found');
      }

      if (objective.completed) {
        throw new Error('Objective already completed');
      }

      // Check time limit
      if (objective.expiresAt && new Date() > objective.expiresAt) {
        throw new Error('Objective has expired');
      }

      // Add progress
      objective.current = Math.min(objective.current + amount, objective.target);

      // Calculate points earned
      const pointsEarned = amount * objective.pointsPerProgress;

      // Add to participant score
      const contributionType = this.getContributionType(objective.type);
      participant.addContribution(contributionType, pointsEarned);

      // Add to faction score
      warEvent.addScore(participant.side, pointsEarned);

      // Check if objective completed
      let objectiveCompleted = false;
      if (objective.current >= objective.target) {
        objective.completed = true;
        objective.completedBy = participant.side;
        objective.completedAt = new Date();
        objectiveCompleted = true;

        // Add objective to participant's completed list
        participant.addObjective(objectiveId, objective.completionBonus, contributionType);

        // Add completion bonus to faction score
        warEvent.addScore(participant.side, objective.completionBonus);

        logger.info(
          `Objective ${objective.name} completed by ${participant.side} in war event ${warEvent.name}`
        );
      }

      await warEvent.save({ session });
      await participant.save({ session });

      await session.commitTransaction();

      return {
        objectiveId,
        objectiveName: objective.name,
        contributionType,
        pointsEarned,
        progress: (objective.current / objective.target) * 100,
        objectiveCompleted,
        message: objectiveCompleted
          ? `Objective completed! Earned ${objective.completionBonus} bonus points!`
          : `Progress: ${objective.current}/${objective.target} (+${pointsEarned} points)`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Record an NPC kill for war event
   */
  static async recordNPCKill(
    warEventId: string,
    characterId: string,
    npcFaction: TerritoryFactionId
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const warEvent = await FactionWarEvent.findById(warEventId).session(session);
      if (!warEvent || !warEvent.isActive()) {
        await session.abortTransaction();
        return;
      }

      const participant = await WarParticipant.findOne({
        warEventId: new mongoose.Types.ObjectId(warEventId),
        characterId: new mongoose.Types.ObjectId(characterId),
      }).session(session);

      if (!participant) {
        await session.abortTransaction();
        return;
      }

      // Check if NPC is enemy faction
      const isEnemy =
        (participant.side === warEvent.attackingFaction &&
          npcFaction === warEvent.defendingFaction) ||
        (participant.side === warEvent.defendingFaction && npcFaction === warEvent.attackingFaction);

      if (!isEnemy) {
        await session.abortTransaction();
        return;
      }

      // Add kill
      participant.addKill(FACTION_WAR_SCORING.KILL_POINTS);
      warEvent.addScore(participant.side, FACTION_WAR_SCORING.KILL_POINTS);

      // Update casualties
      if (participant.side === warEvent.attackingFaction) {
        warEvent.casualties.defender += 1;
      } else {
        warEvent.casualties.attacker += 1;
      }

      // Find and update kill objectives
      const killObjectives = warEvent
        .getAllObjectives()
        .filter(
          obj =>
            obj.type === WarObjectiveType.KILL_NPCS &&
            !obj.completed &&
            (!obj.completedBy || obj.completedBy === participant.side)
        );

      for (const objective of killObjectives) {
        objective.current = Math.min(objective.current + 1, objective.target);

        if (objective.current >= objective.target && !objective.completed) {
          objective.completed = true;
          objective.completedBy = participant.side;
          objective.completedAt = new Date();
          warEvent.addScore(participant.side, objective.completionBonus);
          participant.addObjective(
            objective.id,
            objective.completionBonus,
            ContributionType.COMBAT
          );
        }
      }

      await warEvent.save({ session });
      await participant.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error recording NPC kill for war event:', error);
    } finally {
      session.endSession();
    }
  }

  /**
   * Record a duel win for war event
   */
  static async recordDuelWin(
    warEventId: string,
    winnerId: string,
    loserId: string
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const warEvent = await FactionWarEvent.findById(warEventId).session(session);
      if (!warEvent || !warEvent.isActive()) {
        await session.abortTransaction();
        return;
      }

      const winner = await WarParticipant.findOne({
        warEventId: new mongoose.Types.ObjectId(warEventId),
        characterId: new mongoose.Types.ObjectId(winnerId),
      }).session(session);

      const loser = await WarParticipant.findOne({
        warEventId: new mongoose.Types.ObjectId(warEventId),
        characterId: new mongoose.Types.ObjectId(loserId),
      }).session(session);

      if (!winner || !loser) {
        await session.abortTransaction();
        return;
      }

      // Check if opponents are on different sides
      if (winner.side === loser.side) {
        await session.abortTransaction();
        return;
      }

      // Add duel win
      winner.addDuelWin(FACTION_WAR_SCORING.DUEL_WIN_POINTS);
      warEvent.addScore(winner.side, FACTION_WAR_SCORING.DUEL_WIN_POINTS);

      // Find and update duel objectives
      const duelObjectives = warEvent
        .getAllObjectives()
        .filter(
          obj =>
            obj.type === WarObjectiveType.WIN_DUELS &&
            !obj.completed &&
            (!obj.completedBy || obj.completedBy === winner.side)
        );

      for (const objective of duelObjectives) {
        objective.current = Math.min(objective.current + 1, objective.target);

        if (objective.current >= objective.target && !objective.completed) {
          objective.completed = true;
          objective.completedBy = winner.side;
          objective.completedAt = new Date();
          warEvent.addScore(winner.side, objective.completionBonus);
          winner.addObjective(objective.id, objective.completionBonus, ContributionType.COMBAT);
        }
      }

      await warEvent.save({ session });
      await winner.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error recording duel win for war event:', error);
    } finally {
      session.endSession();
    }
  }

  /**
   * Record a support action
   */
  static async recordSupportAction(
    warEventId: string,
    characterId: string,
    actionType: 'heal' | 'supply' | 'scout' | 'recruit' | 'fortify' | 'rally'
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const warEvent = await FactionWarEvent.findById(warEventId).session(session);
      if (!warEvent || !warEvent.isActive()) {
        await session.abortTransaction();
        return;
      }

      const participant = await WarParticipant.findOne({
        warEventId: new mongoose.Types.ObjectId(warEventId),
        characterId: new mongoose.Types.ObjectId(characterId),
      }).session(session);

      if (!participant) {
        await session.abortTransaction();
        return;
      }

      // Add support action
      participant.addSupportAction(FACTION_WAR_SCORING.SUPPORT_ACTION_POINTS);
      warEvent.addScore(participant.side, FACTION_WAR_SCORING.SUPPORT_ACTION_POINTS);

      // Map action type to objective type
      const objectiveTypeMap: Record<string, WarObjectiveType> = {
        heal: WarObjectiveType.HEAL_ALLIES,
        supply: WarObjectiveType.DELIVER_SUPPLIES,
        scout: WarObjectiveType.SCOUT_POSITIONS,
        recruit: WarObjectiveType.RECRUIT_NPCS,
        fortify: WarObjectiveType.FORTIFY_POSITION,
        rally: WarObjectiveType.RALLY_TROOPS,
      };

      const objectiveType = objectiveTypeMap[actionType];
      if (!objectiveType) {
        await session.commitTransaction();
        return;
      }

      // Find and update support objectives
      const supportObjectives = warEvent
        .getAllObjectives()
        .filter(
          obj =>
            obj.type === objectiveType &&
            !obj.completed &&
            (!obj.completedBy || obj.completedBy === participant.side)
        );

      for (const objective of supportObjectives) {
        objective.current = Math.min(objective.current + 1, objective.target);

        if (objective.current >= objective.target && !objective.completed) {
          objective.completed = true;
          objective.completedBy = participant.side;
          objective.completedAt = new Date();
          warEvent.addScore(participant.side, objective.completionBonus);
          participant.addObjective(objective.id, objective.completionBonus, ContributionType.SUPPORT);
        }
      }

      await warEvent.save({ session });
      await participant.save({ session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error recording support action for war event:', error);
    } finally {
      session.endSession();
    }
  }

  /**
   * Get contribution type for objective type
   */
  private static getContributionType(objectiveType: WarObjectiveType): ContributionType {
    // Combat objectives
    if (
      [
        WarObjectiveType.KILL_NPCS,
        WarObjectiveType.WIN_DUELS,
        WarObjectiveType.DEFEND_LOCATION,
        WarObjectiveType.ESCORT_CONVOY,
        WarObjectiveType.ASSASSINATE_COMMANDER,
        WarObjectiveType.ELIMINATE_SQUAD,
        WarObjectiveType.BREAK_SIEGE,
      ].includes(objectiveType)
    ) {
      return ContributionType.COMBAT;
    }

    // Strategic objectives
    if (
      [
        WarObjectiveType.CAPTURE_POINT,
        WarObjectiveType.DESTROY_SUPPLIES,
        WarObjectiveType.CUT_COMMUNICATIONS,
        WarObjectiveType.SABOTAGE_EQUIPMENT,
        WarObjectiveType.PLANT_FLAG,
        WarObjectiveType.SECURE_BRIDGE,
        WarObjectiveType.INFILTRATE_BASE,
      ].includes(objectiveType)
    ) {
      return ContributionType.STRATEGIC;
    }

    // Support objectives
    return ContributionType.SUPPORT;
  }

  /**
   * Get objectives for a war event
   */
  static async getObjectives(warEventId: string): Promise<IWarObjective[]> {
    const warEvent = await FactionWarEvent.findById(warEventId);
    if (!warEvent) {
      throw new Error('War event not found');
    }

    return warEvent.getAllObjectives();
  }

  /**
   * Get objectives by priority
   */
  static async getObjectivesByPriority(
    warEventId: string,
    priority: ObjectivePriority
  ): Promise<IWarObjective[]> {
    const objectives = await this.getObjectives(warEventId);
    return objectives.filter(obj => obj.priority === priority);
  }
}
