/**
 * Territory Service
 *
 * Handles territory management, benefits, and conquest
 */

import mongoose from 'mongoose';
import { Territory, ITerritory } from '../models/Territory.model';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import { seedTerritories } from '../seeds/territories.seed';
import logger from '../utils/logger';

export class TerritoryService {
  /**
   * Seed all territories into database
   * Idempotent - safe to call multiple times
   */
  static async seedTerritories(): Promise<void> {
    return seedTerritories();
  }

  /**
   * Get all territories with populated gang info
   */
  static async getTerritories(): Promise<ITerritory[]> {
    return Territory.find()
      .populate('controllingGangId', 'name tag')
      .sort({ difficulty: 1, name: 1 })
      .lean() as unknown as ITerritory[];
  }

  /**
   * Get single territory by ID
   */
  static async getTerritory(id: string): Promise<ITerritory> {
    const territory = await Territory.findBySlug(id);

    if (!territory) {
      throw new Error(`Territory not found: ${id}`);
    }

    return territory;
  }

  /**
   * Get all territories controlled by a gang
   */
  static async getGangTerritories(gangId: mongoose.Types.ObjectId): Promise<ITerritory[]> {
    return Territory.findControlledByGang(gangId);
  }

  /**
   * Apply territory benefits to rewards
   * Calculates bonuses from all territories controlled by character's gang
   *
   * @param characterId - Character receiving rewards
   * @param baseGold - Base gold amount before bonuses
   * @param baseXP - Base XP amount before bonuses
   * @returns Modified gold and XP with territory bonuses applied
   */
  static async applyTerritoryBenefits(
    characterId: mongoose.Types.ObjectId,
    baseGold: number,
    baseXP: number
  ): Promise<{ gold: number; xp: number; bonusApplied: boolean }> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { gold: baseGold, xp: baseXP, bonusApplied: false };
      }

      const gang = await Gang.findByMember(characterId);
      if (!gang) {
        return { gold: baseGold, xp: baseXP, bonusApplied: false };
      }

      const territories = await this.getGangTerritories(gang._id as mongoose.Types.ObjectId);
      if (territories.length === 0) {
        return { gold: baseGold, xp: baseXP, bonusApplied: false };
      }

      let totalGoldBonus = 0;
      let totalXPBonus = 0;

      for (const territory of territories) {
        totalGoldBonus += territory.benefits.goldBonus;
        totalXPBonus += territory.benefits.xpBonus;
      }

      const modifiedGold = Math.floor(baseGold * (1 + totalGoldBonus / 100));
      const modifiedXP = Math.floor(baseXP * (1 + totalXPBonus / 100));

      logger.info(
        `Applied territory benefits for ${character.name}: ` +
        `Gold ${baseGold} -> ${modifiedGold} (+${totalGoldBonus}%), ` +
        `XP ${baseXP} -> ${modifiedXP} (+${totalXPBonus}%)`
      );

      return {
        gold: modifiedGold,
        xp: modifiedXP,
        bonusApplied: true,
      };
    } catch (error) {
      logger.error('Error applying territory benefits:', error);
      return { gold: baseGold, xp: baseXP, bonusApplied: false };
    }
  }

  /**
   * Get total energy regen bonus from gang territories
   *
   * @param characterId - Character to check
   * @returns Total energy regen bonus per hour
   */
  static async getEnergyRegenBonus(
    characterId: mongoose.Types.ObjectId
  ): Promise<number> {
    try {
      const gang = await Gang.findByMember(characterId);
      if (!gang) {
        return 0;
      }

      const territories = await this.getGangTerritories(gang._id as mongoose.Types.ObjectId);
      if (territories.length === 0) {
        return 0;
      }

      let totalEnergyBonus = 0;
      for (const territory of territories) {
        totalEnergyBonus += territory.benefits.energyRegen;
      }

      return totalEnergyBonus;
    } catch (error) {
      logger.error('Error getting energy regen bonus:', error);
      return 0;
    }
  }

  /**
   * Get conquest history for a territory
   *
   * @param territoryId - Territory slug
   * @param limit - Maximum history entries to return
   * @returns Array of conquest history entries
   */
  static async getConquestHistory(
    territoryId: string,
    limit: number = 50
  ): Promise<ITerritory['conquestHistory']> {
    const territory = await this.getTerritory(territoryId);

    return territory.conquestHistory
      .slice(-limit)
      .reverse();
  }

  /**
   * Get available (unclaimed) territories
   */
  static async getAvailableTerritories(): Promise<ITerritory[]> {
    return Territory.findAvailable();
  }

  /**
   * Get territory statistics
   */
  static async getTerritoryStats(): Promise<{
    total: number;
    controlled: number;
    available: number;
    byFaction: Record<string, number>;
  }> {
    const allTerritories = await Territory.find();

    const stats = {
      total: allTerritories.length,
      controlled: allTerritories.filter(t => t.controllingGangId !== null).length,
      available: allTerritories.filter(t => t.controllingGangId === null).length,
      byFaction: {
        SETTLER: allTerritories.filter(t => t.faction === 'SETTLER').length,
        NAHI: allTerritories.filter(t => t.faction === 'NAHI').length,
        FRONTERA: allTerritories.filter(t => t.faction === 'FRONTERA').length,
        NEUTRAL: allTerritories.filter(t => t.faction === 'NEUTRAL').length,
      },
    };

    return stats;
  }
}
