/**
 * Combat Calculation Service
 *
 * Pure calculation functions for damage, HP, and skill bonuses.
 * No database operations, no state mutations.
 *
 * REFACTOR: Extracted from combat.service.ts to follow single responsibility principle
 */

import { ICharacter } from '../../models/Character.model';
import { ICombatAbilities } from '../../models/CombatEncounter.model';
import {
  HandRank,
  COMBAT_CONSTANTS,
  Card,
  HAND_BASE_VALUES,
  getSuitMultiplier,
  getSkillBoostMultiplier,
  EFFECTIVENESS_CAPS,
  calculateCategoryMultiplier,
  SkillCategory,
  SKILLS,
  COMBAT_SKILL_THRESHOLDS
} from '@desperados/shared';
import { SecureRNG } from '../base/SecureRNG';

/**
 * Damage calculation result with effectiveness breakdown
 */
export interface DamageCalculationResult {
  damage: number;
  effectiveness: number;
  breakdown: {
    handName: string;
    baseValue: number;
    suitMatches: number;
    suitMultiplier: number;
    skillBoostPercent: number;
    skillMultiplier: number;
    rawEffectiveness: number;
    cappedEffectiveness: number;
    finalDamage: number;
  };
}

export class CombatCalculationService {
  /**
   * Calculate character's maximum HP
   * Formula: Base 100 + (level * 5) + combat skill bonus (with diminishing returns) + (premium bonus)
   *
   * BALANCE FIX: Now uses same diminishing returns as damage calculation
   * This ensures HP and damage scale consistently with skill investment
   */
  static async getCharacterMaxHP(character: ICharacter): Promise<number> {
    const baseHP = 100;
    // Use Combat Level for HP bonus (replaces old character.level)
    const combatLevel = character.combatLevel || 1;
    const levelBonus = combatLevel * 5;

    // Use the same diminishing returns calculation as damage
    // This ensures HP scales consistently with skill investment
    const combatSkillBonus = this.getCombatSkillBonus(character);

    const baseTotal = baseHP + levelBonus + combatSkillBonus;

    // Apply premium HP bonus using PremiumUtils
    const { PremiumUtils } = await import('../../utils/premium.utils');
    const totalHP = await PremiumUtils.calculateHPWithBonus(baseTotal, character._id.toString());

    return totalHP;
  }

  /**
   * Calculate skill bonus with diminishing returns
   * BALANCE FIX: Prevents overpowered damage stacking from high-level skills
   *
   * Formula:
   * - Levels 1-10: +1.0 per level = +10 total
   * - Levels 11-25: +0.5 per level = +7.5 total
   * - Levels 26-50: +0.25 per level = +6.25 total
   * - Max per skill: +24 (hard cap)
   *
   * @param skillLevel - The skill level (1-50)
   * @returns Bonus value with diminishing returns applied
   */
  static calculateSkillBonusWithDiminishingReturns(skillLevel: number): number {
    const { SKILL_BONUS } = COMBAT_CONSTANTS;
    let bonus = 0;

    // Tier 1: Levels 1-10 at full rate
    const tier1Levels = Math.min(skillLevel, SKILL_BONUS.TIER1_END);
    bonus += tier1Levels * SKILL_BONUS.TIER1_RATE;

    // Tier 2: Levels 11-25 at half rate
    if (skillLevel > SKILL_BONUS.TIER1_END) {
      const tier2Levels = Math.min(skillLevel - SKILL_BONUS.TIER1_END, SKILL_BONUS.TIER2_END - SKILL_BONUS.TIER1_END);
      bonus += tier2Levels * SKILL_BONUS.TIER2_RATE;
    }

    // Tier 3: Levels 26-50 at quarter rate
    if (skillLevel > SKILL_BONUS.TIER2_END) {
      const tier3Levels = skillLevel - SKILL_BONUS.TIER2_END;
      bonus += tier3Levels * SKILL_BONUS.TIER3_RATE;
    }

    // Apply per-skill cap
    return Math.min(Math.floor(bonus), SKILL_BONUS.MAX_PER_SKILL);
  }

  /**
   * Calculate combat skill damage bonuses with diminishing returns
   * BALANCE FIX: Total bonus capped at 120 (previously could reach 250+)
   *
   * Old formula: Each combat skill level = +1 damage (no cap)
   * New formula: Diminishing returns per skill + total cap
   */
  static getCombatSkillBonus(character: ICharacter): number {
    const { SKILL_BONUS } = COMBAT_CONSTANTS;
    let totalBonus = 0;

    for (const skill of character.skills) {
      // Use SkillCategory for type-safe skill detection
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.COMBAT) {
        totalBonus += this.calculateSkillBonusWithDiminishingReturns(skill.level);
      }
    }

    // Apply total cap across all skills
    return Math.min(totalBonus, SKILL_BONUS.MAX_TOTAL);
  }

  /**
   * Get the highest combat skill level for a character
   * Used to determine the category multiplier unlock tier
   *
   * BALANCE FIX (Phase 4.1): Skill unlock bonuses are now multiplicative
   */
  static getHighestCombatSkillLevel(character: ICharacter): number {
    let highestLevel = 0;

    for (const skill of character.skills) {
      // Check if this is a COMBAT category skill
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.COMBAT) {
        highestLevel = Math.max(highestLevel, skill.level);
      }
    }

    return highestLevel;
  }

  /**
   * Get the combat category multiplier for a character
   * Based on their highest combat skill level
   *
   * BALANCE FIX (Phase 4.1): Multiplicative bonuses
   * - Level 15: ×1.05 (Combat Stance)
   * - Level 30: ×1.10 (Veteran Fighter)
   * - Level 45: ×1.15 (Deadly Force)
   * - Combined: ×1.328 at level 45+
   */
  static getCombatCategoryMultiplier(character: ICharacter): number {
    const highestLevel = this.getHighestCombatSkillLevel(character);
    return calculateCategoryMultiplier(highestLevel, 'COMBAT');
  }

  /**
   * Calculate damage from a hand rank
   * Returns (base damage + skill bonuses + difficulty + variance) × category multiplier
   *
   * BALANCE FIX (Phase 4.1): Added category multiplier for skill unlock bonuses
   *
   * @param handRank - The poker hand rank
   * @param skillBonuses - Additive bonus from combat skill levels (with diminishing returns)
   * @param difficultyModifier - Bonus/penalty from enemy difficulty
   * @param categoryMultiplier - Multiplicative bonus from skill unlocks (default 1.0)
   */
  static calculateDamage(
    handRank: HandRank,
    skillBonuses: number,
    difficultyModifier: number = 0,
    categoryMultiplier: number = 1.0
  ): number {
    // Base damage by hand rank
    const baseDamage: Record<HandRank, number> = {
      [HandRank.ROYAL_FLUSH]: 50,
      [HandRank.STRAIGHT_FLUSH]: 40,
      [HandRank.FOUR_OF_A_KIND]: 35,
      [HandRank.FULL_HOUSE]: 30,
      [HandRank.FLUSH]: 25,
      [HandRank.STRAIGHT]: 20,
      [HandRank.THREE_OF_A_KIND]: 15,
      [HandRank.TWO_PAIR]: 10,
      [HandRank.PAIR]: 8,
      [HandRank.HIGH_CARD]: 5
    };

    const base = baseDamage[handRank] || 5;
    // SECURITY FIX: Use SecureRNG for damage variance
    const variance = SecureRNG.range(0, 5); // 0-5 random damage

    // Apply base formula then multiply by category bonus
    const rawDamage = base + skillBonuses + difficultyModifier + variance;
    return Math.floor(rawDamage * categoryMultiplier);
  }

  /**
   * NEW EFFECTIVENESS-BASED DAMAGE CALCULATION V2
   *
   * Uses the unified effectiveness formula where:
   * - Hand rank provides base effectiveness (50-500)
   * - Matching suits add +10% per card (up to +50%)
   * - Combat skills provide percentage boost (up to +50%)
   *
   * The result is scaled to match existing damage ranges:
   * - Effectiveness 50-500 scales to ~5-50 base damage
   * - With multipliers, can reach ~10-112 damage (capped at 60)
   *
   * @param handRank - The poker hand rank
   * @param hand - The actual cards for suit counting
   * @param combatSkillLevel - Average level of combat skills (0-100)
   * @param relevantSuit - The suit that matches combat (clubs for Combat)
   * @returns Damage value with effectiveness breakdown
   */
  static calculateDamageV2(
    handRank: HandRank,
    hand: Card[],
    combatSkillLevel: number = 0,
    relevantSuit: string = 'clubs'
  ): DamageCalculationResult {
    // Get base effectiveness from hand rank
    const baseValue = HAND_BASE_VALUES[handRank] ?? 50;

    // Count matching suit cards
    const suitMatches = hand.filter(c =>
      c.suit.toLowerCase() === relevantSuit.toLowerCase()
    ).length;

    // Calculate multipliers
    const suitMultiplier = getSuitMultiplier(suitMatches);
    const skillMultiplier = getSkillBoostMultiplier(combatSkillLevel);

    // Calculate raw effectiveness
    const rawEffectiveness = baseValue * suitMultiplier * skillMultiplier;

    // Cap effectiveness for combat balance
    const effectiveness = Math.min(Math.round(rawEffectiveness), EFFECTIVENESS_CAPS.COMBAT_DAMAGE);

    // Scale to damage range (effectiveness/10 gives ~5-30 base, which matches old system)
    // Add small variance for excitement
    const variance = SecureRNG.range(0, 3);
    const damage = Math.floor(effectiveness / 10) + variance;

    // Build breakdown for UI
    const breakdown = {
      handName: HandRank[handRank],
      baseValue,
      suitMatches,
      suitMultiplier: Number(suitMultiplier.toFixed(2)),
      skillBoostPercent: Math.min(combatSkillLevel, 50),
      skillMultiplier: Number(skillMultiplier.toFixed(2)),
      rawEffectiveness: Math.round(rawEffectiveness),
      cappedEffectiveness: effectiveness,
      finalDamage: damage
    };

    return { damage, effectiveness, breakdown };
  }

  /**
   * Calculate combat abilities based on character's combat skill level
   * Rerolls: 1 per 30 skill levels (30, 60, 90...)
   * Peek: Unlocked at skill 50+
   * Quick Draw: Unlocked at skill 60+ (draw 6 cards instead of 5)
   * Deadly Aim: Unlocked at skill 75+ (1.5x crit damage)
   */
  static calculateAbilities(character: ICharacter): ICombatAbilities {
    const combatSkillLevel = this.getHighestCombatSkillLevel(character);

    // Calculate rerolls: 1 per 30 skill levels
    const rerollsAvailable = Math.floor(combatSkillLevel / COMBAT_SKILL_THRESHOLDS.REROLL_INTERVAL);

    // Peek available if skill >= 50
    const peeksAvailable = combatSkillLevel >= COMBAT_SKILL_THRESHOLDS.PEEK_UNLOCK ? 1 : 0;

    // Quick draw unlocked at skill 60+
    const quickDrawUnlocked = combatSkillLevel >= COMBAT_SKILL_THRESHOLDS.QUICK_DRAW_UNLOCK;

    // Deadly aim unlocked at skill 75+
    const deadlyAimUnlocked = combatSkillLevel >= COMBAT_SKILL_THRESHOLDS.DEADLY_AIM_UNLOCK;

    return {
      rerollsAvailable,
      peeksAvailable,
      rerollsUsed: 0,
      peeksUsed: 0,
      peekedCard: undefined,
      quickDrawUnlocked,
      deadlyAimUnlocked
    };
  }
}

export default CombatCalculationService;
