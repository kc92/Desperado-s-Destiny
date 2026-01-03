/**
 * Skill Modifiers
 * Calculate skill modifiers that affect game mechanics
 * IMPLEMENTS FORMULA FROM DESIGN DOC (docs/destiny-deck-algorithm.md)
 */

import { SkillModifiers, TalentBonuses } from '../types';

/**
 * Calculate skill modifiers
 *
 * This is the core formula that makes skills MATTER for success rates.
 * Without this, progression is meaningless - just reward multipliers.
 *
 * PHASE 6: Now integrates talent bonuses and synergy multipliers
 *
 * @param characterSuitBonus - Total skill levels for relevant suit (1-100+)
 * @param difficulty - Action difficulty (1-5)
 * @param talentBonuses - Optional bonuses from talent tree (Phase 6)
 * @param synergyMultiplier - Optional multiplier from build synergies (Phase 6)
 * @returns Modifiers that affect success thresholds
 */
export function calculateSkillModifiers(
  characterSuitBonus: number,
  difficulty: number,
  talentBonuses?: TalentBonuses,
  synergyMultiplier: number = 1.0
): SkillModifiers {
  // Clamp skill bonus to reasonable range (0-100)
  const skillLevel = Math.max(0, Math.min(100, characterSuitBonus));

  // Linear component: each skill level gives 0.75 bonus
  const linear = skillLevel * 0.75;

  // Exponential component: small additional bonus that scales with mastery
  const exponential = Math.pow(skillLevel, 1.1) * 0.05;

  const totalBonus = linear + exponential;

  // Scale effects based on difficulty (harder = skills matter more)
  const difficultyScale = 0.8 + (difficulty * 0.1); // 0.9 to 1.3

  // Phase 6: Apply talent bonuses
  const talentDeckBonus = talentBonuses?.deckScoreBonus || 0;
  const talentThresholdBonus = talentBonuses?.thresholdBonus || 0;
  const talentDangerBonus = talentBonuses?.dangerAvoidBonus || 0;

  return {
    // Reduce threshold by 40% of bonus - lower target = easier success
    // At skill 10: reduces by ~3 points
    // At skill 50: reduces by ~18 points
    // Phase 6: Add talent threshold bonus
    thresholdReduction: Math.floor((totalBonus * 0.4 * difficultyScale) + talentThresholdBonus),

    // Add 30% of bonus to score - higher score = more likely success
    // At skill 10: adds ~2 points
    // At skill 50: adds ~13 points
    // Phase 6: Add talent deck bonus, multiply by synergy
    cardBonus: Math.floor((totalBonus * 0.3 * difficultyScale + talentDeckBonus) * synergyMultiplier),

    // Unlock rerolls at higher skill levels (one per 30 levels)
    rerollsAvailable: Math.floor(skillLevel / 30),

    // Press your luck: chance to avoid danger cards
    // At skill 10: ~7% avoid chance
    // At skill 50: ~33% avoid chance
    // Capped at 50% to keep game challenging
    // Phase 6: Add talent danger avoidance bonus
    dangerAvoidChance: Math.min(0.5, skillLevel * 0.007 + (talentDangerBonus / 100))
  };
}
