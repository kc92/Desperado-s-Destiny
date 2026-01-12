/**
 * Crafted Items Index
 * Phase 7.2 Crafting Expansion
 * Exports all crafted output items from all 11 professions
 */

import { IItem } from '../../../models/Item.model';
import { nativeCraftsCrafted } from './native_crafts_crafted';
import { prospectingCrafted } from './prospecting_crafted';
import { woodworkingCrafted } from './woodworking_crafted';
import { trappingCrafted } from './trapping_crafted';
import { leadershipCrafted } from './leadership_crafted';
import { blacksmithingCrafted } from './blacksmithing_crafted';
import { gunsmithingCrafted } from './gunsmithing_crafted';
import { leatherworkingCrafted } from './leatherworking_crafted';
import { tailoringCrafted } from './tailoring_crafted';
import { alchemyCraftedItems } from './alchemy_crafted';
import { cookingCraftedItems } from './cooking_crafted';

/**
 * All crafted items combined
 */
export const allCraftedItems: Partial<IItem>[] = [
  ...nativeCraftsCrafted,
  ...prospectingCrafted,
  ...woodworkingCrafted,
  ...trappingCrafted,
  ...leadershipCrafted,
  ...blacksmithingCrafted,
  ...gunsmithingCrafted,
  ...leatherworkingCrafted,
  ...tailoringCrafted,
  ...alchemyCraftedItems,
  ...cookingCraftedItems
];

// Export individual categories
export { nativeCraftsCrafted } from './native_crafts_crafted';
export { prospectingCrafted } from './prospecting_crafted';
export { woodworkingCrafted } from './woodworking_crafted';
export { trappingCrafted } from './trapping_crafted';
export { leadershipCrafted } from './leadership_crafted';
export { blacksmithingCrafted } from './blacksmithing_crafted';
export { gunsmithingCrafted } from './gunsmithing_crafted';
export { leatherworkingCrafted } from './leatherworking_crafted';
export { tailoringCrafted } from './tailoring_crafted';
export { alchemyCraftedItems } from './alchemy_crafted';
export { cookingCraftedItems } from './cooking_crafted';

// Export count for validation
export const craftedItemCounts = {
  nativeCrafts: nativeCraftsCrafted.length,
  prospecting: prospectingCrafted.length,
  woodworking: woodworkingCrafted.length,
  trapping: trappingCrafted.length,
  leadership: leadershipCrafted.length,
  blacksmithing: blacksmithingCrafted.length,
  gunsmithing: gunsmithingCrafted.length,
  leatherworking: leatherworkingCrafted.length,
  tailoring: tailoringCrafted.length,
  alchemy: alchemyCraftedItems.length,
  cooking: cookingCraftedItems.length,
  total: allCraftedItems.length
};
