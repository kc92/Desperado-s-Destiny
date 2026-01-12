/**
 * Raw Materials Index
 * Phase 7.2 Crafting Expansion
 * Exports all raw materials: 75 items total
 */

import { IItem } from '../../../models/Item.model';
import { ores } from './ores';
import { animalProducts } from './animal_products';
import { plantsHerbs } from './plants_herbs';
import { woods } from './wood';
import { textiles } from './textiles';

/**
 * All raw materials combined
 * Total: 75 items (18 ores + 20 animal + 18 plants + 10 wood + 9 textiles)
 */
export const allRawMaterials: Partial<IItem>[] = [
  ...ores,
  ...animalProducts,
  ...plantsHerbs,
  ...woods,
  ...textiles
];

// Export individual categories
export { ores } from './ores';
export { animalProducts } from './animal_products';
export { plantsHerbs } from './plants_herbs';
export { woods } from './wood';
export { textiles } from './textiles';

// Export count for validation
export const rawMaterialCounts = {
  ores: ores.length,
  animalProducts: animalProducts.length,
  plantsHerbs: plantsHerbs.length,
  woods: woods.length,
  textiles: textiles.length,
  total: allRawMaterials.length
};
