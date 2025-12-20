/**
 * Zone Constants
 * Defines the regional zones for the world map travel system
 */

/**
 * Zone identifiers for the world map
 */
export const ZONES = {
  SETTLER_TERRITORY: 'settler_territory',
  SANGRE_CANYON: 'sangre_canyon',
  COALITION_LANDS: 'coalition_lands',
  OUTLAW_TERRITORY: 'outlaw_territory',
  FRONTIER: 'frontier',
  RANCH_COUNTRY: 'ranch_country',
  SACRED_MOUNTAINS: 'sacred_mountains',
} as const;

export type WorldZoneType = typeof ZONES[keyof typeof ZONES];

/**
 * Zone display information
 */
export interface ZoneInfo {
  id: WorldZoneType;
  name: string;
  description: string;
  icon: string;
  theme: string;
  dangerRange: [number, number]; // Min-max danger level
  primaryFaction: 'settler' | 'nahi' | 'frontera' | 'neutral';
}

/**
 * Zone metadata for UI display
 */
export const ZONE_INFO: Record<WorldZoneType, ZoneInfo> = {
  [ZONES.SETTLER_TERRITORY]: {
    id: ZONES.SETTLER_TERRITORY,
    name: 'Settler Territory',
    description: 'Civilization, law, and commerce. The heart of the Settler Alliance.',
    icon: '🏛️',
    theme: 'civilization',
    dangerRange: [1, 3],
    primaryFaction: 'settler',
  },
  [ZONES.SANGRE_CANYON]: {
    id: ZONES.SANGRE_CANYON,
    name: 'Sangre Canyon',
    description: 'The contested lifeline through the mountains. Dangerous but necessary.',
    icon: '🏜️',
    theme: 'contested',
    dangerRange: [4, 7],
    primaryFaction: 'neutral',
  },
  [ZONES.COALITION_LANDS]: {
    id: ZONES.COALITION_LANDS,
    name: 'Coalition Lands',
    description: 'Sacred lands of the Nahi Coalition. Traditional and defended.',
    icon: '🪶',
    theme: 'sacred',
    dangerRange: [2, 5],
    primaryFaction: 'nahi',
  },
  [ZONES.OUTLAW_TERRITORY]: {
    id: ZONES.OUTLAW_TERRITORY,
    name: 'Outlaw Territory',
    description: 'Lawless lands where opportunity and danger go hand in hand.',
    icon: '💀',
    theme: 'lawless',
    dangerRange: [4, 8],
    primaryFaction: 'frontera',
  },
  [ZONES.FRONTIER]: {
    id: ZONES.FRONTIER,
    name: 'The Frontier',
    description: 'Neutral ground where vice, gambling, and trade flourish.',
    icon: '🎰',
    theme: 'neutral',
    dangerRange: [2, 5],
    primaryFaction: 'neutral',
  },
  [ZONES.RANCH_COUNTRY]: {
    id: ZONES.RANCH_COUNTRY,
    name: 'Ranch Country',
    description: 'Cattle trails and honest work. Watch out for rustlers.',
    icon: '🐄',
    theme: 'pastoral',
    dangerRange: [2, 4],
    primaryFaction: 'settler',
  },
  [ZONES.SACRED_MOUNTAINS]: {
    id: ZONES.SACRED_MOUNTAINS,
    name: 'Sacred Mountains',
    description: 'Mystical peaks where ancient powers dwell. High-level territory.',
    icon: '⛰️',
    theme: 'mystical',
    dangerRange: [6, 10],
    primaryFaction: 'neutral',
  },
};

/**
 * Zone adjacency map - which zones connect to which
 */
export const ZONE_CONNECTIONS: Record<WorldZoneType, WorldZoneType[]> = {
  [ZONES.SETTLER_TERRITORY]: [ZONES.SANGRE_CANYON, ZONES.FRONTIER],
  [ZONES.SANGRE_CANYON]: [ZONES.SETTLER_TERRITORY, ZONES.COALITION_LANDS, ZONES.FRONTIER, ZONES.SACRED_MOUNTAINS],
  [ZONES.COALITION_LANDS]: [ZONES.SANGRE_CANYON, ZONES.SACRED_MOUNTAINS],
  [ZONES.OUTLAW_TERRITORY]: [ZONES.FRONTIER],
  [ZONES.FRONTIER]: [ZONES.SETTLER_TERRITORY, ZONES.SANGRE_CANYON, ZONES.OUTLAW_TERRITORY, ZONES.RANCH_COUNTRY],
  [ZONES.RANCH_COUNTRY]: [ZONES.FRONTIER],
  [ZONES.SACRED_MOUNTAINS]: [ZONES.SANGRE_CANYON, ZONES.COALITION_LANDS],
};

/**
 * Get zone info by ID
 */
export function getZoneInfo(zoneId: WorldZoneType): ZoneInfo {
  return ZONE_INFO[zoneId];
}

/**
 * Get adjacent zones
 */
export function getAdjacentZones(zoneId: WorldZoneType): WorldZoneType[] {
  return ZONE_CONNECTIONS[zoneId] || [];
}

/**
 * Check if two zones are adjacent
 */
export function areZonesAdjacent(zone1: WorldZoneType, zone2: WorldZoneType): boolean {
  return ZONE_CONNECTIONS[zone1]?.includes(zone2) || false;
}
