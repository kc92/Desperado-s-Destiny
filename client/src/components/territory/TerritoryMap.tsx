/**
 * Territory Map Component
 * Interactive SVG map of Sangre Territory showing all 12 territories with real-time war updates
 */

import { useState, useEffect, useMemo } from 'react';
import { Territory, GangWar } from '@desperados/shared';
import { useGangStore, useGangSocketListeners } from '@/store/useGangStore';
import { Card } from '@/components/ui';

interface TerritoryMapProps {
  onTerritoryClick?: (territory: Territory) => void;
}

/**
 * Extended war info for display purposes
 * Calculates territory name and capture progress from base GangWar type
 */
interface WarDisplayInfo extends GangWar {
  territoryId: string;
  territoryName: string;
  capturePoints: number;
}

export function TerritoryMap({ onTerritoryClick }: TerritoryMapProps) {
  const { territories, activeWars, fetchTerritories, fetchActiveWars } = useGangStore();
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);

  useGangSocketListeners();

  useEffect(() => {
    fetchTerritories();
    fetchActiveWars();
  }, [fetchTerritories, fetchActiveWars]);

  // Transform GangWar to WarDisplayInfo with computed display properties
  const warsWithDisplayInfo: WarDisplayInfo[] = useMemo(() => {
    return activeWars.map((war) => {
      // Get the first contested zone as the primary territory
      const territoryId = war.contestedZones?.[0] || '';
      const territory = territories.find((t) => t._id === territoryId);
      // Calculate capture progress as percentage (attacker score vs target)
      const targetScore = war.targetScore || 100;
      const capturePoints = Math.min(100, (war.attackerScore / targetScore) * 100);

      return {
        ...war,
        territoryId,
        territoryName: territory?.name || 'Unknown Territory',
        capturePoints,
      };
    });
  }, [activeWars, territories]);

  const getTerritoryColor = (territory: Territory): string => {
    if (territory.isUnderSiege) {
      return '#dc2626';
    }
    if (territory.controllingGangId) {
      return '#d97706';
    }
    return '#9ca3af';
  };

  const getTerritoryStroke = (territory: Territory): string => {
    if (territory.isUnderSiege) {
      return '#991b1b';
    }
    return '#78350f';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-amber-100 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-western text-amber-900 mb-2">Sangre Territory Map</h2>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span>Unclaimed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-600 rounded" />
              <span>Gang Controlled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded animate-pulse" />
              <span>Under Siege</span>
            </div>
          </div>
        </div>

        <div className="relative bg-amber-50 border-2 border-amber-900 rounded overflow-hidden">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          >
            <defs>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>

            <rect width="800" height="600" fill="#FEF3C7" />

            {territories.map((territory) => {
              const isHovered = hoveredTerritory === territory._id;
              const war = warsWithDisplayInfo.find((w) => w.territoryId === territory._id);

              return (
                <g key={territory._id}>
                  <circle
                    cx={territory.position?.x ?? 0}
                    cy={territory.position?.y ?? 0}
                    r={territory.isUnderSiege ? 45 : 40}
                    fill={getTerritoryColor(territory)}
                    stroke={getTerritoryStroke(territory)}
                    strokeWidth={isHovered ? 4 : 2}
                    filter="url(#shadow)"
                    className={`cursor-pointer transition-all ${
                      territory.isUnderSiege ? 'animate-pulse' : ''
                    }`}
                    onMouseEnter={() => setHoveredTerritory(territory._id)}
                    onMouseLeave={() => setHoveredTerritory(null)}
                    onClick={() => onTerritoryClick?.(territory)}
                    opacity={isHovered ? 1 : 0.9}
                  />

                  <text
                    x={territory.position?.x ?? 0}
                    y={territory.position?.y ?? 0 - 50}
                    textAnchor="middle"
                    className="fill-amber-900 font-semibold pointer-events-none text-sm"
                    style={{ fontSize: '14px' }}
                  >
                    {territory.name}
                  </text>

                  {territory.controllingGangName && (
                    <text
                      x={territory.position?.x ?? 0}
                      y={territory.position?.y ?? 0 + 60}
                      textAnchor="middle"
                      className="fill-amber-800 pointer-events-none text-xs"
                      style={{ fontSize: '12px' }}
                    >
                      {territory.controllingGangName}
                    </text>
                  )}

                  {territory.isUnderSiege && war && (
                    <g>
                      <circle
                        cx={territory.position?.x ?? 0 + 35}
                        cy={territory.position?.y ?? 0 - 35}
                        r="15"
                        fill="#dc2626"
                        className="animate-pulse"
                      />
                      <text
                        x={territory.position?.x ?? 0 + 35}
                        y={territory.position?.y ?? 0 - 32}
                        textAnchor="middle"
                        className="fill-white font-bold pointer-events-none"
                        style={{ fontSize: '16px' }}
                      >
                        ⚔
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {hoveredTerritory && (
            <div className="absolute top-4 right-4 bg-white border-2 border-amber-900 rounded p-4 shadow-lg max-w-sm">
              {(() => {
                const territory = territories.find((t) => t._id === hoveredTerritory);
                if (!territory) return null;

                return (
                  <div>
                    <h4 className="font-semibold text-amber-900 text-lg mb-2">{territory.name}</h4>
                    <p className="text-sm text-amber-800 mb-3">{territory.description}</p>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-700">Difficulty:</span>
                        <span className="font-semibold">
                          {'⭐'.repeat(territory.difficulty)}
                        </span>
                      </div>

                      {territory.controllingGangName && (
                        <div className="flex justify-between">
                          <span className="text-amber-700">Controlled by:</span>
                          <span className="font-semibold">{territory.controllingGangName}</span>
                        </div>
                      )}

                      {territory.benefits.xpBonus && (
                        <div className="flex justify-between">
                          <span className="text-amber-700">XP Bonus:</span>
                          <span className="font-semibold text-green-600">+{territory.benefits.xpBonus}%</span>
                        </div>
                      )}

                      {territory.benefits.goldBonus && (
                        <div className="flex justify-between">
                          <span className="text-amber-700">Gold Bonus:</span>
                          <span className="font-semibold text-green-600">+{territory.benefits.goldBonus}%</span>
                        </div>
                      )}

                      {territory.benefits.energyBonus && (
                        <div className="flex justify-between">
                          <span className="text-amber-700">Energy Bonus:</span>
                          <span className="font-semibold text-green-600">+{territory.benefits.energyBonus}</span>
                        </div>
                      )}

                      {territory.isUnderSiege && (
                        <div className="mt-2 pt-2 border-t border-amber-300">
                          <span className="text-red-600 font-semibold">⚔ UNDER SIEGE</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </Card>

      {warsWithDisplayInfo.length > 0 && (
        <Card className="bg-red-50 border-2 border-red-900 p-6">
          <h3 className="text-xl font-western text-red-900 mb-4">⚔ Active Wars</h3>
          <div className="space-y-3">
            {warsWithDisplayInfo.map((war) => (
              <div key={war._id} className="bg-white border border-red-300 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-amber-900">{war.territoryName}</div>
                    <div className="text-sm text-amber-700">
                      {war.attackerGangName} [{war.attackerGangTag}] vs{' '}
                      {war.defenderGangName ? `${war.defenderGangName} [${war.defenderGangTag}]` : 'Unclaimed'}
                    </div>
                  </div>
                  <div className="text-sm text-amber-700">
                    Ends: {new Date(war.endsAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      war.capturePoints > 50 ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${war.capturePoints}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-amber-700 mt-1">
                  <span>Defender</span>
                  <span className="font-semibold">{war.capturePoints.toFixed(1)}%</span>
                  <span>Attacker</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
