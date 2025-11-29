/**
 * Action Effects Service
 *
 * Calculates and applies influence effects from player actions
 * Handles modifiers, spillover, diminishing returns, and milestones
 * Phase 11, Wave 11.1
 */

import mongoose from 'mongoose';
import {
  TerritoryFactionId,
  ActionFactionId,
  DAILY_CONTRIBUTION_LIMITS,
  ContributionMilestone,
  ActionCategory,
  InfluenceChangeResult,
  InfluenceModifiers,
  MilestoneReward,
} from '@desperados/shared';
import { actionFactionToTerritoryFaction } from '@desperados/shared';
import { Character, ICharacter } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import {
  PlayerInfluenceContribution,
  IPlayerInfluenceContribution,
} from '../models/PlayerInfluenceContribution.model';
import {
  ACTION_INFLUENCE_MAP,
  FACTION_SPILLOVER_RULES,
  TERRITORY_VOLATILITY_MAP,
  DEFAULT_TERRITORY_VOLATILITY,
} from '../data/actionInfluenceMap';
import logger from '../utils/logger';

/**
 * Action Effects Service
 */
export class ActionEffectsService {
  /**
   * Apply influence effect from a player action
   */
  static async applyActionInfluence(
    characterId: mongoose.Types.ObjectId,
    actionCategory: ActionCategory,
    territoryId?: string,
    targetFactionOverride?: TerritoryFactionId
  ): Promise<InfluenceChangeResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Get action definition
      const actionDef = ACTION_INFLUENCE_MAP[actionCategory];
      if (!actionDef) {
        throw new Error(`Unknown action category: ${actionCategory}`);
      }

      // Determine target faction (convert ActionFactionId to TerritoryFactionId)
      let targetFaction: TerritoryFactionId;
      if (targetFactionOverride) {
        targetFaction = targetFactionOverride;
      } else if (actionDef.primaryFaction) {
        const converted = actionFactionToTerritoryFaction(actionDef.primaryFaction);
        if (!converted) {
          throw new Error(`Cannot convert action faction ${actionDef.primaryFaction} to territory faction`);
        }
        targetFaction = converted;
      } else {
        throw new Error('Target faction must be specified for this action');
      }

      // Calculate modifiers
      const modifiers = await this.calculateModifiers(
        character,
        targetFaction,
        territoryId
      );

      // Check diminishing returns
      const diminishingMultiplier = await this.calculateDiminishingReturns(
        characterId,
        actionCategory,
        actionDef
      );

      // Calculate final influence amount
      const baseInfluence = actionDef.baseInfluence;
      const modifiedInfluence = this.applyModifiers(baseInfluence, modifiers, diminishingMultiplier);

      // Clamp to min/max
      const finalInfluence = Math.max(
        actionDef.minInfluence,
        Math.min(actionDef.maxInfluence, modifiedInfluence)
      );

      // Get or create contribution record
      let contribution = await PlayerInfluenceContribution.findByCharacter(
        characterId,
        targetFaction
      );

      if (!contribution) {
        contribution = new PlayerInfluenceContribution({
          characterId,
          characterName: character.name,
          factionId: targetFaction,
          totalInfluenceContributed: 0,
          currentMilestone: null,
          milestonesAchieved: [],
          contributionsByType: [],
          contributionsByTerritory: [],
          dailyContributions: [],
          weeklyInfluence: 0,
          monthlyInfluence: 0,
          totalActionsPerformed: 0,
        });
      }

      // Add contribution and check for milestone
      const milestoneReached = contribution.addContribution(
        Math.abs(finalInfluence),
        actionCategory,
        territoryId
      );

      // Recalculate weekly and monthly
      contribution.calculateWeeklyInfluence();
      contribution.calculateMonthlyInfluence();

      await contribution.save({ session });

      // Calculate spillover effects
      const secondaryChanges = await this.calculateSpilloverEffects(
        targetFaction,
        finalInfluence,
        actionDef.primaryDirection
      );

      // Apply secondary effects to other factions
      for (const secondaryEffect of secondaryChanges) {
        let secondaryContribution = await PlayerInfluenceContribution.findByCharacter(
          characterId,
          secondaryEffect.factionId
        );

        if (!secondaryContribution) {
          secondaryContribution = new PlayerInfluenceContribution({
            characterId,
            characterName: character.name,
            factionId: secondaryEffect.factionId,
            totalInfluenceContributed: 0,
            currentMilestone: null,
            milestonesAchieved: [],
            contributionsByType: [],
            contributionsByTerritory: [],
            dailyContributions: [],
            weeklyInfluence: 0,
            monthlyInfluence: 0,
            totalActionsPerformed: 0,
          });
        }

        secondaryContribution.addContribution(
          Math.abs(secondaryEffect.influenceChange),
          actionCategory,
          territoryId
        );

        secondaryContribution.calculateWeeklyInfluence();
        secondaryContribution.calculateMonthlyInfluence();

        await secondaryContribution.save({ session });
      }

      // Get milestone rewards if reached
      let milestoneRewards: MilestoneReward | undefined;
      if (milestoneReached) {
        milestoneRewards = this.getMilestoneReward(milestoneReached, targetFaction);
      }

      // Calculate leaderboard rank (optional, can be cached)
      const rank = await PlayerInfluenceContribution.getCharacterRank(
        characterId,
        targetFaction
      );

      await session.commitTransaction();

      const result: InfluenceChangeResult = {
        success: true,
        characterId: characterId.toString(),
        actionCategory,
        primaryFaction: targetFaction,
        primaryInfluenceChange: finalInfluence,
        secondaryChanges,
        modifiersApplied: {
          base: baseInfluence,
          characterLevel: modifiers.characterLevelBonus,
          reputation: modifiers.reputationBonus,
          gang: modifiers.gangBonus,
          event: modifiers.eventBonus,
          territory: modifiers.territoryMultiplier,
          skill: modifiers.skillBonus,
          total: finalInfluence,
        },
        newTotalContribution: contribution.totalInfluenceContributed,
        milestoneReached,
        milestoneRewards,
        territoryId,
        territoryInfluenceChanged: !!territoryId,
        leaderboardRankChange: rank,
      };

      logger.info(
        `Applied action influence: ${character.name} performed ${actionCategory}, ` +
        `${finalInfluence > 0 ? '+' : ''}${finalInfluence} to ${targetFaction}`
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error applying action influence:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Calculate all modifiers for an action
   */
  private static async calculateModifiers(
    character: ICharacter,
    targetFaction: TerritoryFactionId,
    territoryId?: string
  ): Promise<InfluenceModifiers> {
    // Character level bonus: +1% per level above 10
    const characterLevelBonus = Math.max(0, (character.level - 10) * 0.01);

    // Reputation bonus: +1% per 100 reputation
    const reputationBonus = this.getReputationBonus(character, targetFaction);

    // Gang bonus: +10-30% if gang aligned with faction
    const gangBonus = await this.getGangBonus(character, targetFaction);

    // Event bonus: Check for active events (placeholder for now)
    const eventBonus = 0; // TODO: Implement event system

    // Territory multiplier
    const territoryMultiplier = territoryId
      ? this.getTerritoryMultiplier(territoryId)
      : 1.0;

    // Skill bonus: Based on relevant skills
    const skillBonus = this.getSkillBonus(character);

    return {
      characterLevelBonus,
      reputationBonus,
      gangBonus,
      eventBonus,
      territoryMultiplier,
      skillBonus,
    };
  }

  /**
   * Get reputation bonus for faction
   */
  private static getReputationBonus(character: ICharacter, faction: TerritoryFactionId): number {
    let reputation = 0;

    switch (faction) {
      case TerritoryFactionId.SETTLER_ALLIANCE:
        reputation = character.factionReputation.settlerAlliance;
        break;
      case TerritoryFactionId.NAHI_COALITION:
        reputation = character.factionReputation.nahiCoalition;
        break;
      case TerritoryFactionId.FRONTERA_CARTEL:
        reputation = character.factionReputation.frontera;
        break;
      case TerritoryFactionId.INDEPENDENT_OUTLAWS:
        reputation = character.criminalReputation;
        break;
      default:
        reputation = 0;
    }

    // +1% per 100 reputation (can go negative)
    return (reputation / 100) * 0.01;
  }

  /**
   * Get gang alignment bonus
   */
  private static async getGangBonus(
    character: ICharacter,
    faction: TerritoryFactionId
  ): Promise<number> {
    if (!character.gangId) {
      return 0;
    }

    const gang = await Gang.findById(character.gangId);
    if (!gang) {
      return 0;
    }

    // Check if gang has faction alignment (simplified, can be expanded)
    // For now, assume gang level affects bonus
    const gangLevel = gang.level || 1;
    return Math.min(0.30, gangLevel * 0.03); // +3% per gang level, max 30%
  }

  /**
   * Get territory volatility multiplier
   */
  private static getTerritoryMultiplier(territoryId: string): number {
    const volatility = TERRITORY_VOLATILITY_MAP[territoryId] || DEFAULT_TERRITORY_VOLATILITY;
    return volatility.volatilityMultiplier;
  }

  /**
   * Get skill-based bonus
   */
  private static getSkillBonus(character: ICharacter): number {
    // Calculate average skill level and provide small bonus
    let totalSkillLevel = 0;
    let skillCount = 0;

    for (const skill of character.skills) {
      totalSkillLevel += skill.level;
      skillCount++;
    }

    if (skillCount === 0) {
      return 0;
    }

    const averageSkillLevel = totalSkillLevel / skillCount;
    return Math.min(0.20, averageSkillLevel * 0.02); // +2% per avg skill level, max 20%
  }

  /**
   * Apply all modifiers to base influence
   */
  private static applyModifiers(
    baseInfluence: number,
    modifiers: InfluenceModifiers,
    diminishingMultiplier: number
  ): number {
    // Apply percentage modifiers
    let multiplier = 1.0;
    multiplier += modifiers.characterLevelBonus;
    multiplier += modifiers.reputationBonus;
    multiplier += modifiers.gangBonus;
    multiplier += modifiers.eventBonus;
    multiplier += modifiers.skillBonus;
    multiplier *= modifiers.territoryMultiplier;
    multiplier *= diminishingMultiplier;

    return Math.round(baseInfluence * multiplier);
  }

  /**
   * Calculate diminishing returns based on daily action count
   */
  private static async calculateDiminishingReturns(
    characterId: mongoose.Types.ObjectId,
    actionCategory: ActionCategory,
    actionDef: any
  ): Promise<number> {
    if (!actionDef.diminishingReturns) {
      return 1.0;
    }

    // Count actions performed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contributions = await PlayerInfluenceContribution.find({
      characterId,
      'dailyContributions.date': today,
    });

    let totalActionsToday = 0;
    for (const contrib of contributions) {
      const todayEntry = contrib.dailyContributions.find(
        d => d.date.getTime() === today.getTime()
      );
      if (todayEntry) {
        totalActionsToday += todayEntry.actionCount;
      }
    }

    // Check if over diminishing threshold
    const { diminishingAfter, diminishingRate } = actionDef.diminishingReturns;

    if (totalActionsToday <= diminishingAfter) {
      return 1.0;
    }

    // Apply diminishing returns
    const actionsOverLimit = totalActionsToday - diminishingAfter;
    return Math.pow(diminishingRate, actionsOverLimit);
  }

  /**
   * Calculate spillover effects to other factions
   */
  private static async calculateSpilloverEffects(
    primaryFaction: TerritoryFactionId,
    primaryInfluence: number,
    direction: 'positive' | 'negative'
  ): Promise<Array<{ factionId: TerritoryFactionId; influenceChange: number; reason: string }>> {
    const spilloverRule = FACTION_SPILLOVER_RULES.find(
      r => {
        const converted = actionFactionToTerritoryFaction(r.primaryFaction);
        return converted === primaryFaction;
      }
    );

    if (!spilloverRule) {
      return [];
    }

    const effects: Array<{ factionId: TerritoryFactionId; influenceChange: number; reason: string }> = [];

    // Apply to antagonists
    for (const antagonist of spilloverRule.antagonists) {
      const converted = actionFactionToTerritoryFaction(antagonist.factionId);
      if (!converted) continue;

      const spilloverAmount = Math.round(Math.abs(primaryInfluence) * antagonist.spilloverRate);
      effects.push({
        factionId: converted,
        influenceChange: direction === 'positive' ? -spilloverAmount : spilloverAmount,
        reason: `Antagonist faction spillover from ${primaryFaction}`,
      });
    }

    // Apply to allies
    for (const ally of spilloverRule.allies) {
      const converted = actionFactionToTerritoryFaction(ally.factionId);
      if (!converted) continue;

      const spilloverAmount = Math.round(Math.abs(primaryInfluence) * ally.spilloverRate);
      effects.push({
        factionId: converted,
        influenceChange: direction === 'positive' ? spilloverAmount : -spilloverAmount,
        reason: `Allied faction spillover from ${primaryFaction}`,
      });
    }

    return effects;
  }

  /**
   * Get milestone reward configuration
   */
  private static getMilestoneReward(
    milestone: ContributionMilestone,
    factionId: TerritoryFactionId
  ): MilestoneReward {
    const baseRewards: Record<ContributionMilestone, Partial<MilestoneReward>> = {
      [ContributionMilestone.ALLY]: {
        milestone: ContributionMilestone.ALLY,
        rewards: {
          title: `${factionId} Ally`,
          cosmetics: [`${factionId.toLowerCase()}_bandana`],
          abilities: [],
          quests: [`${factionId.toLowerCase()}_ally_quest`],
          goldBonus: 500,
          xpBonus: 100,
        },
      },
      [ContributionMilestone.CHAMPION]: {
        milestone: ContributionMilestone.CHAMPION,
        rewards: {
          title: `${factionId} Champion`,
          cosmetics: [
            `${factionId.toLowerCase()}_vest`,
            `${factionId.toLowerCase()}_hat`,
          ],
          abilities: [`${factionId.toLowerCase()}_champion_perk`],
          quests: [`${factionId.toLowerCase()}_champion_quest`],
          goldBonus: 2000,
          xpBonus: 500,
        },
      },
      [ContributionMilestone.HERO]: {
        milestone: ContributionMilestone.HERO,
        rewards: {
          title: `${factionId} Hero`,
          cosmetics: [
            `${factionId.toLowerCase()}_coat`,
            `${factionId.toLowerCase()}_boots`,
          ],
          abilities: [
            `${factionId.toLowerCase()}_hero_perk`,
            `${factionId.toLowerCase()}_hero_ability`,
          ],
          quests: [`${factionId.toLowerCase()}_hero_quest`],
          goldBonus: 5000,
          xpBonus: 1500,
        },
      },
      [ContributionMilestone.LEGEND]: {
        milestone: ContributionMilestone.LEGEND,
        rewards: {
          title: `${factionId} Legend`,
          cosmetics: [
            `${factionId.toLowerCase()}_legendary_outfit`,
            `${factionId.toLowerCase()}_legendary_weapon`,
          ],
          abilities: [
            `${factionId.toLowerCase()}_legend_perk`,
            `${factionId.toLowerCase()}_legend_ability`,
            `${factionId.toLowerCase()}_legend_ultimate`,
          ],
          quests: [`${factionId.toLowerCase()}_legend_quest`],
          goldBonus: 10000,
          xpBonus: 3000,
        },
      },
      [ContributionMilestone.MYTHIC]: {
        milestone: ContributionMilestone.MYTHIC,
        rewards: {
          title: `${factionId} Mythic`,
          cosmetics: [
            `${factionId.toLowerCase()}_mythic_outfit`,
            `${factionId.toLowerCase()}_mythic_weapon`,
            `${factionId.toLowerCase()}_mythic_mount`,
          ],
          abilities: [
            `${factionId.toLowerCase()}_mythic_perk`,
            `${factionId.toLowerCase()}_mythic_ability`,
            `${factionId.toLowerCase()}_mythic_ultimate`,
            `${factionId.toLowerCase()}_mythic_passive`,
          ],
          quests: [`${factionId.toLowerCase()}_mythic_quest`],
          goldBonus: 25000,
          xpBonus: 7500,
        },
      },
    };

    return {
      ...baseRewards[milestone],
      factionId,
    } as MilestoneReward;
  }

  /**
   * Get player's current contribution for a faction
   */
  static async getPlayerContribution(
    characterId: mongoose.Types.ObjectId,
    factionId: TerritoryFactionId
  ): Promise<IPlayerInfluenceContribution | null> {
    return PlayerInfluenceContribution.findByCharacter(characterId, factionId);
  }

  /**
   * Get all contributions for a character across all factions
   */
  static async getAllPlayerContributions(
    characterId: mongoose.Types.ObjectId
  ): Promise<IPlayerInfluenceContribution[]> {
    return PlayerInfluenceContribution.find({ characterId }).sort({ totalInfluenceContributed: -1 });
  }
}
