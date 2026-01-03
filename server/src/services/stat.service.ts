/**
 * Stat Service - Phase C2
 *
 * Derived Stats System (Therian Saga / RuneScape Hybrid)
 *
 * Stats are derived from:
 * - Skill levels (primary source)
 * - Equipment bonuses
 * - Companion bonuses
 * - Location bonuses
 *
 * This replaces any arbitrary stat allocation with a pure skill-based system.
 */

import mongoose from 'mongoose';
import { Character, ICharacter, CharacterSkill } from '../models/Character.model';
import { Item, IItem, ItemStats } from '../models/Item.model';
import { AnimalCompanion, IAnimalCompanion } from '../models/AnimalCompanion.model';
import {
  SKILLS,
  SkillCategory,
  PrimaryStats,
  SecondaryStats,
  DerivedStats,
  EffectiveSkillLevel
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Skill to category mapping for quick lookups
 */
const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = {};
Object.values(SKILLS).forEach(skill => {
  SKILL_CATEGORY_MAP[skill.id] = skill.category;
});

/**
 * Secondary stat formulas (weights for each primary stat)
 * These define how primary stats combine to create secondary stats
 */
const SECONDARY_STAT_FORMULAS = {
  accuracy: { combat: 0.5, cunning: 0.3, spirit: 0, craft: 0 },
  damage: { combat: 0.8, cunning: 0, spirit: 0, craft: 0.2 },
  defense: { combat: 0.4, cunning: 0, spirit: 0.3, craft: 0.3 },
  evasion: { combat: 0.2, cunning: 0.6, spirit: 0, craft: 0 },
  persuasion: { combat: 0, cunning: 0.3, spirit: 0.7, craft: 0 },
  crimeSuccess: { combat: 0.2, cunning: 0.6, spirit: 0.2, craft: 0 },
  craftQuality: { combat: 0, cunning: 0.2, spirit: 0, craft: 0.8 }
} as const;

/**
 * Companion bonus to secondary stat mapping
 * Maps companion utility bonuses to which secondary stats they affect
 */
const COMPANION_BONUS_MAPPING = {
  trackingBonus: { accuracy: 0.3, crimeSuccess: 0.2 },
  huntingBonus: { damage: 0.2, accuracy: 0.1 },
  guardBonus: { defense: 0.3, evasion: 0.1 },
  socialBonus: { persuasion: 0.4 }
} as const;

export class StatService {
  /**
   * Calculate complete derived stats for a character
   * This is the main entry point for stat calculation
   */
  static async calculateDerivedStats(
    characterId: string,
    locationId?: string
  ): Promise<DerivedStats> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Calculate primary stats from skills
    const primary = this.calculatePrimaryStats(character.skills);

    // Calculate base secondary stats from primaries
    const baseSecondary = this.calculateSecondaryStats(primary);

    // Get equipment bonuses
    const equipmentBonuses = await this.calculateEquipmentBonuses(character);

    // Get companion bonuses
    const companionBonuses = await this.calculateCompanionBonuses(characterId);

    // Get location bonuses (placeholder - expand when location system exists)
    const locationBonuses = this.calculateLocationBonuses(locationId);

    // Calculate final stats by combining all sources
    const final = this.combineStats(
      baseSecondary,
      equipmentBonuses,
      companionBonuses,
      locationBonuses
    );

    return {
      primary,
      secondary: baseSecondary,
      equipmentBonuses,
      companionBonuses,
      locationBonuses,
      final
    };
  }

  /**
   * Calculate primary stats (sum of skill levels per category)
   */
  static calculatePrimaryStats(skills: CharacterSkill[]): PrimaryStats {
    const stats: PrimaryStats = {
      combatPower: 0,
      cunningPower: 0,
      spiritPower: 0,
      craftPower: 0
    };

    for (const skill of skills) {
      const category = SKILL_CATEGORY_MAP[skill.skillId];
      const level = skill.level || 1;

      switch (category) {
        case SkillCategory.COMBAT:
          stats.combatPower += level;
          break;
        case SkillCategory.CUNNING:
          stats.cunningPower += level;
          break;
        case SkillCategory.SPIRIT:
          stats.spiritPower += level;
          break;
        case SkillCategory.CRAFT:
          stats.craftPower += level;
          break;
      }
    }

    return stats;
  }

  /**
   * Calculate secondary stats from primary stats
   */
  static calculateSecondaryStats(primary: PrimaryStats): SecondaryStats {
    const secondary: SecondaryStats = {
      accuracy: 0,
      damage: 0,
      defense: 0,
      evasion: 0,
      persuasion: 0,
      crimeSuccess: 0,
      craftQuality: 0
    };

    // Calculate each secondary stat using the formula weights
    for (const [statName, formula] of Object.entries(SECONDARY_STAT_FORMULAS)) {
      const stat = statName as keyof SecondaryStats;
      secondary[stat] = Math.floor(
        primary.combatPower * formula.combat +
        primary.cunningPower * formula.cunning +
        primary.spiritPower * formula.spirit +
        primary.craftPower * formula.craft
      );
    }

    return secondary;
  }

  /**
   * Calculate equipment stat bonuses
   * Looks at equipped items and sums their stat contributions
   */
  static async calculateEquipmentBonuses(
    character: ICharacter
  ): Promise<Partial<SecondaryStats>> {
    const bonuses: Partial<SecondaryStats> = {};

    // Get equipped items from character
    const equippedItemIds = character.equipment
      ? Object.values(character.equipment).filter(Boolean)
      : [];

    if (equippedItemIds.length === 0) {
      return bonuses;
    }

    // Fetch item definitions
    const items = await Item.find({
      itemId: { $in: equippedItemIds }
    });

    // Sum up equipment stat bonuses
    let totalCombat = 0;
    let totalCunning = 0;
    let totalSpirit = 0;
    let totalCraft = 0;

    for (const item of items) {
      if (item.stats) {
        totalCombat += item.stats.combat || 0;
        totalCunning += item.stats.cunning || 0;
        totalSpirit += item.stats.spirit || 0;
        totalCraft += item.stats.craft || 0;
      }

      // Also process effects that modify stats directly
      for (const effect of item.effects || []) {
        if (effect.type === 'stat') {
          switch (effect.stat) {
            case 'combat': totalCombat += effect.value; break;
            case 'cunning': totalCunning += effect.value; break;
            case 'spirit': totalSpirit += effect.value; break;
            case 'craft': totalCraft += effect.value; break;
          }
        }
        // Handle specific effect types
        if (effect.type === 'combat_score') {
          bonuses.damage = (bonuses.damage || 0) + effect.value;
        }
        if (effect.type === 'crime_success') {
          bonuses.crimeSuccess = (bonuses.crimeSuccess || 0) + effect.value;
        }
        if (effect.type === 'social_success') {
          bonuses.persuasion = (bonuses.persuasion || 0) + effect.value;
        }
      }
    }

    // Convert equipment stats to secondary stat bonuses
    // Equipment stat points are worth more than skill points
    const equipmentMultiplier = 2; // Each equipment stat point = 2 skill levels
    const equipPrimary: PrimaryStats = {
      combatPower: totalCombat * equipmentMultiplier,
      cunningPower: totalCunning * equipmentMultiplier,
      spiritPower: totalSpirit * equipmentMultiplier,
      craftPower: totalCraft * equipmentMultiplier
    };

    // Calculate secondary bonuses from equipment primary stats
    const equipSecondary = this.calculateSecondaryStats(equipPrimary);

    // Merge with direct effect bonuses
    for (const [key, value] of Object.entries(equipSecondary)) {
      const stat = key as keyof SecondaryStats;
      bonuses[stat] = (bonuses[stat] || 0) + value;
    }

    return bonuses;
  }

  /**
   * Calculate companion stat bonuses
   * Active companions provide bonuses based on their stats and bond level
   */
  static async calculateCompanionBonuses(
    characterId: string
  ): Promise<Partial<SecondaryStats>> {
    const bonuses: Partial<SecondaryStats> = {};

    // Find active companion
    const companion = await AnimalCompanion.findOne({
      ownerId: new mongoose.Types.ObjectId(characterId),
      isActive: true
    });

    if (!companion) {
      return bonuses;
    }

    // Bond level affects how much of the companion's bonuses apply
    // 0-20: 20%, 21-40: 40%, 41-60: 60%, 61-80: 80%, 81-100: 100%
    const bondMultiplier = Math.min(1, (Math.floor(companion.bondLevel / 20) + 1) * 0.2);

    // Apply companion utility bonuses to secondary stats
    for (const [bonusType, statMapping] of Object.entries(COMPANION_BONUS_MAPPING)) {
      const companionBonus = (companion as any)[bonusType] || 0;
      if (companionBonus > 0) {
        for (const [stat, weight] of Object.entries(statMapping)) {
          const contribution = Math.floor(companionBonus * weight * bondMultiplier);
          const statKey = stat as keyof SecondaryStats;
          bonuses[statKey] = (bonuses[statKey] || 0) + contribution;
        }
      }
    }

    // Attack power bonus to damage
    if (companion.attackPower > 0) {
      bonuses.damage = (bonuses.damage || 0) +
        Math.floor(companion.attackPower * 0.5 * bondMultiplier);
    }

    // Defense power bonus to defense
    if (companion.defensePower > 0) {
      bonuses.defense = (bonuses.defense || 0) +
        Math.floor(companion.defensePower * 0.5 * bondMultiplier);
    }

    return bonuses;
  }

  /**
   * Calculate location-based stat bonuses
   * Placeholder for future location system expansion
   */
  static calculateLocationBonuses(
    locationId?: string
  ): Partial<SecondaryStats> {
    // TODO: Implement location-based bonuses when location system is expanded
    // Examples:
    // - Saloon: +10% persuasion
    // - Mine: +15% craftQuality
    // - Outlaw Camp: +10% crimeSuccess
    return {};
  }

  /**
   * Combine all stat sources into final stats
   */
  static combineStats(
    base: SecondaryStats,
    equipment: Partial<SecondaryStats>,
    companion: Partial<SecondaryStats>,
    location: Partial<SecondaryStats>
  ): SecondaryStats {
    const final: SecondaryStats = { ...base };

    // Add all bonus sources
    const bonusSources = [equipment, companion, location];

    for (const source of bonusSources) {
      for (const [key, value] of Object.entries(source)) {
        const stat = key as keyof SecondaryStats;
        final[stat] = (final[stat] || 0) + (value || 0);
      }
    }

    // Ensure no negative stats
    for (const key of Object.keys(final)) {
      const stat = key as keyof SecondaryStats;
      final[stat] = Math.max(0, final[stat]);
    }

    return final;
  }

  /**
   * Calculate effective skill level with all bonuses
   * Used when checking if character meets skill requirements
   */
  static async calculateEffectiveSkillLevel(
    characterId: string,
    skillId: string
  ): Promise<EffectiveSkillLevel> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get base skill level
    const characterSkill = character.skills?.find(s => s.skillId === skillId);
    const baseLevel = characterSkill?.level || 1;

    // Get equipment bonus for this skill
    const equipmentBonus = await this.getSkillEquipmentBonus(character, skillId);

    // Get companion bonus for this skill
    const companionBonus = await this.getSkillCompanionBonus(characterId, skillId);

    // Location bonus placeholder
    const locationBonus = 0;

    const effectiveLevel = baseLevel + equipmentBonus + companionBonus + locationBonus;

    return {
      skillId,
      baseLevel,
      equipmentBonus,
      companionBonus,
      locationBonus,
      effectiveLevel
    };
  }

  /**
   * Get equipment bonus for a specific skill
   */
  static async getSkillEquipmentBonus(
    character: ICharacter,
    skillId: string
  ): Promise<number> {
    // Get equipped items
    const equippedItemIds = character.equipment
      ? Object.values(character.equipment).filter(Boolean)
      : [];

    if (equippedItemIds.length === 0) {
      return 0;
    }

    const items = await Item.find({
      itemId: { $in: equippedItemIds }
    });

    let bonus = 0;

    // Check for skill-specific bonuses in item effects
    for (const item of items) {
      for (const effect of item.effects || []) {
        // Check for skill training speed bonuses that might apply
        if (effect.type === 'skill_training_speed') {
          // This is a training time reduction, not a level bonus
          continue;
        }
      }
    }

    // Get category bonus based on skill category
    const category = SKILL_CATEGORY_MAP[skillId];
    if (category) {
      for (const item of items) {
        if (item.stats) {
          switch (category) {
            case SkillCategory.COMBAT:
              bonus += Math.floor((item.stats.combat || 0) / 5); // 5 combat stat = +1 level
              break;
            case SkillCategory.CUNNING:
              bonus += Math.floor((item.stats.cunning || 0) / 5);
              break;
            case SkillCategory.SPIRIT:
              bonus += Math.floor((item.stats.spirit || 0) / 5);
              break;
            case SkillCategory.CRAFT:
              bonus += Math.floor((item.stats.craft || 0) / 5);
              break;
          }
        }
      }
    }

    return bonus;
  }

  /**
   * Get companion bonus for a specific skill
   */
  static async getSkillCompanionBonus(
    characterId: string,
    skillId: string
  ): Promise<number> {
    const companion = await AnimalCompanion.findOne({
      ownerId: new mongoose.Types.ObjectId(characterId),
      isActive: true
    });

    if (!companion) {
      return 0;
    }

    // Bond level multiplier (0.2 to 1.0)
    const bondMultiplier = Math.min(1, (Math.floor(companion.bondLevel / 20) + 1) * 0.2);

    // Map companion bonuses to skills
    const category = SKILL_CATEGORY_MAP[skillId];
    let bonus = 0;

    switch (category) {
      case SkillCategory.CUNNING:
        // Tracking and hunting bonuses help cunning skills
        bonus = Math.floor(
          ((companion.trackingBonus || 0) + (companion.huntingBonus || 0)) / 10 *
          bondMultiplier
        );
        break;
      case SkillCategory.SPIRIT:
        // Social bonus helps spirit skills
        bonus = Math.floor(
          (companion.socialBonus || 0) / 10 *
          bondMultiplier
        );
        break;
      case SkillCategory.COMBAT:
        // Attack/defense power helps combat skills
        bonus = Math.floor(
          ((companion.attackPower || 0) + (companion.defensePower || 0)) / 20 *
          bondMultiplier
        );
        break;
    }

    return bonus;
  }

  /**
   * Get a quick stat summary for display
   */
  static async getStatSummary(
    characterId: string
  ): Promise<{
    primary: PrimaryStats;
    combatRating: number;
    craftRating: number;
    crimeRating: number;
    socialRating: number;
  }> {
    const stats = await this.calculateDerivedStats(characterId);

    return {
      primary: stats.primary,
      combatRating: Math.floor(
        (stats.final.accuracy + stats.final.damage + stats.final.defense + stats.final.evasion) / 4
      ),
      craftRating: stats.final.craftQuality,
      crimeRating: stats.final.crimeSuccess,
      socialRating: stats.final.persuasion
    };
  }

  /**
   * Check if character meets stat requirements for an action
   */
  static async meetsStatRequirements(
    characterId: string,
    requirements: Partial<SecondaryStats>
  ): Promise<{ meets: boolean; missing: string[] }> {
    const stats = await this.calculateDerivedStats(characterId);
    const missing: string[] = [];

    for (const [stat, required] of Object.entries(requirements)) {
      const statKey = stat as keyof SecondaryStats;
      const current = stats.final[statKey] || 0;
      if (current < required!) {
        missing.push(`${stat}: ${current}/${required}`);
      }
    }

    return {
      meets: missing.length === 0,
      missing
    };
  }

  /**
   * Calculate stat modifiers for a specific action type
   * Returns multipliers based on relevant stats
   */
  static getActionModifier(
    stats: DerivedStats,
    actionType: 'combat' | 'crime' | 'social' | 'craft'
  ): number {
    // Base modifier is 1.0 (100%)
    // Stats provide additional percentage bonus
    const baseModifier = 1.0;
    const statScale = 0.001; // Each stat point = 0.1% bonus

    switch (actionType) {
      case 'combat':
        return baseModifier + (stats.final.accuracy + stats.final.damage) * statScale;
      case 'crime':
        return baseModifier + stats.final.crimeSuccess * statScale * 2;
      case 'social':
        return baseModifier + stats.final.persuasion * statScale * 2;
      case 'craft':
        return baseModifier + stats.final.craftQuality * statScale * 2;
      default:
        return baseModifier;
    }
  }
}

export default StatService;
