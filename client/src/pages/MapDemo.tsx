/**
 * Map Demo Dashboard
 * Standalone view of the map system for development/testing
 * Access at: /map-demo
 */

import React, { useState } from 'react';

// =============================================================================
// LOCAL TYPES (standalone - no shared imports needed)
// =============================================================================

type FactionType = 'settler' | 'nahi' | 'frontera' | 'neutral';

interface LocationSummary {
  id: string;
  name: string;
  type: string;
  icon?: string;
  isUnlocked: boolean;
  isZoneHub: boolean;
}

interface ZoneWithLocations {
  id: string;
  name: string;
  icon: string;
  theme: string;
  primaryFaction: FactionType;
  dangerRange: [number, number];
  isUnlocked: boolean;
  locationCount: number;
  locations: LocationSummary[];
}

interface RegionWithZones {
  id: string;
  name: string;
  icon: string;
  primaryFaction: FactionType;
  isUnlocked: boolean;
  zoneCount: number;
  position?: { x: number; y: number };
  zones: ZoneWithLocations[];
}

interface ContinentWithRegions {
  id: string;
  name: string;
  icon: string;
  isUnlocked: boolean;
  regionCount: number;
  regions: RegionWithZones[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_CONTINENT: ContinentWithRegions = {
  id: 'sangre_territory',
  name: 'Sangre Territory',
  icon: '🌵',
  isUnlocked: true,
  regionCount: 4,
  regions: [
    {
      id: 'dusty_flats',
      name: 'Dusty Flats',
      icon: '🏜️',
      primaryFaction: 'settler',
      isUnlocked: true,
      zoneCount: 3,
      position: { x: 0.2, y: 0.3 },
      zones: [
        {
          id: 'settler_territory',
          name: 'Settler Territory',
          icon: '🏘️',
          theme: 'desert',
          primaryFaction: 'settler',
          dangerRange: [10, 25],
          isUnlocked: true,
          locationCount: 4,
          locations: [
            { id: 'dusthaven', name: 'Dusthaven', type: 'town', icon: '🏘️', isUnlocked: true, isZoneHub: true },
            { id: 'general_store', name: 'General Store', type: 'shop', icon: '🏪', isUnlocked: true, isZoneHub: false },
            { id: 'saloon', name: "Rusty Spur Saloon", type: 'saloon', icon: '🍺', isUnlocked: true, isZoneHub: false },
            { id: 'sheriff_office', name: "Sheriff's Office", type: 'sheriff', icon: '⭐', isUnlocked: true, isZoneHub: false },
          ],
        },
        {
          id: 'mining_district',
          name: 'Mining District',
          icon: '⛏️',
          theme: 'canyon',
          primaryFaction: 'settler',
          dangerRange: [25, 45],
          isUnlocked: true,
          locationCount: 3,
          locations: [
            { id: 'copper_mine', name: 'Copper Mine', type: 'mine', icon: '⛏️', isUnlocked: true, isZoneHub: true },
            { id: 'miners_camp', name: "Miners' Camp", type: 'camp', icon: '⛺', isUnlocked: true, isZoneHub: false },
            { id: 'assay_office', name: 'Assay Office', type: 'shop', icon: '🏛️', isUnlocked: false, isZoneHub: false },
          ],
        },
        {
          id: 'outlaw_canyon',
          name: 'Outlaw Canyon',
          icon: '🏴‍☠️',
          theme: 'canyon',
          primaryFaction: 'neutral',
          dangerRange: [60, 80],
          isUnlocked: false,
          locationCount: 2,
          locations: [
            { id: 'hideout', name: 'Bandit Hideout', type: 'fort', icon: '🏴‍☠️', isUnlocked: false, isZoneHub: true },
            { id: 'ambush_point', name: 'Ambush Point', type: 'landmark', icon: '⚠️', isUnlocked: false, isZoneHub: false },
          ],
        },
      ],
    },
    {
      id: 'nahi_highlands',
      name: 'Nahi Highlands',
      icon: '🏔️',
      primaryFaction: 'nahi',
      isUnlocked: true,
      zoneCount: 2,
      position: { x: 0.7, y: 0.25 },
      zones: [
        {
          id: 'sacred_grounds',
          name: 'Sacred Grounds',
          icon: '🪶',
          theme: 'mountains',
          primaryFaction: 'nahi',
          dangerRange: [15, 30],
          isUnlocked: true,
          locationCount: 3,
          locations: [
            { id: 'spirit_rock', name: 'Spirit Rock', type: 'landmark', icon: '🪨', isUnlocked: true, isZoneHub: true },
            { id: 'elder_lodge', name: 'Elder Lodge', type: 'village', icon: '🏕️', isUnlocked: true, isZoneHub: false },
            { id: 'trading_post', name: 'Trading Post', type: 'shop', icon: '🛖', isUnlocked: true, isZoneHub: false },
          ],
        },
        {
          id: 'wolf_peaks',
          name: 'Wolf Peaks',
          icon: '🐺',
          theme: 'mountains',
          primaryFaction: 'nahi',
          dangerRange: [45, 65],
          isUnlocked: false,
          locationCount: 2,
          locations: [
            { id: 'wolf_den', name: 'Wolf Den', type: 'cave', icon: '🐺', isUnlocked: false, isZoneHub: true },
            { id: 'lookout', name: 'Mountain Lookout', type: 'landmark', icon: '👁️', isUnlocked: false, isZoneHub: false },
          ],
        },
      ],
    },
    {
      id: 'frontera_badlands',
      name: 'Frontera Badlands',
      icon: '🌋',
      primaryFaction: 'frontera',
      isUnlocked: true,
      zoneCount: 2,
      position: { x: 0.5, y: 0.7 },
      zones: [
        {
          id: 'border_town',
          name: 'Border Town',
          icon: '🏚️',
          theme: 'badlands',
          primaryFaction: 'frontera',
          dangerRange: [35, 55],
          isUnlocked: true,
          locationCount: 3,
          locations: [
            { id: 'la_frontera', name: 'La Frontera', type: 'town', icon: '🏚️', isUnlocked: true, isZoneHub: true },
            { id: 'cantina', name: 'Cantina del Sol', type: 'saloon', icon: '🍹', isUnlocked: true, isZoneHub: false },
            { id: 'smuggler_den', name: "Smuggler's Den", type: 'cave', icon: '📦', isUnlocked: true, isZoneHub: false },
          ],
        },
        {
          id: 'dead_mans_desert',
          name: "Dead Man's Desert",
          icon: '💀',
          theme: 'desert',
          primaryFaction: 'neutral',
          dangerRange: [75, 95],
          isUnlocked: false,
          locationCount: 2,
          locations: [
            { id: 'ghost_town', name: 'Ghost Town', type: 'ruins', icon: '👻', isUnlocked: false, isZoneHub: true },
            { id: 'bone_valley', name: 'Bone Valley', type: 'landmark', icon: '🦴', isUnlocked: false, isZoneHub: false },
          ],
        },
      ],
    },
    {
      id: 'rio_grande_valley',
      name: 'Rio Grande Valley',
      icon: '🌊',
      primaryFaction: 'neutral',
      isUnlocked: false,
      zoneCount: 1,
      position: { x: 0.3, y: 0.55 },
      zones: [
        {
          id: 'river_crossing',
          name: 'River Crossing',
          icon: '🌉',
          theme: 'river',
          primaryFaction: 'neutral',
          dangerRange: [20, 40],
          isUnlocked: false,
          locationCount: 2,
          locations: [
            { id: 'ferry_station', name: 'Ferry Station', type: 'station', icon: '⛴️', isUnlocked: false, isZoneHub: true },
            { id: 'fishing_camp', name: 'Fishing Camp', type: 'camp', icon: '🎣', isUnlocked: false, isZoneHub: false },
          ],
        },
      ],
    },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getFactionColor(faction: FactionType): string {
  const colors: Record<FactionType, string> = {
    settler: '#d97706',
    nahi: '#059669',
    frontera: '#7c3aed',
    neutral: '#6b7280',
  };
  return colors[faction] || colors.neutral;
}

function getFactionBorder(faction: FactionType): string {
  const colors: Record<FactionType, string> = {
    settler: '#92400e',
    nahi: '#047857',
    frontera: '#5b21b6',
    neutral: '#4b5563',
  };
  return colors[faction] || colors.neutral;
}

function getThemeColor(theme: string): string {
  const themes: Record<string, string> = {
    desert: '#e8c99c',
    canyon: '#c9a574',
    mountains: '#9ca3af',
    plains: '#a3c28a',
    forest: '#6b8e5a',
    badlands: '#b87333',
    river: '#7db8bf',
  };
  return themes[theme.toLowerCase()] || themes.desert;
}

function getDangerColor(dangerRange: [number, number]): string {
  const avgDanger = (dangerRange[0] + dangerRange[1]) / 2;
  if (avgDanger <= 20) return '#22c55e';
  if (avgDanger <= 40) return '#84cc16';
  if (avgDanger <= 60) return '#eab308';
  if (avgDanger <= 80) return '#f97316';
  return '#ef4444';
}

function getLocationIcon(type: string, icon?: string): string {
  if (icon) return icon;
  const icons: Record<string, string> = {
    town: '🏘️', city: '🏙️', village: '🏚️', outpost: '🏕️', camp: '⛺',
    mine: '⛏️', ranch: '🐴', saloon: '🍺', shop: '🏪', bank: '🏦',
    sheriff: '⭐', church: '⛪', station: '🚂', fort: '🏰', ruins: '🏚️',
    cave: '🕳️', landmark: '📍',
  };
  return icons[type.toLowerCase()] || '📍';
}

function getLocationColor(type: string): string {
  const colors: Record<string, string> = {
    town: '#d97706', city: '#ea580c', village: '#78716c', outpost: '#65a30d',
    camp: '#16a34a', mine: '#6b7280', ranch: '#ca8a04', saloon: '#dc2626',
    shop: '#2563eb', bank: '##7c3aed', sheriff: '#f59e0b', church: '#e5e7eb',
    station: '#374151', fort: '#991b1b', ruins: '#57534e', cave: '#1f2937',
    landmark: '#0891b2',
  };
  return colors[type.toLowerCase()] || '#6b7280';
}

// =============================================================================
// COMPONENT
// =============================================================================

type ZoomLevel = 'continental' | 'regional' | 'local';

export const MapDemo: React.FC = () => {
  const [zoom, setZoom] = useState<ZoomLevel>('continental');
  const [selectedRegion, setSelectedRegion] = useState<RegionWithZones | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneWithLocations | null>(null);
  const [playerLocation, setPlayerLocation] = useState<string>('dusthaven');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const continent = MOCK_CONTINENT;

  const handleRegionClick = (region: RegionWithZones) => {
    if (!region.isUnlocked) return;
    setSelectedRegion(region);
    setZoom('regional');
  };

  const handleZoneClick = (zone: ZoneWithLocations) => {
    if (!zone.isUnlocked) return;
    setSelectedZone(zone);
    setZoom('local');
  };

  const handleLocationClick = (location: LocationSummary) => {
    if (!location.isUnlocked) return;
    setPlayerLocation(location.id);
  };

  const handleBack = () => {
    if (zoom === 'local') {
      setZoom('regional');
      setSelectedZone(null);
    } else if (zoom === 'regional') {
      setZoom('continental');
      setSelectedRegion(null);
    }
  };

  // Stats
  const totalRegions = continent.regions.length;
  const unlockedRegions = continent.regions.filter(r => r.isUnlocked).length;
  const totalZones = continent.regions.reduce((sum, r) => sum + r.zones.length, 0);
  const unlockedZones = continent.regions.reduce((sum, r) => sum + r.zones.filter(z => z.isUnlocked).length, 0);
  const totalLocations = continent.regions.reduce((sum, r) =>
    sum + r.zones.reduce((zs, z) => zs + z.locations.length, 0), 0);
  const unlockedLocations = continent.regions.reduce((sum, r) =>
    sum + r.zones.reduce((zs, z) => zs + z.locations.filter(l => l.isUnlocked).length, 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-stone-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-amber-100 mb-2">
              🗺️ Map System Demo
            </h1>
            <p className="text-amber-300/70">
              Standalone visualization of the Desperados Destiny world map
            </p>
          </div>
          <div className="text-right text-sm text-amber-300/60">
            <p>Current Location: <span className="text-amber-100 font-medium">{playerLocation}</span></p>
            <p>Zoom Level: <span className="text-amber-100 font-medium capitalize">{zoom}</span></p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <div className="bg-stone-800/90 border border-amber-600/50 rounded-lg p-6">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {zoom !== 'continental' && (
                  <button
                    onClick={handleBack}
                    className="px-3 py-1 text-amber-300 hover:text-amber-100 hover:bg-amber-900/50 rounded transition-colors"
                  >
                    ← Back
                  </button>
                )}
                <div className="flex items-center gap-2 text-amber-100">
                  <span className="text-2xl">{continent.icon}</span>
                  <span className="font-bold">{continent.name}</span>
                  {selectedRegion && (
                    <>
                      <span className="text-amber-500">›</span>
                      <span>{selectedRegion.icon} {selectedRegion.name}</span>
                    </>
                  )}
                  {selectedZone && (
                    <>
                      <span className="text-amber-500">›</span>
                      <span>{selectedZone.icon} {selectedZone.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {(['continental', 'regional', 'local'] as ZoomLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      if (level === 'continental') {
                        setZoom('continental');
                        setSelectedRegion(null);
                        setSelectedZone(null);
                      } else if (level === 'regional' && selectedRegion) {
                        setZoom('regional');
                        setSelectedZone(null);
                      } else if (level === 'local' && selectedZone) {
                        setZoom('local');
                      }
                    }}
                    disabled={(level === 'regional' && !selectedRegion) || (level === 'local' && !selectedZone)}
                    className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                      zoom === level
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-700 text-stone-300 hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Continental View */}
            {zoom === 'continental' && (
              <div className="relative bg-amber-100/10 rounded-lg overflow-hidden border border-amber-700/30">
                <svg viewBox="0 0 800 500" className="w-full h-auto" style={{ maxHeight: '500px' }}>
                  <defs>
                    <filter id="shadow">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.4" />
                    </filter>
                    <pattern id="dust" patternUnits="userSpaceOnUse" width="20" height="20">
                      <circle cx="10" cy="10" r="1" fill="#d4a574" opacity="0.3" />
                    </pattern>
                  </defs>

                  <rect width="800" height="500" fill="#e8d5b7" />
                  <rect width="800" height="500" fill="url(#dust)" />

                  {/* Compass */}
                  <g transform="translate(720, 60)">
                    <circle r="30" fill="none" stroke="#78350f" strokeWidth="2" />
                    <line x1="0" y1="-25" x2="0" y2="25" stroke="#78350f" strokeWidth="2" />
                    <line x1="-25" y1="0" x2="25" y2="0" stroke="#78350f" strokeWidth="2" />
                    <text y="-35" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="bold">N</text>
                  </g>

                  {/* Region markers */}
                  {continent.regions.map((region) => {
                    const x = (region.position?.x || 0.5) * 800;
                    const y = (region.position?.y || 0.5) * 500;
                    const isHovered = hoveredItem === region.id;
                    const radius = isHovered ? 45 : 40;

                    return (
                      <g key={region.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={radius}
                          fill={getFactionColor(region.primaryFaction)}
                          stroke={getFactionBorder(region.primaryFaction)}
                          strokeWidth={isHovered ? 4 : 2}
                          filter="url(#shadow)"
                          opacity={region.isUnlocked ? 1 : 0.4}
                          style={{ cursor: region.isUnlocked ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                          onMouseEnter={() => setHoveredItem(region.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleRegionClick(region)}
                        />
                        <text x={x} y={y + 8} textAnchor="middle" fontSize="28" style={{ pointerEvents: 'none' }}>
                          {region.icon}
                        </text>
                        <text x={x} y={y + radius + 20} textAnchor="middle" fill="#78350f" fontSize="13" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                          {region.name}
                        </text>
                        <g transform={`translate(${x + radius - 10}, ${y - radius + 10})`}>
                          <circle r="14" fill="#1f2937" />
                          <text y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                            {region.zoneCount}
                          </text>
                        </g>
                        {!region.isUnlocked && (
                          <text x={x} y={y + 8} textAnchor="middle" fontSize="24" style={{ pointerEvents: 'none' }}>🔒</text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {hoveredItem && continent.regions.find(r => r.id === hoveredItem) && (
                  <div className="absolute bottom-4 left-4 bg-stone-900/95 border-2 border-amber-500 rounded-lg p-4 shadow-xl max-w-xs">
                    {(() => {
                      const region = continent.regions.find(r => r.id === hoveredItem)!;
                      return (
                        <div>
                          <h4 className="font-bold text-amber-300 text-lg mb-2">{region.icon} {region.name}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-8">
                              <span className="text-stone-400">Faction:</span>
                              <span className="text-amber-100 capitalize">{region.primaryFaction}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Zones:</span>
                              <span className="text-amber-100">{region.zoneCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Status:</span>
                              <span className={region.isUnlocked ? 'text-green-400' : 'text-red-400'}>
                                {region.isUnlocked ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                          </div>
                          {region.isUnlocked && (
                            <p className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-700">
                              Click to explore
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Regional View */}
            {zoom === 'regional' && selectedRegion && (
              <div className="relative bg-amber-100/10 rounded-lg overflow-hidden border border-amber-700/30">
                <svg viewBox="0 0 800 450" className="w-full h-auto" style={{ maxHeight: '450px' }}>
                  <rect width="800" height="450" fill="#e8d5b7" />

                  {selectedRegion.zones.map((zone, index) => {
                    const cols = Math.ceil(Math.sqrt(selectedRegion.zones.length));
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const cellWidth = 800 / (cols + 1);
                    const cellHeight = 450 / (Math.ceil(selectedRegion.zones.length / cols) + 1);
                    const x = cellWidth * (col + 1);
                    const y = cellHeight * (row + 1);
                    const isHovered = hoveredItem === zone.id;
                    const size = isHovered ? 65 : 60;

                    const hexPoints = Array.from({ length: 6 }, (_, i) => {
                      const angle = (Math.PI / 3) * i - Math.PI / 6;
                      return `${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`;
                    }).join(' ');

                    return (
                      <g key={zone.id}>
                        <polygon
                          points={hexPoints}
                          fill={getThemeColor(zone.theme)}
                          stroke={getFactionColor(zone.primaryFaction)}
                          strokeWidth={isHovered ? 4 : 2}
                          opacity={zone.isUnlocked ? 1 : 0.4}
                          style={{ cursor: zone.isUnlocked ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                          onMouseEnter={() => setHoveredItem(zone.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleZoneClick(zone)}
                        />
                        <text x={x} y={y + 8} textAnchor="middle" fontSize="32" style={{ pointerEvents: 'none' }}>
                          {zone.icon}
                        </text>
                        <text x={x} y={y + size + 18} textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                          {zone.name}
                        </text>
                        <g transform={`translate(${x + size - 12}, ${y - size + 12})`}>
                          <circle r="12" fill="#374151" />
                          <text y="4" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                            {zone.locationCount}
                          </text>
                        </g>
                        <g transform={`translate(${x - size + 15}, ${y + size - 22})`}>
                          <rect x="-16" y="-10" width="32" height="20" rx="4" fill="rgba(0,0,0,0.8)" />
                          <text textAnchor="middle" y="4" fontSize="10" fontWeight="bold" fill={getDangerColor(zone.dangerRange)}>
                            {zone.dangerRange[0]}-{zone.dangerRange[1]}
                          </text>
                        </g>
                        {!zone.isUnlocked && (
                          <text x={x} y={y + 8} textAnchor="middle" fontSize="28" style={{ pointerEvents: 'none' }}>🔒</text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {hoveredItem && selectedRegion.zones.find(z => z.id === hoveredItem) && (
                  <div className="absolute top-4 right-4 bg-stone-900/95 border-2 border-amber-500 rounded-lg p-4 shadow-xl max-w-xs">
                    {(() => {
                      const zone = selectedRegion.zones.find(z => z.id === hoveredItem)!;
                      return (
                        <div>
                          <h4 className="font-bold text-amber-300 text-lg mb-2">{zone.icon} {zone.name}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-stone-400">Theme:</span>
                              <span className="text-amber-100 capitalize">{zone.theme}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Locations:</span>
                              <span className="text-amber-100">{zone.locationCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Danger:</span>
                              <span style={{ color: getDangerColor(zone.dangerRange) }}>
                                {zone.dangerRange[0]}-{zone.dangerRange[1]}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-400">Faction:</span>
                              <span className="text-amber-100 capitalize">{zone.primaryFaction}</span>
                            </div>
                          </div>
                          {zone.isUnlocked && (
                            <p className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-700">
                              Click to view locations
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Local View */}
            {zoom === 'local' && selectedZone && (
              <div className="relative bg-amber-100/10 rounded-lg overflow-hidden border border-amber-700/30">
                <svg viewBox="0 0 800 400" className="w-full h-auto" style={{ maxHeight: '400px' }}>
                  <rect width="800" height="400" fill="#d4c4a8" />

                  {/* Roads */}
                  {selectedZone.locations.map((_, i) => {
                    if (i === selectedZone.locations.length - 1) return null;
                    const cols = Math.ceil(Math.sqrt(selectedZone.locations.length * 1.5));
                    const col1 = i % cols;
                    const row1 = Math.floor(i / cols);
                    const col2 = (i + 1) % cols;
                    const row2 = Math.floor((i + 1) / cols);
                    const cellWidth = 800 / (cols + 1);
                    const cellHeight = 400 / (Math.ceil(selectedZone.locations.length / cols) + 1);
                    return (
                      <line
                        key={`road-${i}`}
                        x1={cellWidth * (col1 + 1)}
                        y1={cellHeight * (row1 + 1)}
                        x2={cellWidth * (col2 + 1)}
                        y2={cellHeight * (row2 + 1)}
                        stroke="#92400e"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        opacity="0.3"
                      />
                    );
                  })}

                  {/* Locations */}
                  {selectedZone.locations.map((location, index) => {
                    const cols = Math.ceil(Math.sqrt(selectedZone.locations.length * 1.5));
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const cellWidth = 800 / (cols + 1);
                    const cellHeight = 400 / (Math.ceil(selectedZone.locations.length / cols) + 1);
                    const x = cellWidth * (col + 1);
                    const y = cellHeight * (row + 1);
                    const isHovered = hoveredItem === location.id;
                    const isPlayer = playerLocation === location.id;
                    const isHub = location.isZoneHub;
                    const size = isHub ? 42 : isHovered ? 38 : 34;

                    return (
                      <g key={location.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={size}
                          fill={getLocationColor(location.type)}
                          stroke={isPlayer ? '#22c55e' : isHub ? '#fbbf24' : '#78350f'}
                          strokeWidth={isPlayer ? 5 : isHub ? 3 : 2}
                          opacity={location.isUnlocked ? 1 : 0.4}
                          style={{ cursor: location.isUnlocked ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                          onMouseEnter={() => setHoveredItem(location.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleLocationClick(location)}
                        />
                        {isPlayer && (
                          <circle cx={x} cy={y} r={size + 4} fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.5">
                            <animate attributeName="r" from={size + 4} to={size + 12} dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <text x={x} y={y + 8} textAnchor="middle" fontSize={isHub ? '24' : '20'} style={{ pointerEvents: 'none' }}>
                          {getLocationIcon(location.type, location.icon)}
                        </text>
                        <text x={x} y={y + size + 16} textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                          {location.name}
                        </text>
                        {isPlayer && (
                          <g transform={`translate(${x}, ${y - size - 15})`}>
                            <polygon points="0,-12 8,4 -8,4" fill="#22c55e" stroke="#166534" />
                            <text y="-18" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">YOU</text>
                          </g>
                        )}
                        {isHub && !isPlayer && (
                          <g transform={`translate(${x + size - 8}, ${y - size + 8})`}>
                            <circle r="12" fill="#fbbf24" stroke="#92400e" />
                            <text y="4" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="bold">H</text>
                          </g>
                        )}
                        {!location.isUnlocked && (
                          <text x={x} y={y + 8} textAnchor="middle" fontSize="18" style={{ pointerEvents: 'none' }}>🔒</text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {hoveredItem && selectedZone.locations.find(l => l.id === hoveredItem) && (
                  <div className="absolute bottom-4 left-4 bg-stone-900/95 border-2 border-amber-500 rounded-lg p-4 shadow-xl max-w-xs">
                    {(() => {
                      const location = selectedZone.locations.find(l => l.id === hoveredItem)!;
                      const isPlayer = playerLocation === location.id;
                      return (
                        <div>
                          <h4 className="font-bold text-amber-300 text-lg mb-2 flex items-center gap-2">
                            <span>{getLocationIcon(location.type, location.icon)}</span>
                            {location.name}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-stone-400">Type:</span>
                              <span className="text-amber-100 capitalize">{location.type}</span>
                            </div>
                            {location.isZoneHub && (
                              <div className="flex justify-between">
                                <span className="text-stone-400">Role:</span>
                                <span className="text-amber-400">Zone Hub</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-stone-400">Status:</span>
                              <span className={location.isUnlocked ? 'text-green-400' : 'text-red-400'}>
                                {location.isUnlocked ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                          </div>
                          {isPlayer && (
                            <p className="text-xs text-green-400 mt-2 pt-2 border-t border-stone-700">
                              You are here
                            </p>
                          )}
                          {!isPlayer && location.isUnlocked && (
                            <p className="text-xs text-stone-400 mt-2 pt-2 border-t border-stone-700">
                              Click to travel here
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600" />
                <span>Zone Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Locked</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getFactionColor('settler') }} />
                <span>Settler</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getFactionColor('nahi') }} />
                <span>Nahi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getFactionColor('frontera') }} />
                <span>Frontera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getFactionColor('neutral') }} />
                <span>Neutral</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-stone-800/90 border border-amber-600/50 rounded-lg p-4">
            <h3 className="font-bold text-amber-300 mb-3">World Stats</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-stone-400">Regions:</span>
                  <span className="text-amber-100">{unlockedRegions}/{totalRegions}</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${(unlockedRegions/totalRegions)*100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-stone-400">Zones:</span>
                  <span className="text-amber-100">{unlockedZones}/{totalZones}</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(unlockedZones/totalZones)*100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-stone-400">Locations:</span>
                  <span className="text-amber-100">{unlockedLocations}/{totalLocations}</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full transition-all" style={{ width: `${(unlockedLocations/totalLocations)*100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div className="bg-stone-800/90 border border-amber-600/50 rounded-lg p-4">
            <h3 className="font-bold text-amber-300 mb-3">Current Location</h3>
            <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {(() => {
                    for (const region of continent.regions) {
                      for (const zone of region.zones) {
                        const loc = zone.locations.find(l => l.id === playerLocation);
                        if (loc) return getLocationIcon(loc.type, loc.icon);
                      }
                    }
                    return '📍';
                  })()}
                </span>
                <div>
                  <p className="text-amber-100 font-medium">
                    {(() => {
                      for (const region of continent.regions) {
                        for (const zone of region.zones) {
                          const loc = zone.locations.find(l => l.id === playerLocation);
                          if (loc) return loc.name;
                        }
                      }
                      return 'Unknown';
                    })()}
                  </p>
                  <p className="text-stone-400 text-xs">
                    {(() => {
                      for (const region of continent.regions) {
                        for (const zone of region.zones) {
                          if (zone.locations.find(l => l.id === playerLocation)) {
                            return `${zone.name}, ${region.name}`;
                          }
                        }
                      }
                      return '';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Travel */}
          <div className="bg-stone-800/90 border border-amber-600/50 rounded-lg p-4">
            <h3 className="font-bold text-amber-300 mb-3">Quick Travel</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {continent.regions.flatMap(region =>
                region.zones.filter(z => z.isUnlocked).flatMap(zone =>
                  zone.locations.filter(l => l.isUnlocked && l.isZoneHub).map(location => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setPlayerLocation(location.id);
                        setSelectedRegion(region);
                        setSelectedZone(zone);
                        setZoom('local');
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        playerLocation === location.id
                          ? 'bg-green-900/50 text-green-300'
                          : 'hover:bg-stone-700/50 text-stone-300'
                      }`}
                    >
                      <span className="mr-2">{getLocationIcon(location.type, location.icon)}</span>
                      {location.name}
                    </button>
                  ))
                )
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-stone-800/90 border border-amber-600/50 rounded-lg p-4">
            <h3 className="font-bold text-amber-300 mb-3">How to Use</h3>
            <ul className="space-y-1 text-xs text-stone-400">
              <li>• Click regions to zoom in</li>
              <li>• Click zones to see locations</li>
              <li>• Click locations to travel</li>
              <li>• Hover for details</li>
              <li>• Use zoom buttons or Back</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDemo;
