/**
 * Geography Types
 * Types for the hierarchical world geography system:
 * Continent → Region → Zone → Location
 */

import type { WorldZoneType } from '../constants/zones.constants';

// =============================================================================
// FACTION TYPES
// =============================================================================

export type FactionType = 'settler' | 'nahi' | 'frontera' | 'neutral';

// =============================================================================
// UNLOCK REQUIREMENTS
// =============================================================================

export interface GeographyUnlockRequirement {
  type: 'level' | 'quest' | 'reputation' | 'item' | 'discovery';
  value: string | number;
  description: string;
}

// =============================================================================
// CONTINENT
// =============================================================================

export interface Continent {
  id: string;
  name: string;
  description: string;
  icon: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  isUnlocked: boolean;
  unlockRequirements?: GeographyUnlockRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContinentSummary {
  id: string;
  name: string;
  icon: string;
  isUnlocked: boolean;
  regionCount: number;
}

// =============================================================================
// REGION
// =============================================================================

export type RegionCategory = 'state' | 'territory' | 'reservation' | 'borderland';

export interface RegionConnection {
  targetRegionId: string;
  travelCost: number;
  requirements?: GeographyUnlockRequirement[];
}

export interface Region {
  id: string;
  continentId: string;
  name: string;
  description: string;
  category: RegionCategory;
  primaryFaction: FactionType;
  dangerRange: [number, number];
  position: {
    x: number;
    y: number;
  };
  icon: string;
  connections: RegionConnection[];
  isUnlocked: boolean;
  unlockRequirements?: GeographyUnlockRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionSummary {
  id: string;
  name: string;
  icon: string;
  description?: string;
  primaryFaction: FactionType;
  dangerRange?: [number, number];
  position?: { x: number; y: number };
  isUnlocked: boolean;
  zoneCount: number;
}

// =============================================================================
// WORLD ZONE
// =============================================================================

export interface ZoneConnection {
  targetZoneId: string;
  travelCost: number;
  requirements?: GeographyUnlockRequirement[];
}

export interface WorldZone {
  id: WorldZoneType;
  regionId: string;
  name: string;
  description: string;
  theme: string;
  dangerRange: [number, number];
  primaryFaction: FactionType;
  icon: string;
  adjacentZones: string[];
  isUnlocked: boolean;
  unlockRequirements?: GeographyUnlockRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneSummary {
  id: string;
  name: string;
  icon: string;
  description?: string;
  theme: string;
  primaryFaction: FactionType;
  dangerRange: [number, number];
  adjacentZones?: string[];
  isUnlocked: boolean;
  locationCount: number;
}

// =============================================================================
// GEOGRAPHY TREE (Hierarchical Structure)
// =============================================================================

export interface LocationSummary {
  id: string;
  name: string;
  type: string;
  description?: string;
  icon?: string;
  isUnlocked: boolean;
  isZoneHub: boolean;
}

export interface ZoneWithLocations extends ZoneSummary {
  locations: LocationSummary[];
}

export interface RegionWithZones extends RegionSummary {
  zones: ZoneWithLocations[];
}

export interface ContinentWithRegions extends ContinentSummary {
  regions: RegionWithZones[];
}

/**
 * Full geography tree for map rendering
 */
export interface GeographyTree {
  continents: ContinentWithRegions[];
  lastUpdated: Date;
}

// =============================================================================
// PLAYER DISCOVERY STATE
// =============================================================================

export interface DiscoveryInfo {
  locationId: string;
  discoveredAt: Date;
  discoveredBy: 'exploration' | 'quest' | 'map' | 'npc' | 'starting';
  canFastTravel: boolean;
}

export interface PlayerGeographyState {
  characterId: string;
  discoveredLocations: Map<string, DiscoveryInfo>;
  explorationProgress: Map<string, number>; // zoneId → percentage
  unlockedRegions: string[];
  unlockedContinents: string[];
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface GetGeographyTreeResponse {
  tree: GeographyTree;
}

export interface GetContinentsResponse {
  continents: ContinentSummary[];
}

export interface GetRegionsResponse {
  regions: RegionSummary[];
}

export interface GetZonesResponse {
  zones: ZoneSummary[];
}

export interface GetContinentDetailResponse {
  continent: ContinentWithRegions;
}

export interface GetRegionDetailResponse {
  region: RegionWithZones;
}

export interface GetZoneDetailResponse {
  zone: ZoneWithLocations;
}
