/**
 * ExpeditionCard Component
 * Displays a single expedition type option
 */

import { Card, Button } from '@/components/ui';
import {
  expeditionService,
  ExpeditionType,
  ExpeditionDurationTier,
  IExpeditionAvailability,
} from '@/services/expedition.service';
import type { ExpeditionTypesResponse } from '@/services/expedition.service';

interface ExpeditionCardProps {
  config: ExpeditionTypesResponse;
  availability?: IExpeditionAvailability;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function ExpeditionCard({
  config,
  availability,
  isSelected,
  onSelect,
  disabled,
}: ExpeditionCardProps) {
  const type = config.type as ExpeditionType;
  const typeInfo = expeditionService.getTypeInfo(type);
  const canStart = availability?.canStart ?? false;
  const reason = availability?.reason;

  // Calculate duration range display
  const quickDuration = config.durations[ExpeditionDurationTier.QUICK];
  const extendedDuration = config.durations[ExpeditionDurationTier.EXTENDED];
  const durationRange = `${expeditionService.formatDuration(quickDuration.minMs)} - ${expeditionService.formatDuration(extendedDuration.maxMs)}`;

  return (
    <Card
      className={`p-4 transition-all cursor-pointer ${
        isSelected
          ? 'border-amber-500 bg-amber-900/20'
          : canStart && !disabled
          ? 'hover:border-amber-500/50 hover:bg-gray-800/50'
          : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={() => canStart && !disabled && onSelect()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{typeInfo.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${typeInfo.color}`}>{config.name}</h3>
            <p className="text-xs text-gray-500">
              Skill: {config.primarySkill} | Level {config.minLevel || 1}+
            </p>
          </div>
        </div>
        {isSelected && (
          <span className="text-amber-400 text-xl">&#10003;</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{config.description}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-500 text-xs block">Duration</span>
          <span className="text-gray-300">{durationRange}</span>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-500 text-xs block">Base Rewards</span>
          <span className="text-green-400">${config.baseGoldReward}</span>
          <span className="text-gray-500 mx-1">+</span>
          <span className="text-purple-400">{config.baseXpReward} XP</span>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-500 text-xs block">Energy Cost</span>
          <span className="text-yellow-400">{config.energyCost}</span>
        </div>
        <div className="bg-gray-800/50 rounded p-2">
          <span className="text-gray-500 text-xs block">Gold Cost</span>
          <span className="text-amber-400">${config.goldCost || 0}</span>
        </div>
      </div>

      {/* Flavor Text */}
      <p className="text-xs text-gray-500 italic mb-3">"{config.flavorText}"</p>

      {/* Availability Status */}
      {!canStart && reason && (
        <div className="p-2 bg-red-900/30 rounded text-red-400 text-sm">
          {reason}
        </div>
      )}

      {canStart && !disabled && (
        <Button
          variant={isSelected ? 'primary' : 'ghost'}
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? 'Selected' : 'Select Expedition'}
        </Button>
      )}
    </Card>
  );
}

export default ExpeditionCard;
