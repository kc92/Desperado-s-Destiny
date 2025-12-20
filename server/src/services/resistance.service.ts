/**
 * Resistance Service
 *
 * Manages post-conquest resistance, underground activities, and liberation campaigns
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import mongoose from 'mongoose';
import {
  FactionId,
  ResistanceActivityType,
  ResistanceActivity,
  ResistanceActionRequest,
  LiberationCampaign,
  DiplomaticSolution,
  CONQUEST_CONSTANTS,
} from '@desperados/shared';
import {
  TerritoryConquestState,
  ITerritoryConquestState,
} from '../models/TerritoryConquestState.model';
import { RESISTANCE_ACTIVITIES, LIBERATION_CONFIG } from '../data/conquestConfig';
import { SecureRNG } from './base/SecureRNG';

/**
 * Resistance Service Class
 */
export class ResistanceService {
  /**
   * Execute resistance action
   */
  async executeResistanceAction(
    request: ResistanceActionRequest
  ): Promise<{
    success: boolean;
    activity?: ResistanceActivity;
    message: string;
    effects?: {
      influenceDamage?: number;
      efficiencyDamage?: number;
      resourcesStolen?: number;
      resistanceGained?: number;
    };
    consequences?: {
      caught: boolean;
      penalty?: string;
    };
  }> {
    const { territoryId, activityType, faction, resourcesCommitted } = request;

    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    // Can't resist your own territory
    if (state.currentController === faction) {
      return {
        success: false,
        message: 'Cannot conduct resistance in territory you control',
      };
    }

    // Get activity config
    const activityConfig = RESISTANCE_ACTIVITIES[activityType];

    // Check cost
    if (resourcesCommitted < activityConfig.cost) {
      return {
        success: false,
        message: `Insufficient resources. Need ${activityConfig.cost} gold`,
      };
    }

    // Determine success
    const succeeded = SecureRNG.chance(activityConfig.successRate);

    if (!succeeded) {
      // Failed - possibly caught
      const caught = !SecureRNG.chance(activityConfig.successRate);

      return {
        success: false,
        message: `Resistance action failed!`,
        consequences: caught
          ? {
              caught: true,
              penalty: activityConfig.consequences.ifCaught,
            }
          : undefined,
      };
    }

    // Success - create activity
    const activity: ResistanceActivity = {
      id: `resist_${activityType}_${Date.now()}`,
      type: activityType,
      faction,
      strength: 0,
      frequency: 1,
      lastOccurred: new Date(),
      effectDescription: activityConfig.description,
      active: true,
    };

    const effects: {
      influenceDamage?: number;
      efficiencyDamage?: number;
      resourcesStolen?: number;
      resistanceGained?: number;
    } = {};

    // Apply effects based on type
    switch (activityType) {
      case ResistanceActivityType.SABOTAGE: {
        const config = activityConfig as typeof RESISTANCE_ACTIVITIES[ResistanceActivityType.SABOTAGE];
        effects.influenceDamage = config.influenceDamage;
        effects.efficiencyDamage = config.efficiencyDamage * 100;
        activity.strength = config.influenceDamage;
        state.occupationEfficiency = Math.max(
          10,
          state.occupationEfficiency - effects.efficiencyDamage
        );
        break;
      }

      case ResistanceActivityType.GUERRILLA: {
        const config = activityConfig as typeof RESISTANCE_ACTIVITIES[ResistanceActivityType.GUERRILLA];
        effects.influenceDamage = config.influenceDamage;
        activity.strength = config.influenceDamage;
        break;
      }

      case ResistanceActivityType.PROPAGANDA: {
        const config = activityConfig as typeof RESISTANCE_ACTIVITIES[ResistanceActivityType.PROPAGANDA];
        effects.resistanceGained = config.resistanceStrength;
        activity.strength = config.resistanceStrength;
        break;
      }

      case ResistanceActivityType.SMUGGLING: {
        const config = activityConfig as typeof RESISTANCE_ACTIVITIES[ResistanceActivityType.SMUGGLING];
        effects.resourcesStolen = config.resourceTheft;
        activity.strength = 5;
        break;
      }

      case ResistanceActivityType.RECRUITMENT: {
        const config = activityConfig as typeof RESISTANCE_ACTIVITIES[ResistanceActivityType.RECRUITMENT];
        effects.resistanceGained = config.resistanceStrength;
        activity.strength = config.resistanceStrength;
        break;
      }
    }

    // Add activity to state
    state.addResistanceActivity(activity);
    await state.save();

    return {
      success: true,
      activity,
      message: `${activityConfig.name} executed successfully!`,
      effects,
    };
  }

  /**
   * Process daily resistance effects
   */
  async processDailyResistance(): Promise<{
    territoriesAffected: number;
    totalInfluenceDrained: number;
    totalEfficiencyLost: number;
  }> {
    const territories = await TerritoryConquestState.findWithActiveResistance();

    let territoriesAffected = 0;
    let totalInfluenceDrained = 0;
    let totalEfficiencyLost = 0;

    for (const territory of territories) {
      if (territory.resistanceStrength === 0) continue;

      // Calculate daily influence drain
      const baseInfluenceDrain = CONQUEST_CONSTANTS.RESISTANCE_BASE_DRAIN;
      const strengthMultiplier = territory.resistanceStrength / 100;
      const influenceDrain = baseInfluenceDrain * strengthMultiplier;

      // Calculate efficiency loss
      const efficiencyLoss = Math.min(5, territory.resistanceStrength / 20);

      totalInfluenceDrained += influenceDrain;
      totalEfficiencyLost += efficiencyLoss;

      // Apply effects
      territory.occupationEfficiency = Math.max(10, territory.occupationEfficiency - efficiencyLoss);

      // Decay resistance over time
      const activeActivities = territory.resistanceActivities.filter((a) => a.active);
      for (const activity of activeActivities) {
        const daysSinceLastOccurred =
          (Date.now() - activity.lastOccurred.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLastOccurred > 7) {
          // Deactivate old activities
          activity.active = false;
        }
      }

      // Recalculate resistance strength
      const stillActive = territory.resistanceActivities.filter((a) => a.active);
      territory.resistanceStrength = Math.min(
        100,
        stillActive.reduce((sum, a) => sum + a.strength, 0)
      );
      territory.hasActiveResistance = territory.resistanceStrength > 0;

      await territory.save();
      territoriesAffected++;
    }

    return {
      territoriesAffected,
      totalInfluenceDrained,
      totalEfficiencyLost,
    };
  }

  /**
   * Start liberation campaign
   */
  async startLiberationCampaign(
    territoryId: string,
    liberatingFaction: FactionId,
    initialResources: { gold: number; supplies: number; troops: number }
  ): Promise<{
    success: boolean;
    campaign?: Partial<LiberationCampaign>;
    message: string;
    requirements?: string[];
  }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    // Check if liberating faction was previous controller
    const wasPreviousController = state.previousControllers.some(
      (c) => (c.previousController as any) === liberatingFaction
    );

    if (!wasPreviousController && (state.currentController as any) !== liberatingFaction) {
      return {
        success: false,
        message: 'Must have previously controlled this territory to start liberation campaign',
      };
    }

    // Check minimum resistance strength
    if (state.resistanceStrength < LIBERATION_CONFIG.minimumResistanceStrength) {
      return {
        success: false,
        message: `Need at least ${LIBERATION_CONFIG.minimumResistanceStrength} resistance strength`,
        requirements: [
          `Current resistance: ${state.resistanceStrength}`,
          `Required: ${LIBERATION_CONFIG.minimumResistanceStrength}`,
        ],
      };
    }

    // Check resources
    const resourceRequirements = LIBERATION_CONFIG.resourceRequirements;
    if (
      initialResources.gold < resourceRequirements.gold ||
      initialResources.supplies < resourceRequirements.supplies ||
      initialResources.troops < resourceRequirements.troops
    ) {
      return {
        success: false,
        message: 'Insufficient resources for liberation campaign',
        requirements: [
          `Gold: ${resourceRequirements.gold} (have: ${initialResources.gold})`,
          `Supplies: ${resourceRequirements.supplies} (have: ${initialResources.supplies})`,
          `Troops: ${resourceRequirements.troops} (have: ${initialResources.troops})`,
        ],
      };
    }

    // Create campaign (in real implementation, this would be a separate model)
    const campaign: Partial<LiberationCampaign> = {
      territoryId,
      liberatingFaction: liberatingFaction as any,
      occupyingFaction: state.currentController as any,
      currentInfluence: state.resistanceStrength / 2.5, // Convert resistance to influence
      targetInfluence: LIBERATION_CONFIG.influenceThreshold,
      supportersCount: 0,
      resourcesGathered: initialResources,
      startedAt: new Date(),
      active: true,
    };

    // Estimate completion time
    const influenceNeeded = campaign.targetInfluence! - campaign.currentInfluence!;
    const daysEstimated = influenceNeeded * LIBERATION_CONFIG.timeEstimate.perInfluencePoint;
    const estimatedCompletionAt = new Date(Date.now() + daysEstimated * 24 * 60 * 60 * 1000);

    return {
      success: true,
      campaign: {
        ...campaign,
        estimatedCompletionAt,
      },
      message: `Liberation campaign started! Estimated ${Math.ceil(daysEstimated)} days to reach siege threshold`,
    };
  }

  /**
   * Propose diplomatic solution
   */
  async proposeDiplomaticSolution(
    territoryId: string,
    proposingFaction: FactionId,
    targetFaction: FactionId,
    solutionType: 'partial_return' | 'power_sharing' | 'tribute' | 'truce',
    customTerms?: Partial<DiplomaticSolution['terms']>
  ): Promise<{
    success: boolean;
    proposal?: Partial<DiplomaticSolution>;
    message: string;
    acceptanceChance?: number;
  }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if ((state.currentController as any) !== targetFaction) {
      return {
        success: false,
        message: 'Target faction does not control this territory',
      };
    }

    // Get default terms from config
    const { DIPLOMATIC_SOLUTIONS } = await import('../data/conquestConfig');
    const solutionConfig = DIPLOMATIC_SOLUTIONS[solutionType];

    // Build terms based on solution type
    let defaultTerms: DiplomaticSolution['terms'];
    if ('influenceShare' in solutionConfig) {
      defaultTerms = {
        influenceShare: solutionConfig.influenceShare,
        goldPayment: 'goldCost' in solutionConfig ? solutionConfig.goldCost : undefined,
        duration: solutionConfig.duration,
      };
    } else if ('goldPerDay' in solutionConfig) {
      defaultTerms = {
        goldPayment: solutionConfig.goldPerDay,
        duration: solutionConfig.duration,
      };
    } else {
      defaultTerms = {
        goldPayment: 'goldCost' in solutionConfig ? solutionConfig.goldCost : undefined,
        duration: solutionConfig.duration,
      };
    }

    const proposal: Partial<DiplomaticSolution> = {
      territoryId,
      proposingFaction: proposingFaction as any,
      targetFaction: targetFaction as any,
      solutionType,
      terms: customTerms || defaultTerms,
      status: 'proposed',
      proposedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to respond
    };

    return {
      success: true,
      proposal,
      message: `${solutionConfig.name} proposed. Awaiting response from ${targetFaction}`,
      acceptanceChance: solutionConfig.acceptanceChance,
    };
  }

  /**
   * Accept diplomatic solution
   */
  async acceptDiplomaticSolution(
    proposalId: string,
    acceptingFaction: FactionId
  ): Promise<{
    success: boolean;
    message: string;
    effects?: {
      influenceChange?: number;
      goldTransfer?: number;
      accessGranted?: boolean;
    };
  }> {
    // In real implementation, would fetch proposal from database
    // For now, just return success pattern

    return {
      success: true,
      message: 'Diplomatic solution accepted',
      effects: {
        influenceChange: 30,
        goldTransfer: 5000,
        accessGranted: true,
      },
    };
  }

  /**
   * Get resistance activities for territory
   */
  async getResistanceActivities(territoryId: string): Promise<{
    activities: ResistanceActivity[];
    totalStrength: number;
    factions: FactionId[];
    recentActions: number;
  } | null> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) return null;

    const activeActivities = state.resistanceActivities.filter((a) => a.active);
    const factionsSet = new Set(activeActivities.map((a) => a.faction));
    const factions = Array.from(factionsSet);

    // Count recent actions (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActions = activeActivities.filter(
      (a) => a.lastOccurred >= sevenDaysAgo
    ).length;

    return {
      activities: activeActivities,
      totalStrength: state.resistanceStrength,
      factions: factions as any,
      recentActions,
    };
  }

  /**
   * Suppress resistance (counter-resistance by occupier)
   */
  async suppressResistance(
    territoryId: string,
    controllingFaction: FactionId,
    resourcesCommitted: number
  ): Promise<{
    success: boolean;
    message: string;
    resistanceReduced: number;
    activitiesEliminated: number;
  }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if ((state.currentController as any) !== controllingFaction) {
      return {
        success: false,
        message: 'Only controlling faction can suppress resistance',
        resistanceReduced: 0,
        activitiesEliminated: 0,
      };
    }

    // Calculate suppression effectiveness
    const baseSuppressionRate = 10; // 10% per 1000 gold
    const suppressionPower = (resourcesCommitted / 1000) * baseSuppressionRate;
    const resistanceReduction = Math.min(state.resistanceStrength, suppressionPower);

    // Eliminate some activities
    const eliminationChance = suppressionPower / 100;
    let activitiesEliminated = 0;

    for (const activity of state.resistanceActivities) {
      if (!activity.active) continue;

      if (SecureRNG.chance(eliminationChance)) {
        activity.active = false;
        activitiesEliminated++;
      }
    }

    // Recalculate resistance
    const stillActive = state.resistanceActivities.filter((a) => a.active);
    state.resistanceStrength = Math.max(
      0,
      Math.min(100, stillActive.reduce((sum, a) => sum + a.strength, 0)) - resistanceReduction
    );
    state.hasActiveResistance = state.resistanceStrength > 0;

    await state.save();

    return {
      success: true,
      message: `Suppression campaign reduced resistance by ${Math.round(resistanceReduction)}%`,
      resistanceReduced: resistanceReduction,
      activitiesEliminated,
    };
  }

  /**
   * Get available resistance actions for faction
   */
  async getAvailableResistanceActions(
    territoryId: string,
    faction: FactionId
  ): Promise<{
    availableActions: Array<{
      type: ResistanceActivityType;
      name: string;
      description: string;
      cost: number;
      successRate: number;
      estimatedImpact: string;
      cooldownHours: number;
    }>;
  }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if ((state.currentController as any) === faction) {
      return { availableActions: [] };
    }

    const availableActions = Object.entries(RESISTANCE_ACTIVITIES).map(([type, config]) => {
      let estimatedImpact = '';

      if ('influenceDamage' in config) {
        estimatedImpact = `${config.influenceDamage} influence damage`;
      } else if ('influenceGain' in config) {
        estimatedImpact = `${config.influenceGain} influence gain`;
      } else if ('resistanceStrength' in config) {
        estimatedImpact = `${config.resistanceStrength} resistance strength`;
      } else if ('resourceTheft' in config) {
        estimatedImpact = `${config.resourceTheft} resources stolen`;
      }

      return {
        type: type as ResistanceActivityType,
        name: config.name,
        description: config.description,
        cost: config.cost,
        successRate: config.successRate,
        estimatedImpact,
        cooldownHours: config.cooldownHours,
      };
    });

    return { availableActions };
  }
}

/**
 * Export singleton instance
 */
export const resistanceService = new ResistanceService();
