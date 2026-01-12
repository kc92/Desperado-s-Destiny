/**
 * Crafting Materials Index
 * Phase 7.2 Crafting Expansion
 * Exports all crafting materials for the 5 new professions
 */

import { IItem } from '../../../models/Item.model';
import { nativeCraftsMaterials } from './native_crafts_materials';
import { prospectingMaterials } from './prospecting_materials';
import { woodworkingMaterials } from './woodworking_materials';
import { trappingMaterials } from './trapping_materials';
import { leadershipMaterials } from './leadership_materials';
import { miscCraftingMaterials } from './misc_crafting_materials';
import { metalsMaterials } from './metals_materials';
import { fabricsMaterials } from './fabrics_materials';
import { foodMaterials } from './food_materials';
import { leatherMaterials } from './leather_materials';
import { alchemyMaterials } from './alchemy_materials';
import { gunPartsMaterials } from './gun_parts_materials';
import { animalMaterials } from './animal_materials';
import { supernaturalMaterials } from './supernatural_materials';

/**
 * All crafting materials combined
 */
export const allCraftingMaterials: Partial<IItem>[] = [
  ...nativeCraftsMaterials,
  ...prospectingMaterials,
  ...woodworkingMaterials,
  ...trappingMaterials,
  ...leadershipMaterials,
  ...miscCraftingMaterials,
  ...metalsMaterials,
  ...fabricsMaterials,
  ...foodMaterials,
  ...leatherMaterials,
  ...alchemyMaterials,
  ...gunPartsMaterials,
  ...animalMaterials,
  ...supernaturalMaterials
];

// Export individual categories
export { nativeCraftsMaterials } from './native_crafts_materials';
export { prospectingMaterials } from './prospecting_materials';
export { woodworkingMaterials } from './woodworking_materials';
export { trappingMaterials } from './trapping_materials';
export { leadershipMaterials } from './leadership_materials';
export { miscCraftingMaterials } from './misc_crafting_materials';
export { metalsMaterials } from './metals_materials';
export { fabricsMaterials } from './fabrics_materials';
export { foodMaterials } from './food_materials';
export { leatherMaterials } from './leather_materials';
export { alchemyMaterials } from './alchemy_materials';
export { gunPartsMaterials } from './gun_parts_materials';
export { animalMaterials } from './animal_materials';
export { supernaturalMaterials } from './supernatural_materials';

// Export count for validation
export const craftingMaterialCounts = {
  nativeCrafts: nativeCraftsMaterials.length,
  prospecting: prospectingMaterials.length,
  woodworking: woodworkingMaterials.length,
  trapping: trappingMaterials.length,
  leadership: leadershipMaterials.length,
  misc: miscCraftingMaterials.length,
  metals: metalsMaterials.length,
  fabrics: fabricsMaterials.length,
  food: foodMaterials.length,
  leather: leatherMaterials.length,
  alchemy: alchemyMaterials.length,
  gunParts: gunPartsMaterials.length,
  animal: animalMaterials.length,
  supernatural: supernaturalMaterials.length,
  total: allCraftingMaterials.length
};
