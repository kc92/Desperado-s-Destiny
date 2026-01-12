/**
 * FactionAlignmentUI Component
 * Shows faction benefits and alignment status
 */

import { Card, Button } from '@/components/ui';
import type { AlignmentBenefits, FactionOverview, TerritoryFactionId } from '@desperados/shared';

interface FactionAlignmentUIProps {
  currentFaction: TerritoryFactionId | null;
  alignmentBenefits: AlignmentBenefits | null;
  factionOverview: FactionOverview | null;
  onChangeFaction?: () => void;
  isLoading?: boolean;
}

// Faction display info
const FACTION_INFO: Record<string, { name: string; color: string; icon: string; description: string }> = {
  settlers_alliance: {
    name: 'Settlers Alliance',
    color: 'text-green-400',
    icon: '🏡',
    description: 'Peaceful settlers seeking to tame the frontier through commerce and community.',
  },
  frontera_collective: {
    name: 'Frontera Collective',
    color: 'text-blue-400',
    icon: '🏰',
    description: 'Military organization maintaining order through discipline and law.',
  },
  nahi_coalition: {
    name: 'Nahi Coalition',
    color: 'text-amber-400',
    icon: '🪶',
    description: 'Native peoples united to protect their ancestral lands and traditions.',
  },
  outlaw_consortium: {
    name: 'Outlaw Consortium',
    color: 'text-red-400',
    icon: '💀',
    description: 'Criminal organizations thriving in the chaos of the frontier.',
  },
};

export function FactionAlignmentUI({
  currentFaction,
  alignmentBenefits,
  factionOverview,
  onChangeFaction,
  isLoading,
}: FactionAlignmentUIProps) {
  const faction = currentFaction ? FACTION_INFO[currentFaction] : null;

  return (
    <Card className="p-4">
      <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
        <span>🏴</span> Faction Alignment
      </h3>

      {/* Current Faction */}
      {faction ? (
        <div className="mb-4">
          <div className={`flex items-center gap-3 p-3 bg-gray-800/50 rounded ${faction.color}`}>
            <span className="text-3xl">{faction.icon}</span>
            <div>
              <h4 className="font-bold">{faction.name}</h4>
              <p className="text-sm text-gray-400">{faction.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gray-800/50 rounded text-center">
          <span className="text-gray-500">No faction alignment</span>
        </div>
      )}

      {/* Active Benefits */}
      {alignmentBenefits && (
        <div className="mb-4">
          <h4 className="text-sm text-gray-400 mb-2">Active Benefits</h4>
          <div className="space-y-2">
            {alignmentBenefits.shopDiscount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-green-300">Shop Discount</span>
                <span className="text-xs text-gray-500 ml-auto">{alignmentBenefits.shopDiscount}% off</span>
              </div>
            )}
            {alignmentBenefits.reputationBonus > 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-green-300">Reputation Bonus</span>
                <span className="text-xs text-gray-500 ml-auto">+{alignmentBenefits.reputationBonus}%</span>
              </div>
            )}
            {alignmentBenefits.hasSafeHouse && (
              <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-green-300">Safe House Access</span>
              </div>
            )}
            {alignmentBenefits.jobPriority && (
              <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-green-300">Job Priority</span>
              </div>
            )}
            {alignmentBenefits.crimeHeatReduction > 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-900/20 border border-green-700/30 rounded">
                <span className="text-green-400">✓</span>
                <span className="text-sm text-green-300">Crime Heat Reduction</span>
                <span className="text-xs text-gray-500 ml-auto">-{alignmentBenefits.crimeHeatReduction}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Faction Overview Stats */}
      {factionOverview && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <div className="text-xl font-bold text-amber-400">
              {factionOverview.totalTerritories}
            </div>
            <div className="text-xs text-gray-500">Territories</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <div className="text-xl font-bold text-blue-400">
              {factionOverview.controlledTerritories}
            </div>
            <div className="text-xs text-gray-500">Controlled</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <div className="text-xl font-bold text-green-400">
              {factionOverview.totalInfluence}
            </div>
            <div className="text-xs text-gray-500">Total Influence</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <div className="text-xl font-bold text-purple-400">
              {factionOverview.contestedTerritories}
            </div>
            <div className="text-xs text-gray-500">Contested</div>
          </div>
        </div>
      )}

      {/* Reputation Levels */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-400 mb-2">Reputation Tiers</h4>
        <div className="space-y-1 text-sm">
          {[
            { tier: 'Hostile', color: 'text-red-400', icon: '💀', min: -1000 },
            { tier: 'Unfriendly', color: 'text-orange-400', icon: '👎', min: -500 },
            { tier: 'Neutral', color: 'text-gray-400', icon: '🤝', min: 0 },
            { tier: 'Friendly', color: 'text-green-400', icon: '👍', min: 500 },
            { tier: 'Allied', color: 'text-blue-400', icon: '⭐', min: 1000 },
            { tier: 'Exalted', color: 'text-purple-400', icon: '👑', min: 2500 },
          ].map((level) => (
            <div
              key={level.tier}
              className="flex items-center justify-between p-1 rounded hover:bg-gray-800/30"
            >
              <span className={level.color}>
                {level.icon} {level.tier}
              </span>
              <span className="text-gray-500 text-xs">{level.min}+ rep</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change Faction */}
      {onChangeFaction && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={onChangeFaction}
          disabled={isLoading}
        >
          Change Faction Alignment
        </Button>
      )}
    </Card>
  );
}

export default FactionAlignmentUI;
