/**
 * RecipeList Component
 * Displays a filterable, searchable list of crafting recipes
 * Phase 4 - AAA Crafting UI
 */

import { useState, useMemo } from 'react';
import { Recipe, RecipeCategory, craftingService } from '@/services/crafting.service';

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelectRecipe: (recipe: Recipe) => void;
  playerSkillLevels: Record<string, number>;
  playerInventory: Record<string, number>;
}

const CATEGORIES: Array<{ key: RecipeCategory | 'all'; label: string; icon: string }> = [
  { key: 'all', label: 'All', icon: '\uD83D\uDCDC' },
  { key: 'weapon', label: 'Weapons', icon: '\uD83D\uDDE1\uFE0F' },
  { key: 'armor', label: 'Armor', icon: '\uD83D\uDEE1\uFE0F' },
  { key: 'consumable', label: 'Consumables', icon: '\uD83E\uDDEA' },
  { key: 'ammo', label: 'Ammo', icon: '\uD83D\uDD2B' },
  { key: 'material', label: 'Materials', icon: '\uD83D\uDD27' },
];

export function RecipeList({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  playerSkillLevels,
  playerInventory,
}: RecipeListProps) {
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'craftable'>('level');

  // Check if player can craft a recipe
  const canCraft = (recipe: Recipe): boolean => {
    // Check skill level
    const skillId = recipe.skillRequired.skillId.toLowerCase();
    const playerLevel = playerSkillLevels[skillId] || 0;
    if (playerLevel < recipe.skillRequired.level) return false;

    // Check materials
    for (const ing of recipe.ingredients) {
      const have = playerInventory[ing.itemId] || 0;
      if (have < ing.quantity) return false;
    }

    return true;
  };

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(r => r.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        r =>
          r.name.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.skillRequired.skillId.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'level':
        result.sort((a, b) => a.skillRequired.level - b.skillRequired.level);
        break;
      case 'craftable':
        result.sort((a, b) => {
          const aCan = canCraft(a);
          const bCan = canCraft(b);
          if (aCan && !bCan) return -1;
          if (!aCan && bCan) return 1;
          return a.skillRequired.level - b.skillRequired.level;
        });
        break;
    }

    return result;
  }, [recipes, selectedCategory, searchQuery, sortBy, playerSkillLevels, playerInventory]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recipes.length };
    for (const recipe of recipes) {
      counts[recipe.category] = (counts[recipe.category] || 0) + 1;
    }
    return counts;
  }, [recipes]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectedCategory === cat.key
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat.icon} {cat.label}
            <span className="ml-1 text-gray-500">({categoryCounts[cat.key] || 0})</span>
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-3 text-xs">
        <span className="text-gray-500">Sort:</span>
        {(['level', 'name', 'craftable'] as const).map(sort => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            className={`px-2 py-0.5 rounded ${
              sortBy === sort ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {sort === 'level' ? 'Level' : sort === 'name' ? 'Name' : 'Craftable'}
          </button>
        ))}
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredRecipes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchQuery ? 'No recipes match your search.' : 'No recipes in this category.'}
          </div>
        ) : (
          filteredRecipes.map(recipe => {
            const isCraftable = canCraft(recipe);
            const isSelected = selectedRecipe?.recipeId === recipe.recipeId;
            const skillLevel = playerSkillLevels[recipe.skillRequired.skillId.toLowerCase()] || 0;
            const meetsSkill = skillLevel >= recipe.skillRequired.level;

            return (
              <div
                key={recipe.recipeId}
                onClick={() => onSelectRecipe(recipe)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-900/40 border-2 border-amber-500'
                    : isCraftable
                    ? 'bg-gray-800/80 border border-gray-700 hover:border-amber-500/50'
                    : 'bg-gray-800/40 border border-gray-800 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{craftingService.getCategoryIcon(recipe.category)}</span>
                      <h4 className={`font-medium truncate ${isCraftable ? 'text-white' : 'text-gray-400'}`}>
                        {recipe.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{recipe.description}</p>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <span className={`text-xs ${meetsSkill ? 'text-blue-400' : 'text-red-400'}`}>
                      Lv.{recipe.skillRequired.level}
                    </span>
                    {isCraftable && (
                      <span className="text-xs text-green-400 mt-1">Ready</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        {filteredRecipes.filter(r => canCraft(r)).length} / {filteredRecipes.length} craftable
      </div>
    </div>
  );
}

export default RecipeList;
