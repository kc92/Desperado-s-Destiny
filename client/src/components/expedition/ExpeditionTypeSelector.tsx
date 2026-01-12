/**
 * ExpeditionTypeSelector Component
 * Select expedition type and duration tier
 */

import { Card, Button } from '@/components/ui';
import {
  expeditionService,
  ExpeditionType,
  ExpeditionDurationTier,
} from '@/services/expedition.service';
import type { ExpeditionTypesResponse } from '@/services/expedition.service';

interface ExpeditionTypeSelectorProps {
  config: ExpeditionTypesResponse;
  selectedDuration: ExpeditionDurationTier;
  onDurationChange: (tier: ExpeditionDurationTier) => void;
  onStart: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  hasEnoughEnergy: boolean;
  hasEnoughGold: boolean;
}

const DURATION_TIERS = [
  ExpeditionDurationTier.QUICK,
  ExpeditionDurationTier.STANDARD,
  ExpeditionDurationTier.EXTENDED,
] as const;

export function ExpeditionTypeSelector({
  config,
  selectedDuration,
  onDurationChange,
  onStart,
  onBack,
  isSubmitting,
  hasEnoughEnergy,
  hasEnoughGold,
}: ExpeditionTypeSelectorProps) {
  const type = config.type as ExpeditionType;
  const typeInfo = expeditionService.getTypeInfo(type);

  // Get duration config for selected tier
  const durationConfig = config.durations[selectedDuration];
  const durationInfo = expeditionService.getDurationInfo(selectedDuration);

  // Calculate estimated rewards based on tier
  const rewardMultiplier = selectedDuration === ExpeditionDurationTier.QUICK ? 1 :
                           selectedDuration === ExpeditionDurationTier.STANDARD ? 2 : 4;
  const estimatedGold = config.baseGoldReward * rewardMultiplier;
  const estimatedXp = config.baseXpReward * rewardMultiplier;

  // Success rate by tier
  const successRate = selectedDuration === ExpeditionDurationTier.QUICK ? 95 :
                      selectedDuration === ExpeditionDurationTier.STANDARD ? 85 : 70;

  const canStart = hasEnoughEnergy && hasEnoughGold;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-2">
        &larr; Back to Expeditions
      </Button>

      {/* Expedition Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{typeInfo.icon}</span>
          <div>
            <h2 className={`text-2xl font-bold ${typeInfo.color}`}>{config.name}</h2>
            <p className="text-gray-400">{config.description}</p>
          </div>
        </div>

        {/* Resource Requirements */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-3 rounded bg-gray-800/50 ${!hasEnoughEnergy ? 'border border-red-500/50' : ''}`}>
            <span className="text-gray-500 text-sm block">Energy Required</span>
            <span className={`text-xl font-bold ${hasEnoughEnergy ? 'text-yellow-400' : 'text-red-400'}`}>
              {config.energyCost}
            </span>
          </div>
          <div className={`p-3 rounded bg-gray-800/50 ${!hasEnoughGold ? 'border border-red-500/50' : ''}`}>
            <span className="text-gray-500 text-sm block">Gold Required</span>
            <span className={`text-xl font-bold ${hasEnoughGold ? 'text-amber-400' : 'text-red-400'}`}>
              ${config.goldCost || 0}
            </span>
          </div>
        </div>

        {/* Duration Tier Selection */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-300 mb-3">Select Duration</h3>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_TIERS.map(tier => {
              const tierInfo = expeditionService.getDurationInfo(tier);
              const tierConfig = config.durations[tier];
              const isSelected = tier === selectedDuration;

              return (
                <button
                  key={tier}
                  className={`p-4 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-amber-900/40 border-2 border-amber-500'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => onDurationChange(tier)}
                >
                  <div className={`font-bold mb-1 ${tierInfo.color}`}>
                    {tierInfo.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {expeditionService.formatDuration(tierConfig.minMs)} - {expeditionService.formatDuration(tierConfig.maxMs)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tierInfo.description.split(',')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimated Outcome */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-300 mb-3">Estimated Outcome</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">${estimatedGold}</div>
              <div className="text-xs text-gray-500">Gold Reward</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{estimatedXp}</div>
              <div className="text-xs text-gray-500">XP Reward</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                successRate >= 90 ? 'text-green-400' :
                successRate >= 80 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {successRate}%
              </div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Resource Types */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-300 mb-2">Possible Resources</h3>
          <div className="flex flex-wrap gap-2">
            {config.resourceTypes.map(resource => (
              <span
                key={resource}
                className="px-2 py-1 bg-gray-700/50 rounded text-sm text-gray-300 capitalize"
              >
                {resource.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onStart}
          disabled={!canStart || isSubmitting}
        >
          {isSubmitting ? (
            'Starting Expedition...'
          ) : !hasEnoughEnergy ? (
            'Not Enough Energy'
          ) : !hasEnoughGold ? (
            'Not Enough Gold'
          ) : (
            `Start ${durationInfo.name} Expedition (~${expeditionService.formatDuration(durationConfig.defaultMs)})`
          )}
        </Button>
      </Card>
    </div>
  );
}

export default ExpeditionTypeSelector;
