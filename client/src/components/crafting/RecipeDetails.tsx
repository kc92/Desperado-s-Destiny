/**
 * RecipeDetails Component
 * Shows detailed information about a selected recipe
 * Phase 4 - AAA Crafting UI
 */

import { useState, useEffect } from 'react';
import { Button, ProgressBar } from '@/components/ui';
import { Recipe, CraftingStation, CraftingQuality, craftingService } from '@/services/crafting.service';
import { QualityPreview } from './QualityPreview';

interface RecipeDetailsProps {
  recipe: Recipe;
  playerSkillLevels: Record<string, number>;
  playerInventory: Record<string, number>;
  stations: CraftingStation[];
  selectedStation: CraftingStation | null;
  onSelectStation: (station: CraftingStation | null) => void;
  onCraft: (quantity: number) => Promise<void>;
  isCrafting: boolean;
  craftProgress: number;
  craftResult: {
    success: boolean;
    items?: Array<{ itemId: string; quantity: number; quality?: CraftingQuality }>;
    xpGained?: number;
    message: string;
  } | null;
  onClearResult: () => void;
}

export function RecipeDetails({
  recipe,
  playerSkillLevels,
  playerInventory,
  stations,
  selectedStation,
  onSelectStation,
  onCraft,
  isCrafting,
  craftProgress,
  craftResult,
  onClearResult,
}: RecipeDetailsProps) {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when recipe changes
  useEffect(() => {
    setQuantity(1);
  }, [recipe.recipeId]);

  const skillId = recipe.skillRequired.skillId.toLowerCase();
  const playerLevel = playerSkillLevels[skillId] || 0;
  const meetsSkill = playerLevel >= recipe.skillRequired.level;

  // Check materials availability
  const materialStatus = recipe.ingredients.map(ing => ({
    ...ing,
    have: playerInventory[ing.itemId] || 0,
    needed: ing.quantity * quantity,
    sufficient: (playerInventory[ing.itemId] || 0) >= ing.quantity * quantity,
  }));

  const canCraft = meetsSkill && materialStatus.every(m => m.sufficient);

  // Max craftable quantity based on materials
  const maxCraftable = Math.min(
    99,
    ...recipe.ingredients.map(ing => {
      const have = playerInventory[ing.itemId] || 0;
      return Math.floor(have / ing.quantity);
    })
  );

  // Get applicable stations
  const applicableStations = stations.filter(
    s => s.isAvailable && s.supportedCategories.includes(recipe.category)
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="text-5xl">{craftingService.getCategoryIcon(recipe.category)}</div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-amber-400">{recipe.name}</h2>
          <p className="text-gray-400 mt-1">{recipe.description}</p>
          <div className="flex gap-3 mt-2 text-sm">
            <span className={meetsSkill ? 'text-blue-400' : 'text-red-400'}>
              {craftingService.getSkillName(recipe.skillRequired.skillId)} Lv.{recipe.skillRequired.level}
              {!meetsSkill && ` (You: ${playerLevel})`}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">{craftingService.formatCraftTime(recipe.craftTime)}</span>
            <span className="text-gray-500">|</span>
            <span className="text-purple-400">+{recipe.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
        {/* Left Column - Materials & Station */}
        <div className="space-y-6">
          {/* Materials */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
              Required Materials
            </h3>
            <div className="space-y-2">
              {materialStatus.map((mat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    mat.sufficient ? 'bg-gray-800/50' : 'bg-red-900/20 border border-red-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={mat.sufficient ? 'text-green-400' : 'text-red-400'}>
                      {mat.sufficient ? '\u2713' : '\u2717'}
                    </span>
                    <span className={mat.sufficient ? 'text-white' : 'text-red-300'}>
                      {mat.name || mat.itemId}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={mat.sufficient ? 'text-green-400' : 'text-red-400'}>
                      {mat.have}
                    </span>
                    <span className="text-gray-500"> / </span>
                    <span className="text-amber-400">{mat.needed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crafting Station */}
          {applicableStations.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                Crafting Station (Optional)
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => onSelectStation(null)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    !selectedStation
                      ? 'bg-gray-700 border border-gray-600'
                      : 'bg-gray-800/50 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span className="text-gray-400">No Station (Basic Crafting)</span>
                </button>
                {applicableStations.map(station => (
                  <button
                    key={station.id}
                    onClick={() => onSelectStation(station)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedStation?.id === station.id
                        ? 'bg-amber-900/30 border border-amber-500'
                        : 'bg-gray-800/50 border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-white">{station.name}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{station.location}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {station.bonuses?.qualityBonus && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded">
                            +{station.bonuses.qualityBonus}% Quality
                          </span>
                        )}
                        {station.bonuses?.speedBonus && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded">
                            +{station.bonuses.speedBonus}% Speed
                          </span>
                        )}
                        {station.bonuses?.xpBonus && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded">
                            +{station.bonuses.xpBonus}% XP
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Output & Quality */}
        <div className="space-y-6">
          {/* Output */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
              Output
            </h3>
            <div className="p-4 bg-green-900/20 border border-green-900/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">
                  {recipe.output.name || recipe.output.itemId}
                </span>
                <span className="text-green-400 font-bold text-xl">
                  x{recipe.output.quantity * quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Quality Preview */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
              Quality Chances
            </h3>
            <QualityPreview
              playerLevel={playerLevel}
              requiredLevel={recipe.skillRequired.level}
              stationBonus={selectedStation?.bonuses?.qualityBonus || 0}
            />
          </div>

          {/* XP Preview */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
              Experience Gain
            </h3>
            <div className="p-3 bg-purple-900/20 border border-purple-900/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Base XP</span>
                <span className="text-purple-400">+{recipe.xpReward * quantity}</span>
              </div>
              {selectedStation?.bonuses?.xpBonus && (
                <div className="flex justify-between items-center mt-1 text-sm">
                  <span className="text-gray-500">Station Bonus</span>
                  <span className="text-green-400">+{selectedStation.bonuses.xpBonus}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crafting Controls */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        {/* Crafting Progress */}
        {isCrafting && (
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Crafting {recipe.name}...</span>
              <span className="text-amber-400">{Math.round(craftProgress)}%</span>
            </div>
            <ProgressBar value={craftProgress} max={100} color="amber" />
          </div>
        )}

        {/* Craft Result */}
        {craftResult && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              craftResult.success
                ? 'bg-green-900/30 border border-green-500'
                : 'bg-red-900/30 border border-red-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{craftResult.success ? '\u2713' : '\u2717'}</span>
                  <span className={`font-bold ${craftResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {craftResult.success ? 'Success!' : 'Failed'}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${craftResult.success ? 'text-green-300' : 'text-red-300'}`}>
                  {craftResult.message}
                </p>
                {craftResult.items && craftResult.items.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {craftResult.items.map((item, idx) => {
                      const qualityInfo = item.quality ? craftingService.getQualityInfo(item.quality) : null;
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-green-400">+{item.quantity}x</span>
                          <span>{item.itemId}</span>
                          {qualityInfo && (
                            <span className={`${qualityInfo.color} text-xs`}>({qualityInfo.name})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {craftResult.xpGained && (
                  <div className="mt-2 text-purple-400 text-sm">+{craftResult.xpGained} XP</div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClearResult}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Quantity & Craft Button */}
        {!isCrafting && !craftResult && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Qty:</span>
              <div className="flex items-center bg-gray-800 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxCraftable || 99}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(maxCraftable || 99, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center bg-transparent text-white focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(maxCraftable || 99, quantity + 1))}
                  disabled={quantity >= (maxCraftable || 99)}
                  className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <div className="flex gap-1">
                {[5, 10, 25].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuantity(Math.min(maxCraftable || 99, n))}
                    disabled={n > (maxCraftable || 0)}
                    className="px-2 py-1 text-xs bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {n}x
                  </button>
                ))}
                {maxCraftable > 0 && (
                  <button
                    onClick={() => setQuantity(maxCraftable)}
                    className="px-2 py-1 text-xs bg-gray-800 rounded hover:bg-gray-700 text-amber-400"
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => onCraft(quantity)}
              disabled={!canCraft}
            >
              {!meetsSkill
                ? `Need ${craftingService.getSkillName(skillId)} Lv.${recipe.skillRequired.level}`
                : !materialStatus.every(m => m.sufficient)
                ? 'Missing Materials'
                : `Craft ${quantity}x ${recipe.name}`}
            </Button>
          </div>
        )}

        {/* Actions after result */}
        {craftResult && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                onClearResult();
                if (canCraft) onCraft(quantity);
              }}
              disabled={!canCraft}
            >
              {canCraft ? 'Craft Again' : 'Not Enough Materials'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetails;
