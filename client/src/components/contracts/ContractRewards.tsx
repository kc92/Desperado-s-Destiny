/**
 * ContractRewards Component
 *
 * Displays contract rewards in a consistent format
 * Part of the Competitor Parity Plan - Phase B
 */

import React from 'react';
import { ContractRewards as IContractRewards } from '@/hooks/useDailyContracts';

interface ContractRewardsProps {
  rewards: IContractRewards;
  compact?: boolean;
  showLabel?: boolean;
}

/**
 * Item name mapping (would be fetched from server in production)
 */
const ITEM_NAMES: Record<string, string> = {
  gold_nugget: 'Gold Nugget',
  rare_lockpick_set: 'Rare Lockpick Set',
  golden_revolver: 'Golden Revolver',
  silver_sheriff_badge: 'Silver Sheriff Badge',
  legendary_duster_coat: 'Legendary Duster Coat',
  championship_belt: 'Championship Belt'
};

/**
 * Faction name mapping
 */
const FACTION_NAMES: Record<string, string> = {
  settlerAlliance: 'Settler Alliance',
  nahiCoalition: 'Nahi Coalition',
  frontera: 'Frontera'
};

export const ContractRewards: React.FC<ContractRewardsProps> = ({
  rewards,
  compact = false,
  showLabel = true
}) => {
  const hasItems = rewards.items && rewards.items.length > 0;
  const hasReputation = rewards.reputation && Object.keys(rewards.reputation).length > 0;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {/* Gold */}
        <span className="inline-flex items-center gap-1 text-xs bg-gold-light/10 text-gold-light px-2 py-1 rounded border border-gold-light/20">
          <span>+{rewards.gold}</span>
          <span className="opacity-70">Gold</span>
        </span>

        {/* XP */}
        <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
          <span>+{rewards.xp}</span>
          <span className="opacity-70">XP</span>
        </span>

        {/* Items */}
        {hasItems &&
          rewards.items!.map((itemId, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20"
            >
              {ITEM_NAMES[itemId] || itemId}
            </span>
          ))}

        {/* Reputation */}
        {hasReputation &&
          Object.entries(rewards.reputation!).map(([faction, amount]) => (
            <span
              key={faction}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                (amount as number) > 0
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {(amount as number) > 0 ? '+' : ''}
              {amount} {FACTION_NAMES[faction] || faction}
            </span>
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <h4 className="text-sm font-western text-desert-sand">Rewards</h4>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Gold */}
        <div className="flex items-center gap-2 bg-wood-dark/50 rounded p-2 border border-gold-light/20">
          <div className="w-8 h-8 rounded bg-gold-light/20 flex items-center justify-center text-gold-light">
            $
          </div>
          <div>
            <p className="text-gold-light font-bold">{rewards.gold}</p>
            <p className="text-xs text-desert-stone">Gold</p>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 bg-wood-dark/50 rounded p-2 border border-blue-500/20">
          <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
            XP
          </div>
          <div>
            <p className="text-blue-400 font-bold">{rewards.xp}</p>
            <p className="text-xs text-desert-stone">Experience</p>
          </div>
        </div>

        {/* Items */}
        {hasItems &&
          rewards.items!.map((itemId, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-wood-dark/50 rounded p-2 border border-purple-500/20 col-span-2"
            >
              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                *
              </div>
              <div>
                <p className="text-purple-400 font-bold">{ITEM_NAMES[itemId] || itemId}</p>
                <p className="text-xs text-desert-stone">Bonus Item</p>
              </div>
            </div>
          ))}

        {/* Reputation */}
        {hasReputation &&
          Object.entries(rewards.reputation!).map(([faction, amount]) => (
            <div
              key={faction}
              className={`flex items-center gap-2 bg-wood-dark/50 rounded p-2 border col-span-2 ${
                (amount as number) > 0 ? 'border-green-500/20' : 'border-red-500/20'
              }`}
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center ${
                  (amount as number) > 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                REP
              </div>
              <div>
                <p
                  className={`font-bold ${
                    (amount as number) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {(amount as number) > 0 ? '+' : ''}
                  {amount}
                </p>
                <p className="text-xs text-desert-stone">{FACTION_NAMES[faction] || faction}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ContractRewards;
