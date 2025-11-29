/**
 * Fortification Service
 *
 * Manages territory fortifications including building, upgrading, and repair
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import mongoose from 'mongoose';
import {
  FactionId,
  FortificationType,
  TerritoryFortification,
  BuildFortificationRequest,
  UpgradeFortificationRequest,
  RepairFortificationRequest,
} from '@desperados/shared';
import {
  TerritoryConquestState,
  ITerritoryConquestState,
} from '../models/TerritoryConquestState.model';
import {
  FORTIFICATION_TYPES,
  calculateUpgradeCost,
  calculateDefenseBonus,
  calculateRepairCost,
  checkFortificationRequirements,
} from '../data/fortificationTypes';

/**
 * Fortification Service Class
 */
export class FortificationService {
  /**
   * Build new fortification
   */
  async buildFortification(
    request: BuildFortificationRequest
  ): Promise<{
    success: boolean;
    fortification?: TerritoryFortification;
    message: string;
    cost?: { gold: number; supplies: number; buildTimeDays: number };
  }> {
    const { territoryId, fortificationType, factionId } = request;

    // Get territory state
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    // Check control
    if (state.currentController !== factionId) {
      return {
        success: false,
        message: 'Only controlling faction can build fortifications',
      };
    }

    // Check if already exists
    const existing = state.fortifications.find((f) => f.type === fortificationType);
    if (existing) {
      return {
        success: false,
        message: 'This fortification type already exists. Use upgrade instead.',
      };
    }

    // Check requirements
    const existingTypes = state.fortifications.map((f) => f.type);
    const reqCheck = checkFortificationRequirements(
      fortificationType,
      50, // Assume controlling faction has sufficient influence
      existingTypes
    );

    if (!reqCheck.canBuild) {
      return {
        success: false,
        message: `Cannot build: ${reqCheck.missingRequirements.join(', ')}`,
      };
    }

    // Get costs
    const fortType = FORTIFICATION_TYPES[fortificationType];
    const cost = fortType.baseCost;

    // Create fortification
    const newFortification: TerritoryFortification = {
      id: `fort_${fortificationType}_${Date.now()}`,
      type: fortificationType,
      level: 1,
      healthPercentage: 100,
      defenseBonus: calculateDefenseBonus(fortificationType, 1, 100),
      constructedAt: new Date(),
    };

    state.fortifications.push(newFortification);
    state.fortificationLevel = Math.max(
      state.fortificationLevel,
      ...state.fortifications.map((f) => f.level)
    );

    // Recalculate total defense bonus
    state.totalDefenseBonus = state.getTotalDefenseBonus();

    await state.save();

    return {
      success: true,
      fortification: newFortification,
      message: `${fortType.name} constructed successfully!`,
      cost,
    };
  }

  /**
   * Upgrade existing fortification
   */
  async upgradeFortification(
    request: UpgradeFortificationRequest
  ): Promise<{
    success: boolean;
    fortification?: TerritoryFortification;
    message: string;
    cost?: { gold: number; supplies: number; buildTimeDays: number };
  }> {
    const { territoryId, fortificationId, factionId } = request;

    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if (state.currentController !== factionId) {
      return {
        success: false,
        message: 'Only controlling faction can upgrade fortifications',
      };
    }

    const fortification = state.fortifications.find((f) => f.id === fortificationId);
    if (!fortification) {
      return {
        success: false,
        message: 'Fortification not found',
      };
    }

    const fortType = FORTIFICATION_TYPES[fortification.type];
    if (fortification.level >= fortType.maxLevel) {
      return {
        success: false,
        message: `${fortType.name} is already at maximum level (${fortType.maxLevel})`,
      };
    }

    // Calculate upgrade cost
    const cost = calculateUpgradeCost(fortification.type, fortification.level);

    // Upgrade
    fortification.level += 1;
    fortification.lastUpgradedAt = new Date();
    fortification.defenseBonus = calculateDefenseBonus(
      fortification.type,
      fortification.level,
      fortification.healthPercentage
    );

    state.fortificationLevel = Math.max(
      state.fortificationLevel,
      ...state.fortifications.map((f) => f.level)
    );

    // Recalculate total defense bonus
    state.totalDefenseBonus = state.getTotalDefenseBonus();

    await state.save();

    return {
      success: true,
      fortification,
      message: `${fortType.name} upgraded to level ${fortification.level}!`,
      cost,
    };
  }

  /**
   * Repair damaged fortification
   */
  async repairFortification(
    request: RepairFortificationRequest
  ): Promise<{
    success: boolean;
    fortification?: TerritoryFortification;
    message: string;
    cost?: { gold: number; supplies: number; repairTimeDays: number };
  }> {
    const { territoryId, fortificationId, factionId } = request;

    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if (state.currentController !== factionId) {
      return {
        success: false,
        message: 'Only controlling faction can repair fortifications',
      };
    }

    const fortification = state.fortifications.find((f) => f.id === fortificationId);
    if (!fortification) {
      return {
        success: false,
        message: 'Fortification not found',
      };
    }

    if (fortification.healthPercentage >= 100) {
      return {
        success: false,
        message: 'Fortification is already at full health',
      };
    }

    const fortType = FORTIFICATION_TYPES[fortification.type];

    // Calculate repair cost
    const cost = calculateRepairCost(
      fortification.type,
      fortification.level,
      fortification.healthPercentage
    );

    // Repair to full health
    fortification.healthPercentage = 100;
    fortification.defenseBonus = calculateDefenseBonus(
      fortification.type,
      fortification.level,
      100
    );

    // Recalculate total defense bonus
    state.totalDefenseBonus = state.getTotalDefenseBonus();

    await state.save();

    return {
      success: true,
      fortification,
      message: `${fortType.name} repaired to full health!`,
      cost,
    };
  }

  /**
   * Get fortification info
   */
  async getFortificationInfo(
    territoryId: string,
    fortificationId: string
  ): Promise<{
    fortification: TerritoryFortification;
    typeDetails: typeof FORTIFICATION_TYPES[FortificationType];
    upgradeCost?: { gold: number; supplies: number; buildTimeDays: number };
    repairCost?: { gold: number; supplies: number; repairTimeDays: number };
  } | null> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) return null;

    const fortification = state.fortifications.find((f) => f.id === fortificationId);
    if (!fortification) return null;

    const typeDetails = FORTIFICATION_TYPES[fortification.type];
    const upgradeCost =
      fortification.level < typeDetails.maxLevel
        ? calculateUpgradeCost(fortification.type, fortification.level)
        : undefined;
    const repairCost =
      fortification.healthPercentage < 100
        ? calculateRepairCost(
            fortification.type,
            fortification.level,
            fortification.healthPercentage
          )
        : undefined;

    return {
      fortification,
      typeDetails,
      upgradeCost,
      repairCost,
    };
  }

  /**
   * Get all fortifications for territory
   */
  async getTerritoryFortifications(territoryId: string): Promise<{
    fortifications: TerritoryFortification[];
    totalDefenseBonus: number;
    averageHealth: number;
    fortificationLevel: number;
    canBuild: FortificationType[];
  } | null> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) return null;

    const existingTypes = state.fortifications.map((f) => f.type);

    // Determine which fortifications can still be built
    const canBuild: FortificationType[] = [];
    for (const type of Object.values(FortificationType)) {
      if (!existingTypes.includes(type)) {
        const reqCheck = checkFortificationRequirements(type, 50, existingTypes);
        if (reqCheck.canBuild) {
          canBuild.push(type);
        }
      }
    }

    const averageHealth =
      state.fortifications.length > 0
        ? state.fortifications.reduce((sum, f) => sum + f.healthPercentage, 0) /
          state.fortifications.length
        : 100;

    return {
      fortifications: state.fortifications,
      totalDefenseBonus: state.totalDefenseBonus,
      averageHealth,
      fortificationLevel: state.fortificationLevel,
      canBuild,
    };
  }

  /**
   * Demolish fortification
   */
  async demolishFortification(
    territoryId: string,
    fortificationId: string,
    factionId: FactionId
  ): Promise<{ success: boolean; message: string }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    if ((state.currentController as any) !== factionId) {
      return {
        success: false,
        message: 'Only controlling faction can demolish fortifications',
      };
    }

    const index = state.fortifications.findIndex((f) => f.id === fortificationId);
    if (index === -1) {
      return {
        success: false,
        message: 'Fortification not found',
      };
    }

    const fort = state.fortifications[index];
    const fortType = FORTIFICATION_TYPES[fort.type];

    state.fortifications.splice(index, 1);

    // Recalculate fortification level
    state.fortificationLevel =
      state.fortifications.length > 0
        ? Math.max(...state.fortifications.map((f) => f.level))
        : 0;

    // Recalculate total defense bonus
    state.totalDefenseBonus = state.getTotalDefenseBonus();

    await state.save();

    return {
      success: true,
      message: `${fortType.name} demolished`,
    };
  }

  /**
   * Apply siege damage to fortifications
   */
  async applySiegeDamage(
    territoryId: string,
    siegeIntensity: number,
    duration: number
  ): Promise<{
    fortificationsDamaged: number;
    damageReport: Array<{
      type: FortificationType;
      damageDealt: number;
      newHealth: number;
      destroyed: boolean;
    }>;
  }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    const damageReport: Array<{
      type: FortificationType;
      damageDealt: number;
      newHealth: number;
      destroyed: boolean;
    }> = [];

    for (const fort of state.fortifications) {
      const fortType = FORTIFICATION_TYPES[fort.type];

      // Base damage calculation
      let baseDamage = siegeIntensity * (duration / 24) * 10;

      // Artillery is more vulnerable
      if (fort.type === FortificationType.ARTILLERY) {
        baseDamage *= 1.3;
      }

      // Walls are more resistant
      if (
        fort.type === FortificationType.WALLS &&
        fortType.specialBonus?.type === 'breach_resistance'
      ) {
        baseDamage *= 1 - fortType.specialBonus.value / 100;
      }

      // Higher level fortifications are slightly more durable
      baseDamage *= 1 - fort.level * 0.02;

      const oldHealth = fort.healthPercentage;
      state.damageFortification(fort.type, baseDamage);

      damageReport.push({
        type: fort.type,
        damageDealt: oldHealth - fort.healthPercentage,
        newHealth: fort.healthPercentage,
        destroyed: fort.healthPercentage <= 0,
      });
    }

    // Remove destroyed fortifications
    state.fortifications = state.fortifications.filter((f) => f.healthPercentage > 0);

    // Recalculate
    state.fortificationLevel =
      state.fortifications.length > 0
        ? Math.max(...state.fortifications.map((f) => f.level))
        : 0;
    state.totalDefenseBonus = state.getTotalDefenseBonus();

    await state.save();

    return {
      fortificationsDamaged: damageReport.filter((d) => d.damageDealt > 0).length,
      damageReport,
    };
  }

  /**
   * Get fortification build recommendations
   */
  async getBuildRecommendations(territoryId: string): Promise<{
    recommended: Array<{
      type: FortificationType;
      priority: number;
      reason: string;
      cost: { gold: number; supplies: number; buildTimeDays: number };
    }>;
  }> {
    const state = await TerritoryConquestState.findByTerritory(territoryId);
    if (!state) {
      throw new Error('Territory conquest state not found');
    }

    const existingTypes = state.fortifications.map((f) => f.type);
    const recommendations: Array<{
      type: FortificationType;
      priority: number;
      reason: string;
      cost: { gold: number; supplies: number; buildTimeDays: number };
    }> = [];

    for (const [type, details] of Object.entries(FORTIFICATION_TYPES)) {
      const fortType = type as FortificationType;

      if (existingTypes.includes(fortType)) continue;

      const reqCheck = checkFortificationRequirements(fortType, 50, existingTypes);
      if (!reqCheck.canBuild) continue;

      let reason = details.description;
      if (state.fortifications.length === 0 && fortType === FortificationType.WALLS) {
        reason = 'Essential first fortification for basic defense';
      } else if (state.totalSiegesDefended > 2 && fortType === FortificationType.WATCHTOWERS) {
        reason = 'Early warning system recommended after multiple sieges';
      } else if (state.fortifications.length >= 3 && fortType === FortificationType.ARTILLERY) {
        reason = 'Powerful offensive capability for well-defended territory';
      }

      recommendations.push({
        type: fortType,
        priority: details.priority,
        reason,
        cost: details.baseCost,
      });
    }

    // Sort by priority
    recommendations.sort((a, b) => a.priority - b.priority);

    return { recommended: recommendations };
  }
}

/**
 * Export singleton instance
 */
export const fortificationService = new FortificationService();
