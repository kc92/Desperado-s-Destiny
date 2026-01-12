/**
 * Recipe Database Index
 * Phase 7, Wave 7.2 - Desperados Destiny
 *
 * Central export for all crafting recipes across 11 professions
 */

import { CraftingRecipe, ProfessionId } from '@desperados/shared';
// Original 6 professions
import blacksmithingRecipes from './blacksmithingRecipes';
import leatherworkingRecipes from './leatherworkingRecipes';
import alchemyRecipes from './alchemyRecipes';
import cookingRecipes from './cookingRecipes';
import tailoringRecipes from './tailoringRecipes';
import gunsmithingRecipes from './gunsmithingRecipes';
// 5 new professions
import nativeCraftsRecipes from './nativeCraftsRecipes';
import prospectingRecipes from './prospectingRecipes';
import woodworkingRecipes from './woodworkingRecipes';
import trappingRecipes from './trappingRecipes';
import leadershipRecipes from './leadershipRecipes';

// ============================================================================
// RECIPE COLLECTIONS BY PROFESSION
// ============================================================================

export {
  // Original 6 professions
  blacksmithingRecipes,
  leatherworkingRecipes,
  alchemyRecipes,
  cookingRecipes,
  tailoringRecipes,
  gunsmithingRecipes,
  // 5 new professions
  nativeCraftsRecipes,
  prospectingRecipes,
  woodworkingRecipes,
  trappingRecipes,
  leadershipRecipes
};

// ============================================================================
// ALL RECIPES COMBINED
// ============================================================================

/**
 * Complete database of all crafting recipes
 */
export const ALL_RECIPES: CraftingRecipe[] = [
  // Original 6 professions
  ...blacksmithingRecipes,
  ...leatherworkingRecipes,
  ...alchemyRecipes,
  ...cookingRecipes,
  ...tailoringRecipes,
  ...gunsmithingRecipes,
  // 5 new professions
  ...nativeCraftsRecipes,
  ...prospectingRecipes,
  ...woodworkingRecipes,
  ...trappingRecipes,
  ...leadershipRecipes
];

// ============================================================================
// RECIPE LOOKUP MAPS
// ============================================================================

/**
 * Map of recipe ID to recipe for quick lookups
 */
export const RECIPE_MAP = new Map<string, CraftingRecipe>(
  ALL_RECIPES.map(recipe => [recipe.id, recipe])
);

/**
 * Map of profession to recipes for that profession
 */
export const RECIPES_BY_PROFESSION = new Map<ProfessionId, CraftingRecipe[]>([
  // Original 6 professions
  [ProfessionId.BLACKSMITHING, blacksmithingRecipes],
  [ProfessionId.LEATHERWORKING, leatherworkingRecipes],
  [ProfessionId.ALCHEMY, alchemyRecipes],
  [ProfessionId.COOKING, cookingRecipes],
  [ProfessionId.TAILORING, tailoringRecipes],
  [ProfessionId.GUNSMITHING, gunsmithingRecipes],
  // 5 new professions
  [ProfessionId.NATIVE_CRAFTS, nativeCraftsRecipes],
  [ProfessionId.PROSPECTING, prospectingRecipes],
  [ProfessionId.WOODWORKING, woodworkingRecipes],
  [ProfessionId.TRAPPING, trappingRecipes],
  [ProfessionId.LEADERSHIP, leadershipRecipes]
]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a recipe by its ID
 */
export function getRecipeById(recipeId: string): CraftingRecipe | undefined {
  return RECIPE_MAP.get(recipeId);
}

/**
 * Get all recipes for a specific profession
 */
export function getRecipesByProfession(professionId: ProfessionId): CraftingRecipe[] {
  return RECIPES_BY_PROFESSION.get(professionId) || [];
}

/**
 * Get recipes filtered by minimum level requirement
 */
export function getRecipesByMinLevel(
  professionId: ProfessionId,
  minLevel: number
): CraftingRecipe[] {
  const recipes = getRecipesByProfession(professionId);
  return recipes.filter(recipe => recipe.requirements.minLevel <= minLevel);
}

/**
 * Get recipes available at a specific level
 */
export function getRecipesAtLevel(
  professionId: ProfessionId,
  level: number
): CraftingRecipe[] {
  const recipes = getRecipesByProfession(professionId);
  return recipes.filter(
    recipe =>
      recipe.requirements.minLevel <= level &&
      (recipe.requirements.minLevel + 10 >= level || level >= 100)
  );
}

/**
 * Get recipes by category (weapon, armor, consumable, etc.)
 */
export function getRecipesByCategory(category: string): CraftingRecipe[] {
  return ALL_RECIPES.filter(recipe => recipe.category === category);
}

/**
 * Get recipes by learning source
 */
export function getRecipesByLearningSource(
  professionId: ProfessionId,
  source: string
): CraftingRecipe[] {
  const recipes = getRecipesByProfession(professionId);
  return recipes.filter(recipe => recipe.learningSource === source);
}

/**
 * Get recipes that can be discovered
 */
export function getDiscoverableRecipes(professionId: ProfessionId): CraftingRecipe[] {
  const recipes = getRecipesByProfession(professionId);
  return recipes.filter(
    recipe => recipe.learningSource === 'discovery' && recipe.discoveryChance
  );
}

/**
 * Get legendary recipes (grandmaster tier)
 */
export function getLegendaryRecipes(professionId?: ProfessionId): CraftingRecipe[] {
  const recipes = professionId ? getRecipesByProfession(professionId) : ALL_RECIPES;
  return recipes.filter(recipe => recipe.requirements.minTier === 'grandmaster');
}

/**
 * Search recipes by name or description
 */
export function searchRecipes(query: string, professionId?: ProfessionId): CraftingRecipe[] {
  const recipes = professionId ? getRecipesByProfession(professionId) : ALL_RECIPES;
  const lowerQuery = query.toLowerCase();

  return recipes.filter(
    recipe =>
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get recipes that require a specific material
 */
export function getRecipesByMaterial(materialId: string): CraftingRecipe[] {
  return ALL_RECIPES.filter(recipe =>
    recipe.materials.some(mat => mat.materialId === materialId)
  );
}

/**
 * Get recipes that output a specific item
 */
export function getRecipesByOutput(itemId: string): CraftingRecipe[] {
  return ALL_RECIPES.filter(recipe => recipe.output.itemId === itemId);
}

/**
 * Get total number of recipes
 */
export function getTotalRecipeCount(): number {
  return ALL_RECIPES.length;
}

/**
 * Get recipe count by profession
 */
export function getRecipeCountByProfession(): Record<ProfessionId, number> {
  return {
    // Original 6 professions
    [ProfessionId.BLACKSMITHING]: blacksmithingRecipes.length,
    [ProfessionId.LEATHERWORKING]: leatherworkingRecipes.length,
    [ProfessionId.ALCHEMY]: alchemyRecipes.length,
    [ProfessionId.COOKING]: cookingRecipes.length,
    [ProfessionId.TAILORING]: tailoringRecipes.length,
    [ProfessionId.GUNSMITHING]: gunsmithingRecipes.length,
    // 5 new professions
    [ProfessionId.NATIVE_CRAFTS]: nativeCraftsRecipes.length,
    [ProfessionId.PROSPECTING]: prospectingRecipes.length,
    [ProfessionId.WOODWORKING]: woodworkingRecipes.length,
    [ProfessionId.TRAPPING]: trappingRecipes.length,
    [ProfessionId.LEADERSHIP]: leadershipRecipes.length
  };
}

/**
 * Get recipe statistics
 */
export function getRecipeStats() {
  const counts = getRecipeCountByProfession();
  const total = getTotalRecipeCount();

  return {
    total,
    byProfession: counts,
    legendary: getLegendaryRecipes().length,
    discoverable: ALL_RECIPES.filter(
      r => r.learningSource === 'discovery' && r.discoveryChance
    ).length,
    questRewards: ALL_RECIPES.filter(r => r.learningSource === 'quest_reward').length,
    trainerOnly: ALL_RECIPES.filter(r => r.learningSource === 'trainer').length,
    vendor: ALL_RECIPES.filter(r => r.learningSource === 'vendor').length
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate all recipe IDs are unique
 */
export function validateRecipeIds(): { valid: boolean; duplicates: string[] } {
  const ids = new Set<string>();
  const duplicates: string[] = [];

  for (const recipe of ALL_RECIPES) {
    if (ids.has(recipe.id)) {
      duplicates.push(recipe.id);
    }
    ids.add(recipe.id);
  }

  return {
    valid: duplicates.length === 0,
    duplicates
  };
}

/**
 * Log recipe database statistics
 */
export function logRecipeStats(): void {
  const stats = getRecipeStats();
  console.log('='.repeat(60));
  console.log('RECIPE DATABASE STATISTICS');
  console.log('='.repeat(60));
  console.log(`Total Recipes: ${stats.total}`);
  console.log('');
  console.log('By Profession (Original 6):');
  console.log(`  Blacksmithing: ${stats.byProfession.blacksmithing}`);
  console.log(`  Leatherworking: ${stats.byProfession.leatherworking}`);
  console.log(`  Alchemy: ${stats.byProfession.alchemy}`);
  console.log(`  Cooking: ${stats.byProfession.cooking}`);
  console.log(`  Tailoring: ${stats.byProfession.tailoring}`);
  console.log(`  Gunsmithing: ${stats.byProfession.gunsmithing}`);
  console.log('');
  console.log('By Profession (New 5):');
  console.log(`  Native Crafts: ${stats.byProfession.native_crafts}`);
  console.log(`  Prospecting: ${stats.byProfession.prospecting}`);
  console.log(`  Woodworking: ${stats.byProfession.woodworking}`);
  console.log(`  Trapping: ${stats.byProfession.trapping}`);
  console.log(`  Leadership: ${stats.byProfession.leadership}`);
  console.log('');
  console.log('By Learning Source:');
  console.log(`  Trainer: ${stats.trainerOnly}`);
  console.log(`  Vendor: ${stats.vendor}`);
  console.log(`  Discoverable: ${stats.discoverable}`);
  console.log(`  Quest Rewards: ${stats.questRewards}`);
  console.log(`  Legendary (Grandmaster): ${stats.legendary}`);
  console.log('='.repeat(60));

  // Validate unique IDs
  const validation = validateRecipeIds();
  if (!validation.valid) {
    console.warn('WARNING: Duplicate recipe IDs found:', validation.duplicates);
  } else {
    console.log('✓ All recipe IDs are unique');
  }
}

// Export default object with all functions
export default {
  ALL_RECIPES,
  RECIPE_MAP,
  RECIPES_BY_PROFESSION,
  getRecipeById,
  getRecipesByProfession,
  getRecipesByMinLevel,
  getRecipesAtLevel,
  getRecipesByCategory,
  getRecipesByLearningSource,
  getDiscoverableRecipes,
  getLegendaryRecipes,
  searchRecipes,
  getRecipesByMaterial,
  getRecipesByOutput,
  getTotalRecipeCount,
  getRecipeCountByProfession,
  getRecipeStats,
  validateRecipeIds,
  logRecipeStats
};
