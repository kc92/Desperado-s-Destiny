/**
 * Crafting Service
 * API client for the crafting system
 */

import api from './api';

// ===== Types =====

export type RecipeCategory = 'weapon' | 'armor' | 'consumable' | 'ammo' | 'material';

export enum CraftingQuality {
  POOR = 'POOR',
  COMMON = 'COMMON',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
  MASTERWORK = 'MASTERWORK',
  LEGENDARY = 'LEGENDARY'
}

export interface RecipeIngredient {
  itemId: string;
  name?: string;
  quantity: number;
}

export interface RecipeOutput {
  itemId: string;
  name?: string;
  quantity: number;
}

export interface RecipeSkillRequirement {
  skillId: string;
  level: number;
}

export interface Recipe {
  _id: string;
  recipeId: string;
  name: string;
  description: string;
  category: RecipeCategory;
  ingredients: RecipeIngredient[];
  output: RecipeOutput;
  skillRequired: RecipeSkillRequirement;
  craftTime: number; // minutes
  xpReward: number;
  isUnlocked: boolean;
}

export interface CraftingStation {
  id: string;
  name: string;
  description: string;
  tier: number;
  supportedCategories: RecipeCategory[];
  bonuses?: {
    speedBonus?: number;
    qualityBonus?: number;
    xpBonus?: number;
  };
  isAvailable: boolean;
  location?: string;
}

export interface CraftedItem {
  itemId: string;
  itemName?: string;
  quantity: number;
  quality?: CraftingQuality;
}

export interface CraftingStats {
  totalCrafts: number;
  totalCriticals: number;
  totalMasterworks: number;
  totalLegendaries: number;
  goldEarned: number;
  goldSpent: number;
  favoriteRecipe?: string;
  mostCraftedItem?: string;
}

// ===== Request/Response Types =====

export interface GetRecipesResponse {
  success: boolean;
  recipes: Recipe[];
}

export interface CanCraftResponse {
  canCraft: boolean;
  reason?: string;
  recipe?: {
    recipeId: string;
    name: string;
    ingredients: RecipeIngredient[];
    output: RecipeOutput;
    craftTime: number;
  };
  currentLevel?: number;
  requiredLevel?: number;
  missingMaterials?: Array<{
    itemId: string;
    needed: number;
    have: number;
  }>;
}

export interface CraftItemRequest {
  recipeId: string;
  quantity?: number;
  stationId?: string;
}

export interface CraftItemResponse {
  success: boolean;
  error?: string;
  itemsCrafted: CraftedItem[];
  xpGained: number;
  timeTaken: number;
  criticalSuccess?: boolean;
  newLevel?: number;
  newTier?: string;
  message: string;
}

export interface GetStationsResponse {
  success: boolean;
  stations: CraftingStation[];
}

// ===== Crafting Service =====

export const craftingService = {
  /**
   * Get all available recipes
   */
  async getRecipes(): Promise<Recipe[]> {
    const response = await api.get<{ data: { recipes: Recipe[] } }>('/crafting/recipes');
    return response.data.data?.recipes || [];
  },

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(category: RecipeCategory): Promise<Recipe[]> {
    const response = await api.get<{ data: { recipes: Recipe[] } }>(`/crafting/recipes/${category}`);
    return response.data.data?.recipes || [];
  },

  /**
   * Check if can craft a recipe
   */
  async canCraft(recipeId: string): Promise<CanCraftResponse> {
    const response = await api.get<{ data: CanCraftResponse }>(`/crafting/can-craft/${recipeId}`);
    return response.data.data;
  },

  /**
   * Craft an item
   */
  async craft(recipeId: string, quantity: number = 1, stationId?: string): Promise<CraftItemResponse> {
    const response = await api.post<{ data: CraftItemResponse }>('/crafting/craft', {
      recipeId,
      quantity,
      stationId,
    });
    return response.data.data;
  },

  /**
   * Get available crafting stations
   */
  async getStations(): Promise<CraftingStation[]> {
    const response = await api.get<{ data: { stations: CraftingStation[] } }>('/crafting/stations');
    return response.data.data?.stations || [];
  },

  // ===== Helper Methods =====

  /**
   * Get category display name
   */
  getCategoryName(category: RecipeCategory): string {
    const names: Record<RecipeCategory, string> = {
      weapon: 'Weapons',
      armor: 'Armor',
      consumable: 'Consumables',
      ammo: 'Ammunition',
      material: 'Materials',
    };
    return names[category] || category;
  },

  /**
   * Get category icon
   */
  getCategoryIcon(category: RecipeCategory): string {
    const icons: Record<RecipeCategory, string> = {
      weapon: '🗡️',
      armor: '🛡️',
      consumable: '🧪',
      ammo: '🔫',
      material: '🔧',
    };
    return icons[category] || '📦';
  },

  /**
   * Get quality display info
   */
  getQualityInfo(quality: CraftingQuality): { name: string; color: string } {
    const info: Record<CraftingQuality, { name: string; color: string }> = {
      [CraftingQuality.POOR]: { name: 'Poor', color: 'text-gray-500' },
      [CraftingQuality.COMMON]: { name: 'Common', color: 'text-gray-300' },
      [CraftingQuality.GOOD]: { name: 'Good', color: 'text-green-400' },
      [CraftingQuality.EXCELLENT]: { name: 'Excellent', color: 'text-blue-400' },
      [CraftingQuality.MASTERWORK]: { name: 'Masterwork', color: 'text-purple-400' },
      [CraftingQuality.LEGENDARY]: { name: 'Legendary', color: 'text-yellow-400' },
    };
    return info[quality] || { name: quality, color: 'text-white' };
  },

  /**
   * Format craft time
   */
  formatCraftTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Get skill display name
   */
  getSkillName(skillId: string): string {
    const names: Record<string, string> = {
      blacksmithing: 'Blacksmithing',
      leatherworking: 'Leatherworking',
      alchemy: 'Alchemy',
      gunsmithing: 'Gunsmithing',
      cooking: 'Cooking',
      carpentry: 'Carpentry',
      tailoring: 'Tailoring',
      mining: 'Mining',
      herbalism: 'Herbalism',
    };
    return names[skillId] || skillId.charAt(0).toUpperCase() + skillId.slice(1);
  },

  /**
   * Sort recipes by level requirement
   */
  sortByLevel(recipes: Recipe[]): Recipe[] {
    return [...recipes].sort((a, b) => (a.skillRequired?.level ?? 0) - (b.skillRequired?.level ?? 0));
  },

  /**
   * Filter recipes by level
   */
  filterByLevel(recipes: Recipe[], maxLevel: number): Recipe[] {
    return recipes.filter(r => (r.skillRequired?.level ?? 0) <= maxLevel);
  },
};

export default craftingService;
