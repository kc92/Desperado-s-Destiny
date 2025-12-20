/**
 * Crafting Page
 * Craft weapons, armor, consumables, and other items
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LoadingSpinner, ProgressBar } from '@/components/ui';
import {
  craftingService,
  Recipe,
  RecipeCategory,
  CraftingStation,
  CraftingQuality,
} from '@/services/crafting.service';
import { logger } from '@/services/logger.service';

const CATEGORIES: RecipeCategory[] = ['weapon', 'armor', 'consumable', 'ammo', 'material'];

type CraftingView = 'recipes' | 'stations' | 'crafting';

export function Crafting() {
  const navigate = useNavigate();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stations, setStations] = useState<CraftingStation[]>([]);
  const [view, setView] = useState<CraftingView>('recipes');

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'all'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedStation, setSelectedStation] = useState<CraftingStation | null>(null);
  const [craftQuantity, setCraftQuantity] = useState(1);

  // Crafting state
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftProgress, setCraftProgress] = useState(0);
  const [craftResult, setCraftResult] = useState<{
    success: boolean;
    items?: Array<{ itemId: string; quantity: number; quality?: CraftingQuality }>;
    xpGained?: number;
    message: string;
  } | null>(null);

  // ===== Data Loading =====
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [recipesData, stationsData] = await Promise.all([
        craftingService.getRecipes(),
        craftingService.getStations(),
      ]);

      setRecipes(recipesData);
      setStations(stationsData);
    } catch (err) {
      logger.error('Failed to load crafting data', err);
      setError('Failed to load crafting data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== Filtering =====
  const filteredRecipes = selectedCategory === 'all'
    ? recipes
    : recipes.filter(r => r.category === selectedCategory);

  // ===== Actions =====
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCraftQuantity(1);
    setCraftResult(null);
    setView('crafting');
  };

  const handleCraft = async () => {
    if (!selectedRecipe) return;

    setIsCrafting(true);
    setCraftProgress(0);
    setCraftResult(null);
    setError(null);

    // Simulate crafting progress
    const totalTime = selectedRecipe.craftTime * craftQuantity * 100; // ms for demo
    const intervalTime = 100;
    const progressIncrement = 100 / (totalTime / intervalTime);

    const progressInterval = setInterval(() => {
      setCraftProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + progressIncrement);
      });
    }, intervalTime);

    try {
      const result = await craftingService.craft(
        selectedRecipe.recipeId,
        craftQuantity,
        selectedStation?.id
      );

      clearInterval(progressInterval);
      setCraftProgress(100);

      if (result.success) {
        setCraftResult({
          success: true,
          items: result.itemsCrafted.map(i => ({
            itemId: i.itemId,
            quantity: i.quantity,
            quality: i.quality,
          })),
          xpGained: result.xpGained,
          message: result.message,
        });
      } else {
        setCraftResult({
          success: false,
          message: result.error || result.message || 'Crafting failed',
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      logger.error('Crafting failed', err);
      setError('Crafting failed. Please try again.');
      setCraftResult({
        success: false,
        message: 'Crafting failed. Please try again.',
      });
    } finally {
      setIsCrafting(false);
    }
  };

  const handleBackToRecipes = () => {
    setSelectedRecipe(null);
    setCraftResult(null);
    setCraftProgress(0);
    setView('recipes');
  };

  // ===== Render Helpers =====
  const renderCategoryTabs = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setSelectedCategory('all')}
      >
        All
      </Button>
      {CATEGORIES.map(cat => (
        <Button
          key={cat}
          variant={selectedCategory === cat ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory(cat)}
        >
          {craftingService.getCategoryIcon(cat)} {craftingService.getCategoryName(cat)}
        </Button>
      ))}
    </div>
  );

  const renderRecipeList = () => (
    <div className="space-y-4">
      {renderCategoryTabs()}

      {filteredRecipes.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-400">No recipes found in this category.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map(recipe => (
            <Card
              key={recipe._id}
              className="p-4 cursor-pointer hover:border-amber-500 transition-colors"
              onClick={() => handleSelectRecipe(recipe)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold">{recipe.name}</h3>
                <span className="text-xl">{craftingService.getCategoryIcon(recipe.category)}</span>
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{recipe.description}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Skill:</span>
                  <span className="text-blue-400">
                    {craftingService.getSkillName(recipe.skillRequired.skillId)} Lv.{recipe.skillRequired.level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span>{craftingService.formatCraftTime(recipe.craftTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Output:</span>
                  <span className="text-green-400">{recipe.output.quantity}x</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStations = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-amber-400">Crafting Stations</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stations.map(station => (
          <Card
            key={station.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedStation?.id === station.id
                ? 'border-amber-500 bg-amber-900/20'
                : station.isAvailable
                ? 'hover:border-gray-600'
                : 'opacity-50'
            }`}
            onClick={() => station.isAvailable && setSelectedStation(
              selectedStation?.id === station.id ? null : station
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold">{station.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                station.isAvailable ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
              }`}>
                {station.isAvailable ? 'Available' : 'Locked'}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{station.description}</p>
            <div className="text-sm">
              <span className="text-gray-500">Location: </span>
              <span>{station.location || 'Unknown'}</span>
            </div>
            {station.bonuses && (
              <div className="mt-2 flex flex-wrap gap-2">
                {station.bonuses.qualityBonus && (
                  <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-400 rounded">
                    +{station.bonuses.qualityBonus}% Quality
                  </span>
                )}
                {station.bonuses.speedBonus && (
                  <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded">
                    +{station.bonuses.speedBonus}% Speed
                  </span>
                )}
                {station.bonuses.xpBonus && (
                  <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">
                    +{station.bonuses.xpBonus}% XP
                  </span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCraftingView = () => {
    if (!selectedRecipe) return null;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBackToRecipes} className="mb-4">
          &larr; Back to Recipes
        </Button>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-amber-400">{selectedRecipe.name}</h2>
              <p className="text-gray-400">{selectedRecipe.description}</p>
            </div>
            <span className="text-4xl">{craftingService.getCategoryIcon(selectedRecipe.category)}</span>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-300 mb-2">Required Materials</h3>
            <div className="grid gap-2">
              {selectedRecipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-800/50 rounded p-2">
                  <span>{ing.name || ing.itemId}</span>
                  <span className="text-amber-400">x{ing.quantity * craftQuantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-300 mb-2">Output</h3>
            <div className="flex justify-between items-center bg-green-900/30 rounded p-3">
              <span className="text-green-400">{selectedRecipe.output.name || selectedRecipe.output.itemId}</span>
              <span className="text-green-400 font-bold">x{selectedRecipe.output.quantity * craftQuantity}</span>
            </div>
          </div>

          {/* Skill & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-gray-800/50 rounded p-3">
              <span className="text-gray-500">Required Skill</span>
              <div className="text-blue-400">
                {craftingService.getSkillName(selectedRecipe.skillRequired.skillId)} Lv.{selectedRecipe.skillRequired.level}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <span className="text-gray-500">Craft Time</span>
              <div>{craftingService.formatCraftTime(selectedRecipe.craftTime * craftQuantity)}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-3">
              <span className="text-gray-500">XP Reward</span>
              <div className="text-purple-400">+{selectedRecipe.xpReward * craftQuantity} XP</div>
            </div>
            {selectedStation && (
              <div className="bg-amber-900/30 rounded p-3">
                <span className="text-gray-500">Station</span>
                <div className="text-amber-400">{selectedStation.name}</div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isCrafting && !craftResult && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-300 mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCraftQuantity(Math.max(1, craftQuantity - 1))}
                  disabled={craftQuantity <= 1}
                >
                  -
                </Button>
                <span className="text-xl font-bold w-12 text-center">{craftQuantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCraftQuantity(craftQuantity + 1)}
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCraftQuantity(5)}
                >
                  5x
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCraftQuantity(10)}
                >
                  10x
                </Button>
              </div>
            </div>
          )}

          {/* Crafting Progress */}
          {isCrafting && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Crafting...</span>
                <span className="text-amber-400">{Math.round(craftProgress)}%</span>
              </div>
              <ProgressBar value={craftProgress} max={100} color="amber" />
            </div>
          )}

          {/* Result */}
          {craftResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              craftResult.success ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{craftResult.success ? '✓' : '✗'}</span>
                <span className={`font-bold ${craftResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {craftResult.success ? 'Success!' : 'Failed'}
                </span>
              </div>
              <p className={craftResult.success ? 'text-green-300' : 'text-red-300'}>
                {craftResult.message}
              </p>
              {craftResult.items && craftResult.items.length > 0 && (
                <div className="mt-3">
                  {craftResult.items.map((item, idx) => {
                    const qualityInfo = item.quality ? craftingService.getQualityInfo(item.quality) : null;
                    return (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.itemId}
                          {qualityInfo && (
                            <span className={`ml-2 text-sm ${qualityInfo.color}`}>
                              ({qualityInfo.name})
                            </span>
                          )}
                        </span>
                        <span className="text-green-400">x{item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {craftResult.xpGained && (
                <div className="mt-2 text-purple-400">+{craftResult.xpGained} XP</div>
              )}
            </div>
          )}

          {/* Craft Button */}
          <div className="flex gap-3">
            {!craftResult ? (
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleCraft}
                disabled={isCrafting}
              >
                {isCrafting ? 'Crafting...' : `Craft ${craftQuantity}x ${selectedRecipe.name}`}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setCraftResult(null);
                    setCraftProgress(0);
                  }}
                >
                  Craft Again
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBackToRecipes}
                >
                  Different Recipe
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ===== Main Render =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Crafting</h1>
        <p className="text-gray-400">
          Create weapons, armor, consumables, and more from raw materials.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* View Tabs */}
      {view !== 'crafting' && !error && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === 'recipes' ? 'primary' : 'ghost'}
            onClick={() => setView('recipes')}
          >
            Recipes
          </Button>
          <Button
            variant={view === 'stations' ? 'primary' : 'ghost'}
            onClick={() => setView('stations')}
          >
            Stations {selectedStation && `(${selectedStation.name})`}
          </Button>
        </div>
      )}

      {!error && view === 'recipes' && renderRecipeList()}
      {!error && view === 'stations' && renderStations()}
      {!error && view === 'crafting' && renderCraftingView()}
    </div>
  );
}

export default Crafting;
