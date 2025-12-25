/**
 * Geography Service
 * Handles world geography hierarchy: Continent → Region → Zone → Location
 */

import mongoose from 'mongoose';
import { Continent, IContinent } from '../models/Continent.model';
import { Region, IRegion } from '../models/Region.model';
import { WorldZone, IWorldZone } from '../models/WorldZone.model';
import { Location, ILocation } from '../models/Location.model';
import logger from '../utils/logger';
import { UnlockRequirementType } from '@desperados/shared';
import type {
  GeographyTree,
  ContinentWithRegions,
  RegionWithZones,
  ZoneWithLocations,
  ContinentSummary,
  RegionSummary,
  ZoneSummary,
  LocationSummary,
} from '@desperados/shared';

// =============================================================================
// CONTINENT OPERATIONS
// =============================================================================

/**
 * Get all continents
 */
export async function getContinents(): Promise<IContinent[]> {
  return Continent.find().sort({ name: 1 });
}

/**
 * Get unlocked continents only
 */
export async function getUnlockedContinents(): Promise<IContinent[]> {
  return Continent.find({ isUnlocked: true }).sort({ name: 1 });
}

/**
 * Get continent by ID
 */
export async function getContinentById(continentId: string): Promise<IContinent | null> {
  if (mongoose.Types.ObjectId.isValid(continentId)) {
    return Continent.findById(continentId);
  }
  return Continent.findOne({ id: continentId });
}

/**
 * Get continent summaries for map display
 */
export async function getContinentSummaries(): Promise<ContinentSummary[]> {
  const continents = await Continent.find();
  const summaries: ContinentSummary[] = [];

  for (const continent of continents) {
    const regionCount = await Region.countDocuments({ continentId: continent._id });
    summaries.push({
      id: continent.id,
      name: continent.name,
      icon: continent.icon,
      isUnlocked: continent.isUnlocked,
      regionCount,
    });
  }

  return summaries;
}

// =============================================================================
// REGION OPERATIONS
// =============================================================================

/**
 * Get all regions
 */
export async function getRegions(): Promise<IRegion[]> {
  return Region.find().sort({ name: 1 });
}

/**
 * Get regions by continent
 */
export async function getRegionsByContinent(continentId: string | mongoose.Types.ObjectId): Promise<IRegion[]> {
  const query = mongoose.Types.ObjectId.isValid(continentId)
    ? { continentId: new mongoose.Types.ObjectId(continentId as string) }
    : { continentId };
  return Region.find(query).sort({ name: 1 });
}

/**
 * Get region by ID
 */
export async function getRegionById(regionId: string): Promise<IRegion | null> {
  if (mongoose.Types.ObjectId.isValid(regionId)) {
    return Region.findById(regionId);
  }
  return Region.findOne({ id: regionId });
}

/**
 * Get region summaries
 */
export async function getRegionSummaries(continentId?: string): Promise<RegionSummary[]> {
  const query = continentId ? { continentId: new mongoose.Types.ObjectId(continentId) } : {};
  const regions = await Region.find(query);
  const summaries: RegionSummary[] = [];

  for (const region of regions) {
    const zoneCount = await WorldZone.countDocuments({ regionId: region._id });
    summaries.push({
      id: region.id,
      name: region.name,
      icon: region.icon,
      primaryFaction: region.primaryFaction,
      isUnlocked: region.isUnlocked,
      zoneCount,
    });
  }

  return summaries;
}

// =============================================================================
// ZONE OPERATIONS
// =============================================================================

/**
 * Get all world zones
 */
export async function getWorldZones(): Promise<IWorldZone[]> {
  return WorldZone.find().sort({ name: 1 });
}

/**
 * Get zones by region
 */
export async function getZonesByRegion(regionId: string | mongoose.Types.ObjectId): Promise<IWorldZone[]> {
  const query = mongoose.Types.ObjectId.isValid(regionId)
    ? { regionId: new mongoose.Types.ObjectId(regionId as string) }
    : { regionId };
  return WorldZone.find(query).sort({ name: 1 });
}

/**
 * Get zone by ID
 */
export async function getWorldZoneById(zoneId: string): Promise<IWorldZone | null> {
  if (mongoose.Types.ObjectId.isValid(zoneId)) {
    return WorldZone.findById(zoneId);
  }
  return WorldZone.findOne({ id: zoneId });
}

/**
 * Get zone summaries
 */
export async function getZoneSummaries(regionId?: string): Promise<ZoneSummary[]> {
  const query = regionId ? { regionId: new mongoose.Types.ObjectId(regionId) } : {};
  const zones = await WorldZone.find(query);
  const summaries: ZoneSummary[] = [];

  for (const zone of zones) {
    const locationCount = await Location.countDocuments({ zone: zone.id });
    summaries.push({
      id: zone.id,
      name: zone.name,
      icon: zone.icon,
      theme: zone.theme,
      primaryFaction: zone.primaryFaction,
      dangerRange: zone.dangerRange,
      isUnlocked: zone.isUnlocked,
      locationCount,
    });
  }

  return summaries;
}

// =============================================================================
// LOCATION OPERATIONS
// =============================================================================

/**
 * Get locations by zone
 */
export async function getLocationsByZone(zoneId: string): Promise<ILocation[]> {
  return Location.find({ zone: zoneId }).sort({ name: 1 });
}

/**
 * Get location summaries for a zone
 */
export async function getLocationSummaries(zoneId: string): Promise<LocationSummary[]> {
  const locations = await Location.find({ zone: zoneId });
  return locations.map((loc) => ({
    id: loc._id.toString(),
    name: loc.name,
    type: loc.type,
    icon: loc.icon,
    isUnlocked: loc.isUnlocked,
    isZoneHub: loc.isZoneHub || false,
  }));
}

// =============================================================================
// GEOGRAPHY TREE (Full Hierarchy)
// =============================================================================

/**
 * Build complete geography tree for map rendering
 */
export async function getGeographyTree(): Promise<GeographyTree> {
  const continents = await Continent.find();
  const tree: ContinentWithRegions[] = [];

  for (const continent of continents) {
    const regions = await Region.find({ continentId: continent._id });
    const regionsWithZones: RegionWithZones[] = [];

    for (const region of regions) {
      const zones = await WorldZone.find({ regionId: region._id });
      const zonesWithLocations: ZoneWithLocations[] = [];

      for (const zone of zones) {
        const locations = await Location.find({ zone: zone.id });
        const locationSummaries: LocationSummary[] = locations.map((loc) => ({
          id: loc._id.toString(),
          name: loc.name,
          type: loc.type,
          icon: loc.icon,
          isUnlocked: loc.isUnlocked,
          isZoneHub: loc.isZoneHub || false,
        }));

        zonesWithLocations.push({
          id: zone.id,
          name: zone.name,
          icon: zone.icon,
          theme: zone.theme,
          primaryFaction: zone.primaryFaction,
          dangerRange: zone.dangerRange,
          isUnlocked: zone.isUnlocked,
          locationCount: locations.length,
          locations: locationSummaries,
        });
      }

      const zoneCount = zones.length;
      regionsWithZones.push({
        id: region.id,
        name: region.name,
        icon: region.icon,
        primaryFaction: region.primaryFaction,
        isUnlocked: region.isUnlocked,
        zoneCount,
        zones: zonesWithLocations,
      });
    }

    const regionCount = regions.length;
    tree.push({
      id: continent.id,
      name: continent.name,
      icon: continent.icon,
      isUnlocked: continent.isUnlocked,
      regionCount,
      regions: regionsWithZones,
    });
  }

  return {
    continents: tree,
    lastUpdated: new Date(),
  };
}

/**
 * Get geography tree for a specific continent
 */
export async function getContinentTree(continentId: string): Promise<ContinentWithRegions | null> {
  const continent = await getContinentById(continentId);
  if (!continent) return null;

  const regions = await Region.find({ continentId: continent._id });
  const regionsWithZones: RegionWithZones[] = [];

  for (const region of regions) {
    const zones = await WorldZone.find({ regionId: region._id });
    const zonesWithLocations: ZoneWithLocations[] = [];

    for (const zone of zones) {
      const locations = await Location.find({ zone: zone.id });
      const locationSummaries: LocationSummary[] = locations.map((loc) => ({
        id: loc._id.toString(),
        name: loc.name,
        type: loc.type,
        icon: loc.icon,
        isUnlocked: loc.isUnlocked,
        isZoneHub: loc.isZoneHub || false,
      }));

      zonesWithLocations.push({
        id: zone.id,
        name: zone.name,
        icon: zone.icon,
        theme: zone.theme,
        primaryFaction: zone.primaryFaction,
        dangerRange: zone.dangerRange,
        isUnlocked: zone.isUnlocked,
        locationCount: locations.length,
        locations: locationSummaries,
      });
    }

    regionsWithZones.push({
      id: region.id,
      name: region.name,
      icon: region.icon,
      primaryFaction: region.primaryFaction,
      isUnlocked: region.isUnlocked,
      zoneCount: zones.length,
      zones: zonesWithLocations,
    });
  }

  return {
    id: continent.id,
    name: continent.name,
    icon: continent.icon,
    isUnlocked: continent.isUnlocked,
    regionCount: regions.length,
    regions: regionsWithZones,
  };
}

// =============================================================================
// UNLOCK OPERATIONS
// =============================================================================

/**
 * Check if a region is unlocked for a character
 */
export async function isRegionUnlockedForCharacter(
  regionId: string,
  characterLevel: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _characterReputations?: Record<string, number>
): Promise<boolean> {
  const region = await getRegionById(regionId);
  if (!region) return false;
  if (region.isUnlocked) return true;

  // Check unlock requirements
  for (const req of region.unlockRequirements) {
    if (req.type === UnlockRequirementType.CHARACTER_LEVEL && typeof req.minValue === 'number') {
      if (characterLevel < req.minValue) return false;
    }
    // Add more requirement checks as needed
  }

  return true;
}

/**
 * Check if a zone is unlocked for a character
 */
export async function isZoneUnlockedForCharacter(
  zoneId: string,
  characterLevel: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _characterReputations?: Record<string, number>
): Promise<boolean> {
  const zone = await getWorldZoneById(zoneId);
  if (!zone) return false;
  if (zone.isUnlocked) return true;

  // Check unlock requirements
  for (const req of zone.unlockRequirements) {
    if (req.type === UnlockRequirementType.CHARACTER_LEVEL && typeof req.minValue === 'number') {
      if (characterLevel < req.minValue) return false;
    }
    // Add more requirement checks as needed
  }

  return true;
}

// =============================================================================
// SEEDING HELPER
// =============================================================================

/**
 * Seed all geography data
 */
export async function seedGeography(): Promise<void> {
  const { seedContinents } = await import('../seeds/continents.seed');
  const { seedRegions } = await import('../seeds/regions.seed');
  const { seedWorldZones } = await import('../seeds/worldZones.seed');

  await seedContinents();
  await seedRegions();
  await seedWorldZones();

  logger.info('Geography seeding complete');
}

export default {
  // Continents
  getContinents,
  getUnlockedContinents,
  getContinentById,
  getContinentSummaries,

  // Regions
  getRegions,
  getRegionsByContinent,
  getRegionById,
  getRegionSummaries,

  // Zones
  getWorldZones,
  getZonesByRegion,
  getWorldZoneById,
  getZoneSummaries,

  // Locations
  getLocationsByZone,
  getLocationSummaries,

  // Tree
  getGeographyTree,
  getContinentTree,

  // Unlocks
  isRegionUnlockedForCharacter,
  isZoneUnlockedForCharacter,

  // Seeding
  seedGeography,
};
