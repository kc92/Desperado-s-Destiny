/**
 * Stats Calculation Utilities
 * Client-side calculations for derived character stats
 */

// Minimal interface for skill with level (works with both SkillData and CharacterSkill)
interface SkillWithLevel {
  skillId: string;
  level: number;
}

// Skill definition interface (from useSkillStore)
interface SkillDef {
  id: string;
  category: string;
}

/**
 * Calculate skill bonus with diminishing returns (matching server logic)
 */
export function calculateDiminishingReturns(skillLevel: number): number {
  let bonus = 0;

  // Tier 1: Levels 1-10 at full rate (+1.0 per level)
  const tier1Levels = Math.min(skillLevel, 10);
  bonus += tier1Levels * 1.0;

  // Tier 2: Levels 11-25 at half rate (+0.5 per level)
  if (skillLevel > 10) {
    const tier2Levels = Math.min(skillLevel - 10, 15);
    bonus += tier2Levels * 0.5;
  }

  // Tier 3: Levels 26-50 at quarter rate (+0.25 per level)
  if (skillLevel > 25) {
    const tier3Levels = skillLevel - 25;
    bonus += tier3Levels * 0.25;
  }

  // Cap at 24 per skill
  return Math.min(Math.floor(bonus), 24);
}

/**
 * Calculate total skill bonus for combat skills (used for HP)
 */
export function calculateCombatSkillBonus(
  characterSkills: SkillWithLevel[],
  skillDefinitions: SkillDef[]
): number {
  let totalBonus = 0;

  for (const charSkill of characterSkills) {
    const skillDef = skillDefinitions.find(s =>
      s.id.toLowerCase() === charSkill.skillId.toLowerCase()
    );

    if (skillDef?.category?.toLowerCase() === 'combat') {
      totalBonus += calculateDiminishingReturns(charSkill.level);
    }
  }

  // Cap at 120 total
  return Math.min(totalBonus, 120);
}

/**
 * Calculate Max HP based on level and combat skills
 */
export function calculateMaxHP(level: number, combatSkillBonus: number): number {
  const baseHP = 100;
  const levelBonus = level * 5;
  return baseHP + levelBonus + combatSkillBonus;
}

/**
 * Calculate total skill levels by category (for suit bonuses)
 */
export function calculateSkillBonusByCategory(
  characterSkills: SkillWithLevel[],
  skillDefinitions: SkillDef[]
): Record<string, number> {
  const bonuses: Record<string, number> = {
    cunning: 0,
    spirit: 0,
    combat: 0,
    craft: 0
  };

  for (const charSkill of characterSkills) {
    const skillDef = skillDefinitions.find(s =>
      s.id.toLowerCase() === charSkill.skillId.toLowerCase()
    );

    if (skillDef) {
      const category = skillDef.category?.toLowerCase();
      if (category && category in bonuses) {
        bonuses[category] += charSkill.level;
      }
    }
  }

  return bonuses;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Full';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
