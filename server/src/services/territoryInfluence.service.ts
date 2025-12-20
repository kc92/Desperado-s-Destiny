/**
 * Territory Influence Service
 *
 * Business logic for faction influence and territory control
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import mongoose from 'mongoose';
import { TerritoryInfluence, ITerritoryInfluenceDocument } from '../models/TerritoryInfluence.model';
import { InfluenceHistory, IInfluenceHistoryDocument } from '../models/InfluenceHistory.model';
import { TERRITORY_DEFINITIONS, getTerritoryDefinition } from '../data/territoryDefinitions';
import {
  TerritoryFactionId,
  FACTION_CONTROL_THRESHOLDS,
  INFLUENCE_DECAY,
  ALIGNMENT_BENEFITS,
  FACTION_NAMES,
  InfluenceSource,
  ControlLevel,
  FactionInfluenceGainResult,
  TerritoryInfluenceSummary,
  FactionOverview,
  AlignmentBenefits,
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * Territory Influence Service
 */
export class TerritoryInfluenceService {
  /**
   * Initialize all territories with base influence
   */
  static async initializeTerritories(): Promise<void> {
    logger.info('Initializing territories with faction influence...');

    for (const def of TERRITORY_DEFINITIONS) {
      const existing = await TerritoryInfluence.findByTerritoryId(def.id);
      if (existing) {
        logger.info(`Territory ${def.name} already initialized, skipping`);
        continue;
      }

      // Create faction influence array
      const factionInfluence = Object.entries(def.initialInfluence).map(([factionId, influence]) => ({
        factionId: factionId as TerritoryFactionId,
        influence,
        trend: 'stable' as const,
        lastChange: 0,
        lastUpdated: new Date(),
      }));

      // Ensure all factions are represented
      for (const faction of Object.values(TerritoryFactionId)) {
        if (!factionInfluence.find((f) => f.factionId === faction)) {
          factionInfluence.push({
            factionId: faction,
            influence: 0,
            trend: 'stable',
            lastChange: 0,
            lastUpdated: new Date(),
          });
        }
      }

      // Create territory influence
      const territory = new TerritoryInfluence({
        territoryId: def.id,
        territoryName: def.name,
        territoryType: def.type,
        factionInfluence,
        stability: def.baseStability,
        lawLevel: def.baseLawLevel,
        economicHealth: def.baseEconomicHealth,
        activeBuffs: [],
        activeDebuffs: [],
        lastDecayAt: new Date(),
      });

      // Calculate initial control
      territory.controlLevel = territory.calculateControlLevel();
      territory.controllingFaction = territory.getControllingFaction();

      if (territory.controlLevel !== ControlLevel.CONTESTED) {
        territory.controlChangedAt = new Date();
      } else {
        territory.contestedSince = new Date();
      }

      await territory.save();
      logger.info(`Initialized territory: ${def.name}`);
    }

    logger.info('Territory initialization complete');
  }

  /**
   * Modify faction influence in a territory
   */
  static async modifyInfluence(
    territoryId: string,
    factionId: TerritoryFactionId,
    amount: number,
    source: InfluenceSource,
    characterId?: string,
    characterName?: string,
    gangId?: string,
    gangName?: string,
    metadata?: Record<string, unknown>
  ): Promise<FactionInfluenceGainResult> {
    const territory = await TerritoryInfluence.findByTerritoryId(territoryId);
    if (!territory) {
      throw new Error(`Territory not found: ${territoryId}`);
    }

    const factionData = territory.factionInfluence.find((f) => f.factionId === factionId);
    if (!factionData) {
      throw new Error(`Faction not found in territory: ${factionId}`);
    }

    // Store old values
    const oldInfluence = factionData.influence;
    const oldControlLevel = territory.controlLevel;
    const oldController = territory.controllingFaction;

    // Update influence
    territory.updateFactionInfluence(factionId, amount);

    // Recalculate control
    const newControlLevel = territory.calculateControlLevel();
    const newController = territory.getControllingFaction();

    // Check for control change
    const controlChanged = oldController !== newController || oldControlLevel !== newControlLevel;

    if (controlChanged) {
      territory.previousController = oldController;
      territory.controllingFaction = newController;
      territory.controlLevel = newControlLevel;
      territory.controlChangedAt = new Date();

      if (newControlLevel === ControlLevel.CONTESTED) {
        territory.contestedSince = new Date();
      } else {
        territory.contestedSince = undefined;
      }

      logger.info(
        `Territory control changed: ${territory.territoryName} - ${oldController || 'None'} (${oldControlLevel}) -> ${newController || 'None'} (${newControlLevel})`
      );
    }

    // Clean expired effects and update trends
    territory.cleanExpiredEffects();
    territory.updateTrends();

    await territory.save();

    // Log influence change
    await InfluenceHistory.create({
      territoryId,
      territoryName: territory.territoryName,
      factionId,
      amount,
      source,
      characterId,
      characterName,
      gangId,
      gangName,
      metadata,
      timestamp: new Date(),
    });

    // Build result message
    let message = `${FACTION_NAMES[factionId]} influence ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount).toFixed(1)} in ${territory.territoryName}`;

    if (controlChanged) {
      if (newController) {
        message += `. ${FACTION_NAMES[newController]} now ${newControlLevel === ControlLevel.DOMINATED ? 'dominates' : 'controls'} the territory!`;
      } else {
        message += '. Territory is now contested!';
      }
    }

    return {
      territoryId,
      territoryName: territory.territoryName,
      factionId,
      influenceGained: amount,
      newInfluence: factionData.influence,
      oldInfluence,
      controlChanged,
      newControlLevel: controlChanged ? newControlLevel : undefined,
      nowControlled: newController !== undefined,
      controllingFaction: newController,
      message,
    };
  }

  /**
   * Apply daily influence decay to all territories
   */
  static async applyDailyDecay(): Promise<void> {
    logger.info('Applying daily influence decay to all territories...');

    const territories = await TerritoryInfluence.find({});
    let decayCount = 0;
    let controlChanges = 0;

    for (const territory of territories) {
      const oldController = territory.controllingFaction;
      const oldControlLevel = territory.controlLevel;

      // Apply decay
      territory.applyDecay(INFLUENCE_DECAY.DAILY_RATE);

      // Recalculate control
      territory.controlLevel = territory.calculateControlLevel();
      territory.controllingFaction = territory.getControllingFaction();

      // Check for control change
      if (oldController !== territory.controllingFaction || oldControlLevel !== territory.controlLevel) {
        territory.previousController = oldController;
        territory.controlChangedAt = new Date();

        if (territory.controlLevel === ControlLevel.CONTESTED) {
          territory.contestedSince = new Date();
        }

        controlChanges++;
        logger.info(
          `Decay caused control change in ${territory.territoryName}: ${oldController || 'None'} -> ${territory.controllingFaction || 'None'}`
        );
      }

      // Update trends and clean effects
      territory.updateTrends();
      territory.cleanExpiredEffects();

      await territory.save();

      // Log decay events for each faction
      for (const faction of territory.factionInfluence) {
        if (faction.lastChange !== 0) {
          await InfluenceHistory.create({
            territoryId: territory.territoryId,
            territoryName: territory.territoryName,
            factionId: faction.factionId,
            amount: faction.lastChange,
            source: InfluenceSource.DAILY_DECAY,
            timestamp: new Date(),
          });
        }
      }

      decayCount++;
    }

    logger.info(
      `Daily decay complete: ${decayCount} territories processed, ${controlChanges} control changes`
    );
  }

  /**
   * Get territory influence summary
   */
  static async getTerritoryInfluence(territoryId: string): Promise<TerritoryInfluenceSummary> {
    const territory = await TerritoryInfluence.findByTerritoryId(territoryId);
    if (!territory) {
      throw new Error(`Territory not found: ${territoryId}`);
    }

    // Sort factions by influence
    const sorted = [...territory.factionInfluence]
      .sort((a, b) => b.influence - a.influence)
      .slice(0, 6); // Top 6 (all factions)

    return {
      territoryId: territory.territoryId,
      territoryName: territory.territoryName,
      territoryType: territory.territoryType,
      controllingFaction: territory.controllingFaction,
      controlLevel: territory.controlLevel,
      topFactions: sorted.map((f) => ({
        factionId: f.factionId,
        influence: f.influence,
        trend: f.trend,
      })),
      stability: territory.stability,
      isContested: territory.controlLevel === ControlLevel.CONTESTED,
    };
  }

  /**
   * Get all territory summaries
   */
  static async getAllTerritories(): Promise<TerritoryInfluenceSummary[]> {
    const territories = await TerritoryInfluence.find({});
    return Promise.all(
      territories.map((t) => this.getTerritoryInfluence(t.territoryId))
    );
  }

  /**
   * Get faction overview across all territories
   */
  static async getFactionOverview(factionId: TerritoryFactionId): Promise<FactionOverview> {
    const territories = await TerritoryInfluence.find({});

    let totalInfluence = 0;
    let dominatedCount = 0;
    let controlledCount = 0;
    let disputedCount = 0;
    let contestedCount = 0;

    for (const territory of territories) {
      const factionData = territory.factionInfluence.find((f) => f.factionId === factionId);
      if (factionData) {
        totalInfluence += factionData.influence;
      }

      if (territory.controllingFaction === factionId) {
        if (territory.controlLevel === ControlLevel.DOMINATED) {
          dominatedCount++;
        } else if (territory.controlLevel === ControlLevel.CONTROLLED) {
          controlledCount++;
        } else if (territory.controlLevel === ControlLevel.DISPUTED) {
          disputedCount++;
        }
      }

      if (territory.controlLevel === ControlLevel.CONTESTED) {
        const sorted = [...territory.factionInfluence].sort((a, b) => b.influence - a.influence);
        if (sorted[0]?.factionId === factionId || sorted[1]?.factionId === factionId) {
          contestedCount++;
        }
      }
    }

    const averageInfluence = territories.length > 0 ? totalInfluence / territories.length : 0;

    // Determine strength
    let strength: 'weak' | 'moderate' | 'strong' | 'dominant';
    const totalControlled = dominatedCount + controlledCount;
    if (totalControlled >= 6) {
      strength = 'dominant';
    } else if (totalControlled >= 3) {
      strength = 'strong';
    } else if (totalControlled >= 1) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }

    return {
      factionId,
      totalTerritories: territories.length,
      dominatedTerritories: dominatedCount,
      controlledTerritories: controlledCount,
      disputedTerritories: disputedCount,
      contestedTerritories: contestedCount,
      totalInfluence,
      averageInfluence,
      strength,
    };
  }

  /**
   * Get alignment benefits for a player
   */
  static async getAlignmentBenefits(
    territoryId: string,
    factionId: TerritoryFactionId
  ): Promise<AlignmentBenefits | null> {
    const territory = await TerritoryInfluence.findByTerritoryId(territoryId);
    if (!territory) {
      return null;
    }

    // Only get benefits if faction controls the territory
    if (territory.controllingFaction !== factionId) {
      return {
        factionId,
        territoryId,
        shopDiscount: 0,
        reputationBonus: 0,
        hasSafeHouse: false,
        jobPriority: false,
        crimeHeatReduction: 0,
      };
    }

    // Get benefits based on control level
    const benefits = ALIGNMENT_BENEFITS[territory.controlLevel];

    return {
      factionId,
      territoryId,
      shopDiscount: benefits.SHOP_DISCOUNT,
      reputationBonus: benefits.REPUTATION_BONUS,
      hasSafeHouse: territory.controlLevel === ControlLevel.CONTROLLED || territory.controlLevel === ControlLevel.DOMINATED,
      jobPriority: territory.controlLevel === ControlLevel.DOMINATED,
      crimeHeatReduction: benefits.CRIME_HEAT_REDUCTION,
    };
  }

  /**
   * Get influence history for a territory
   */
  static async getInfluenceHistory(
    territoryId: string,
    limit: number = 50
  ): Promise<IInfluenceHistoryDocument[]> {
    return InfluenceHistory.findByTerritory(territoryId, limit);
  }

  /**
   * Get character's influence contributions
   */
  static async getCharacterInfluence(
    characterId: string,
    limit: number = 50
  ): Promise<IInfluenceHistoryDocument[]> {
    return InfluenceHistory.findByCharacter(characterId, limit);
  }

  /**
   * Handle gang alignment influence (daily passive gain)
   */
  static async applyGangAlignmentInfluence(
    gangId: string,
    gangName: string,
    territoryId: string,
    factionId: TerritoryFactionId,
    influenceAmount: number
  ): Promise<FactionInfluenceGainResult> {
    return this.modifyInfluence(
      territoryId,
      factionId,
      influenceAmount,
      InfluenceSource.GANG_ALIGNMENT,
      undefined,
      undefined,
      gangId,
      gangName,
      { daily: true }
    );
  }

  /**
   * Handle quest completion influence
   */
  static async applyQuestInfluence(
    territoryId: string,
    factionId: TerritoryFactionId,
    characterId: string,
    characterName: string,
    questId: string,
    influenceAmount: number
  ): Promise<FactionInfluenceGainResult> {
    return this.modifyInfluence(
      territoryId,
      factionId,
      influenceAmount,
      InfluenceSource.FACTION_QUEST,
      characterId,
      characterName,
      undefined,
      undefined,
      { questId }
    );
  }

  /**
   * Handle donation influence
   */
  static async applyDonationInfluence(
    territoryId: string,
    factionId: TerritoryFactionId,
    characterId: string,
    characterName: string,
    donationAmount: number
  ): Promise<FactionInfluenceGainResult> {
    // 1 influence per 100 gold
    const influenceGain = Math.floor(donationAmount / 100);

    return this.modifyInfluence(
      territoryId,
      factionId,
      influenceGain,
      InfluenceSource.FACTION_DONATION,
      characterId,
      characterName,
      undefined,
      undefined,
      { goldDonated: donationAmount }
    );
  }

  /**
   * Handle criminal activity negative influence
   */
  static async applyCrimeInfluence(
    territoryId: string,
    characterId: string,
    characterName: string,
    crimeType: string
  ): Promise<FactionInfluenceGainResult | null> {
    const territory = await TerritoryInfluence.findByTerritoryId(territoryId);
    if (!territory || !territory.controllingFaction) {
      return null;
    }

    // Criminal activity hurts controlling faction
    const influenceLoss = -SecureRNG.range(1, 5); // -1 to -5

    return this.modifyInfluence(
      territoryId,
      territory.controllingFaction,
      influenceLoss,
      InfluenceSource.CRIMINAL_ACTIVITY,
      characterId,
      characterName,
      undefined,
      undefined,
      { crimeType }
    );
  }
}
