/**
 * Faction Power Display Component
 * Shows faction power levels and trends
 */

import React from 'react';
import { useWorldStore } from '../../store/useWorldStore';

// Faction configurations
const FACTION_CONFIG: Record<string, { name: string; color: string; bgColor: string; icon: string }> = {
  settler: {
    name: 'Settler Alliance',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600',
    icon: '🏛️',
  },
  nahi: {
    name: 'Nahi Coalition',
    color: 'text-green-400',
    bgColor: 'bg-green-600',
    icon: '🦅',
  },
  frontera: {
    name: 'Frontera',
    color: 'text-red-400',
    bgColor: 'bg-red-600',
    icon: '🔥',
  },
};

interface FactionPowerDisplayProps {
  compact?: boolean;
}

export const FactionPowerDisplay: React.FC<FactionPowerDisplayProps> = ({ compact = false }) => {
  const { worldState } = useWorldStore();

  if (!worldState || !worldState.factionPower) {
    return (
      <div className="bg-stone-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-stone-700 rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-stone-700 rounded" />
          <div className="h-3 bg-stone-700 rounded" />
          <div className="h-3 bg-stone-700 rounded" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {worldState.factionPower.map((faction) => {
          const config = FACTION_CONFIG[faction.faction] || {
            name: faction.faction,
            color: 'text-stone-400',
            bgColor: 'bg-stone-600',
            icon: '⚔️',
          };

          return (
            <div
              key={faction.faction}
              className="flex items-center gap-1 px-2 py-1 bg-stone-800/80 rounded"
              title={`${config.name}: ${faction.power}%`}
            >
              <span className="text-sm">{config.icon}</span>
              <span className={`text-xs font-semibold ${config.color}`}>
                {faction.power}%
              </span>
              <TrendIndicator trend={faction.trend} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-stone-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-700">
        <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
          Faction Power
        </h3>
      </div>

      {/* Power bars */}
      <div className="p-4 space-y-4">
        {worldState.factionPower.map((faction) => {
          const config = FACTION_CONFIG[faction.faction] || {
            name: faction.faction,
            color: 'text-stone-400',
            bgColor: 'bg-stone-600',
            icon: '⚔️',
          };

          return (
            <div key={faction.faction}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span className={`text-sm font-semibold ${config.color}`}>
                    {config.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-300">{faction.power}%</span>
                  <TrendIndicator trend={faction.trend} />
                </div>
              </div>

              {/* Power bar */}
              <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.bgColor} transition-all duration-500`}
                  style={{ width: `${faction.power}%` }}
                />
              </div>

              {/* Territories */}
              <div className="text-xs text-stone-500 mt-1">
                {Math.round(faction.power / 10)} territories controlled
              </div>
            </div>
          );
        })}
      </div>

      {/* Total power indicator */}
      <div className="px-4 py-3 bg-stone-900/50 border-t border-stone-700">
        <div className="h-3 bg-stone-700 rounded-full overflow-hidden flex">
          {worldState.factionPower.map((faction) => {
            const config = FACTION_CONFIG[faction.faction] || { bgColor: 'bg-stone-600' };
            return (
              <div
                key={faction.faction}
                className={`h-full ${config.bgColor}`}
                style={{ width: `${faction.power}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Trend indicator component
const TrendIndicator: React.FC<{ trend: string }> = ({ trend }) => {
  if (trend === 'rising') {
    return <span className="text-green-400 text-xs">▲</span>;
  }
  if (trend === 'falling') {
    return <span className="text-red-400 text-xs">▼</span>;
  }
  return <span className="text-stone-500 text-xs">●</span>;
};

export default FactionPowerDisplay;
