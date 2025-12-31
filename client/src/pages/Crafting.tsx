/**
 * Crafting Page
 * AAA-quality crafting interface with split-panel layout
 * Phase 4 - AAA Crafting UI Overhaul
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, LoadingSpinner, Button } from '@/components/ui';
import { RecipeList, RecipeDetails } from '@/components/crafting';
import {
  craftingService,
  Recipe,
  CraftingStation,
  CraftingQuality,
} from '@/services/crafting.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { logger } from '@/services/logger.service';

export function Crafting() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stations, setStations] = useState<CraftingStation[]>([]);

  // Selection state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedStation, setSelectedStation] = useState<CraftingStation | null>(null);

  // Crafting state
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftProgress, setCraftProgress] = useState(0);
  const [craftResult, setCraftResult] = useState<{
    success: boolean;
    items?: Array<{ itemId: string; quantity: number; quality?: CraftingQuality }>;
    xpGained?: number;
    message: string;
  } | null>(null);

  // Character data
  const { currentCharacter, refreshCharacter } = useCharacterStore();

  // Toast notifications
  const toast = useToast();

  // Ref for interval cleanup to prevent race conditions
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  // Build player skill levels map
  const playerSkillLevels: Record<string, number> = {};
  if (currentCharacter?.skills) {
    for (const skill of currentCharacter.skills) {
      playerSkillLevels[skill.skillId.toLowerCase()] = skill.level;
    }
  }

  // Build player inventory map
  const playerInventory: Record<string, number> = {};
  if (currentCharacter?.inventory) {
    for (const item of currentCharacter.inventory) {
      playerInventory[item.itemId] = (playerInventory[item.itemId] || 0) + item.quantity;
    }
  }

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
      logger.error('Failed to load crafting data', err instanceof Error ? err : undefined);
      setError('Failed to load crafting data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== Actions =====
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCraftResult(null);
    setCraftProgress(0);
  };

  const handleCraft = async (quantity: number) => {
    if (!selectedRecipe) return;

    // Clear any existing interval first
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setIsCrafting(true);
    setCraftProgress(0);
    setCraftResult(null);
    setError(null);

    // Simulate crafting progress
    const totalTime = Math.min(3000, selectedRecipe.craftTime * quantity * 100);
    const intervalTime = 50;
    const progressIncrement = 100 / (totalTime / intervalTime);

    progressIntervalRef.current = setInterval(() => {
      setCraftProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          return 100;
        }
        return Math.min(100, prev + progressIncrement);
      });
    }, intervalTime);

    try {
      const result = await craftingService.craft(
        selectedRecipe.recipeId,
        quantity,
        selectedStation?.id
      );

      // Clear interval and set to 100%
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
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

        // Show success toast
        const craftedSummary = result.itemsCrafted
          .map(i => {
            const qualityStr = i.quality ? ` (${craftingService.getQualityInfo(i.quality).name})` : '';
            return `${i.quantity}x ${i.itemId}${qualityStr}`;
          })
          .join(', ');
        toast.reward('Crafting Complete!', craftedSummary);

        // Show level up toast if applicable
        if (result.newLevel) {
          toast.success('Skill Level Up!', `You reached level ${result.newLevel}!`);
        }

        // Refresh character to update inventory
        await refreshCharacter();
      } else {
        const errorMsg = result.error || result.message || 'Crafting failed';
        setCraftResult({
          success: false,
          message: errorMsg,
        });
        toast.error('Crafting Failed', errorMsg);
      }
    } catch (err: any) {
      // Clear interval on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      logger.error('Crafting failed', err instanceof Error ? err : undefined);
      const errorMsg = err.message || 'Crafting failed. Please try again.';
      setCraftResult({
        success: false,
        message: errorMsg,
      });
      toast.error('Crafting Failed', errorMsg);
    } finally {
      setIsCrafting(false);
    }
  };

  const handleClearResult = () => {
    setCraftResult(null);
    setCraftProgress(0);
  };

  // ===== Render =====
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Crafting</h1>
          <p className="text-gray-400 text-sm">
            Create weapons, armor, consumables, and more from raw materials.
          </p>
        </div>
        {selectedStation && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/30 rounded-lg">
            <span className="text-amber-400 text-sm">Station:</span>
            <span className="text-white font-medium">{selectedStation.name}</span>
            <button
              onClick={() => setSelectedStation(null)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              x
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
          <Button variant="ghost" size="sm" onClick={loadData} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-5rem)]">
          {/* Left Panel - Recipe List */}
          <Card className="p-4 overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
              <span>\uD83D\uDCDC</span> Recipes
              <span className="text-sm font-normal text-gray-500">({recipes.length})</span>
            </h2>
            <div className="flex-1 overflow-hidden">
              <RecipeList
                recipes={recipes}
                selectedRecipe={selectedRecipe}
                onSelectRecipe={handleSelectRecipe}
                playerSkillLevels={playerSkillLevels}
                playerInventory={playerInventory}
              />
            </div>
          </Card>

          {/* Right Panel - Recipe Details */}
          <Card className="lg:col-span-2 p-6 overflow-hidden flex flex-col">
            {selectedRecipe ? (
              <RecipeDetails
                recipe={selectedRecipe}
                playerSkillLevels={playerSkillLevels}
                playerInventory={playerInventory}
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
                onCraft={handleCraft}
                isCrafting={isCrafting}
                craftProgress={craftProgress}
                craftResult={craftResult}
                onClearResult={handleClearResult}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">\uD83D\uDD28</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Select a Recipe</h3>
                <p className="text-gray-500 max-w-md">
                  Choose a recipe from the list to view its details, requirements, and craft items.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-1">\uD83D\uDCDA</div>
                    <div className="text-gray-400">{recipes.length} Recipes</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-1">\uD83C\uDFED</div>
                    <div className="text-gray-400">{stations.filter(s => s.isAvailable).length} Stations</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default Crafting;
