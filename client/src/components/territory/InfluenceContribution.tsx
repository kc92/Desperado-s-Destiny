/**
 * InfluenceContribution Component
 * Contribute to faction influence in a territory
 */

import { useState } from 'react';
import { Card, Button, ProgressBar } from '@/components/ui';
import { TerritoryFactionId, type TerritoryInfluence } from '@desperados/shared';

interface InfluenceContributionProps {
  influence: TerritoryInfluence | null;
  userFaction: TerritoryFactionId | null;
  userGold: number;
  onDonate: (factionId: TerritoryFactionId, amount: number) => Promise<void>;
  isLoading?: boolean;
}

// Faction display info
const FACTION_INFO: Record<string, { name: string; color: string; icon: string; progressColor: string }> = {
  [TerritoryFactionId.SETTLER_ALLIANCE]: { name: 'Settlers Alliance', color: 'text-green-400', icon: '🏡', progressColor: 'green' },
  [TerritoryFactionId.FRONTERA_CARTEL]: { name: 'Frontera Cartel', color: 'text-blue-400', icon: '🏰', progressColor: 'blue' },
  [TerritoryFactionId.NAHI_COALITION]: { name: 'Nahi Coalition', color: 'text-amber-400', icon: '🪶', progressColor: 'amber' },
  [TerritoryFactionId.INDEPENDENT_OUTLAWS]: { name: 'Independent Outlaws', color: 'text-red-400', icon: '💀', progressColor: 'red' },
  [TerritoryFactionId.US_MILITARY]: { name: 'US Military', color: 'text-purple-400', icon: '🎖️', progressColor: 'purple' },
  [TerritoryFactionId.RAILROAD_BARONS]: { name: 'Railroad Barons', color: 'text-yellow-400', icon: '🚂', progressColor: 'yellow' },
};

export function InfluenceContribution({
  influence,
  userFaction,
  userGold,
  onDonate,
  isLoading,
}: InfluenceContributionProps) {
  const [selectedFaction, setSelectedFaction] = useState<TerritoryFactionId | null>(
    userFaction
  );
  const [donationAmount, setDonationAmount] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDonate = async () => {
    if (!selectedFaction) return;

    setIsSubmitting(true);
    try {
      await onDonate(selectedFaction, donationAmount);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get faction influences from the influence object (array format)
  const factionInfluenceArray = influence?.factionInfluence || [];

  // Calculate total influence
  const totalInfluence = factionInfluenceArray.reduce(
    (sum, fi) => sum + (fi.influence || 0),
    0
  ) || 1;

  // Get sorted factions by influence
  const sortedFactions = [...factionInfluenceArray]
    .sort((a, b) => (b.influence || 0) - (a.influence || 0))
    .slice(0, 4);

  const presetAmounts = [50, 100, 250, 500, 1000];

  return (
    <Card className="p-4">
      <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2">
        <span>⚡</span> Territory Influence
      </h3>

      {/* Current Influence Distribution */}
      <div className="space-y-2 mb-4">
        {sortedFactions.map((fi) => {
          const factionId = fi.factionId;
          const faction = FACTION_INFO[factionId] || {
            name: factionId,
            color: 'text-gray-400',
            icon: '📍',
          };
          const percent = Math.round(((fi.influence || 0) / totalInfluence) * 100);

          return (
            <div key={factionId}>
              <div className="flex justify-between text-sm mb-1">
                <span className={faction.color}>
                  {faction.icon} {faction.name}
                </span>
                <span className="text-gray-400">{percent}%</span>
              </div>
              <ProgressBar
                value={percent}
                max={100}
                color={faction.progressColor as any}
                className="h-2"
              />
            </div>
          );
        })}
      </div>

      {/* Control Status */}
      {influence?.controllingFaction && (
        <div className="p-3 bg-gray-800/50 rounded mb-4 text-center">
          <span className="text-gray-400 text-sm">Controlled by: </span>
          <span className={FACTION_INFO[influence.controllingFaction]?.color || 'text-gray-300'}>
            {FACTION_INFO[influence.controllingFaction]?.name || influence.controllingFaction}
          </span>
        </div>
      )}

      {/* Donation Form */}
      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-sm text-gray-400 mb-3">Contribute Influence</h4>

        {/* Faction Selection */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(FACTION_INFO).map(([id, faction]) => (
            <button
              key={id}
              className={`p-2 rounded text-left transition-all ${
                selectedFaction === id
                  ? 'bg-amber-900/40 border-2 border-amber-500'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-500'
              }`}
              onClick={() => setSelectedFaction(id as TerritoryFactionId)}
            >
              <span className={`${faction.color} text-sm`}>
                {faction.icon} {faction.name}
              </span>
            </button>
          ))}
        </div>

        {/* Amount Selection */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(Math.max(0, parseInt(e.target.value) || 0))}
              min={1}
              max={userGold}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
              disabled={isLoading || isSubmitting}
            />
            <span className="text-gray-500">gold</span>
          </div>
          <div className="flex gap-1 mt-2">
            {presetAmounts.filter(a => a <= userGold).map(amount => (
              <Button
                key={amount}
                variant="ghost"
                size="sm"
                onClick={() => setDonationAmount(amount)}
                disabled={isLoading || isSubmitting}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Contribution Info */}
        <div className="bg-gray-800/30 rounded p-2 mb-3 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Your Gold:</span>
            <span className="text-amber-400">${userGold}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Influence Gained:</span>
            <span className="text-green-400">~{Math.floor(donationAmount * 0.5)} points</span>
          </div>
        </div>

        {/* Donate Button */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleDonate}
          disabled={
            isLoading ||
            isSubmitting ||
            !selectedFaction ||
            donationAmount > userGold ||
            donationAmount < 1
          }
        >
          {isSubmitting ? 'Donating...' : `Donate $${donationAmount}`}
        </Button>
      </div>
    </Card>
  );
}

export default InfluenceContribution;
