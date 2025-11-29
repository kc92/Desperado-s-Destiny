/**
 * All Permanent Unlocks Registry
 * Central index of all unlockable content
 */

import { PermanentUnlock } from '@desperados/shared';
import { cosmeticUnlocks } from './cosmetics';
import { gameplayUnlocks } from './gameplay';
import { convenienceUnlocks } from './convenience';
import { prestigeUnlocks } from './prestige';

/**
 * Complete registry of all permanent unlocks
 */
export const allUnlocks: PermanentUnlock[] = [
  ...cosmeticUnlocks,
  ...gameplayUnlocks,
  ...convenienceUnlocks,
  ...prestigeUnlocks
];

/**
 * Unlocks indexed by ID for quick lookup
 */
export const unlocksById = new Map<string, PermanentUnlock>(
  allUnlocks.map(unlock => [unlock.id, unlock])
);

/**
 * Get an unlock by ID
 */
export function getUnlockById(id: string): PermanentUnlock | undefined {
  return unlocksById.get(id);
}

/**
 * Get all unlocks of a specific category
 */
export function getUnlocksByCategory(category: string): PermanentUnlock[] {
  return allUnlocks.filter(unlock => unlock.category === category);
}

/**
 * Get all unlocks of a specific rarity
 */
export function getUnlocksByRarity(rarity: string): PermanentUnlock[] {
  return allUnlocks.filter(unlock => unlock.rarity === rarity);
}

/**
 * Get all non-hidden unlocks
 */
export function getVisibleUnlocks(): PermanentUnlock[] {
  return allUnlocks.filter(unlock => !unlock.hidden);
}

/**
 * Get all premium unlocks
 */
export function getPremiumUnlocks(): PermanentUnlock[] {
  return allUnlocks.filter(unlock => unlock.premium);
}

/**
 * Get all exclusive unlocks
 */
export function getExclusiveUnlocks(): PermanentUnlock[] {
  return allUnlocks.filter(unlock => unlock.exclusive);
}

export {
  cosmeticUnlocks,
  gameplayUnlocks,
  convenienceUnlocks,
  prestigeUnlocks
};
