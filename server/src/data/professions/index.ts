/**
 * Professions Index
 * Phase 7.2 Crafting Expansion
 * Exports all 11 profession definitions
 */

import { CraftingProfession, ProfessionId } from '@desperados/shared';

// New professions (Phase 7.2)
import { nativeCraftsProfession } from './nativeCrafts';
import { prospectingProfession } from './prospecting';
import { woodworkingProfession } from './woodworking';
import { trappingProfession } from './trapping';
import { leadershipProfession } from './leadership';

/**
 * All new profession definitions
 */
export const newProfessions: CraftingProfession[] = [
  nativeCraftsProfession,
  prospectingProfession,
  woodworkingProfession,
  trappingProfession,
  leadershipProfession
];

/**
 * Get profession by ID
 */
export function getProfessionById(id: ProfessionId): CraftingProfession | undefined {
  return newProfessions.find(p => p.id === id);
}

/**
 * Get all new profession IDs
 */
export const newProfessionIds: ProfessionId[] = [
  ProfessionId.NATIVE_CRAFTS,
  ProfessionId.PROSPECTING,
  ProfessionId.WOODWORKING,
  ProfessionId.TRAPPING,
  ProfessionId.LEADERSHIP
];

// Export individual professions
export { nativeCraftsProfession } from './nativeCrafts';
export { prospectingProfession } from './prospecting';
export { woodworkingProfession } from './woodworking';
export { trappingProfession } from './trapping';
export { leadershipProfession } from './leadership';
