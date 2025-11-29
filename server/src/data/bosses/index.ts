/**
 * Boss Registry - Phase 14, Wave 14.2
 *
 * Central registry for all boss encounters in Desperados Destiny
 */

import { BossEncounter, BossCategory } from '@desperados/shared';
import { LEGENDARY_ANIMAL_BOSSES } from './legendaryBosses';
import { FACTION_LEADER_BOSSES } from './factionBosses';
import { OUTLAW_LEGEND_BOSSES } from './outlawBosses';
import { COSMIC_HORROR_BOSSES } from './cosmicBosses';

/**
 * All boss encounters in the game
 */
export const ALL_BOSSES: BossEncounter[] = [
  ...LEGENDARY_ANIMAL_BOSSES,
  ...FACTION_LEADER_BOSSES,
  ...OUTLAW_LEGEND_BOSSES,
  ...COSMIC_HORROR_BOSSES,
];

/**
 * Boss lookup by ID
 */
export const BOSS_REGISTRY: Record<string, BossEncounter> = ALL_BOSSES.reduce(
  (registry, boss) => {
    registry[boss.id] = boss;
    return registry;
  },
  {} as Record<string, BossEncounter>
);

/**
 * Get boss by ID
 */
export function getBossById(bossId: string): BossEncounter | undefined {
  return BOSS_REGISTRY[bossId];
}

/**
 * Get all bosses
 */
export function getAllBosses(): BossEncounter[] {
  return ALL_BOSSES;
}

/**
 * Get all bosses in a category
 */
export function getBossesByCategory(category: BossCategory): BossEncounter[] {
  return ALL_BOSSES.filter(boss => boss.category === category);
}

/**
 * Get bosses by level range
 */
export function getBossesByLevelRange(
  minLevel: number,
  maxLevel: number
): BossEncounter[] {
  return ALL_BOSSES.filter(
    boss => boss.level >= minLevel && boss.level <= maxLevel
  );
}

/**
 * Get bosses in a location
 */
export function getBossesByLocation(location: string): BossEncounter[] {
  return ALL_BOSSES.filter(
    boss =>
      boss.location === location ||
      (boss.alternateLocations && boss.alternateLocations.includes(location))
  );
}

/**
 * Get recommended bosses for character level
 */
export function getRecommendedBosses(characterLevel: number): BossEncounter[] {
  // Recommend bosses within 5 levels of character
  return ALL_BOSSES.filter(
    boss => boss.level >= characterLevel - 5 && boss.level <= characterLevel + 5
  ).sort((a, b) => a.level - b.level);
}

/**
 * Export individual boss collections
 */
export {
  LEGENDARY_ANIMAL_BOSSES,
  FACTION_LEADER_BOSSES,
  OUTLAW_LEGEND_BOSSES,
  COSMIC_HORROR_BOSSES,
};
