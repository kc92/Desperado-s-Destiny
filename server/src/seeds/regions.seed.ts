/**
 * Region Seed Data
 * Seeds geographic regions within continents
 */

import mongoose from 'mongoose';
import { Region } from '../models/Region.model';
import { CONTINENT_IDS } from './continents.seed';
import logger from '../utils/logger';

// Fixed ObjectIds for referential integrity
export const REGION_IDS = {
  DUSTY_FLATS: new mongoose.Types.ObjectId('600000000000000000000101'),
  DEVILS_CANYON: new mongoose.Types.ObjectId('600000000000000000000102'),
  SANGRE_MOUNTAINS: new mongoose.Types.ObjectId('600000000000000000000103'),
  BORDER_TERRITORIES: new mongoose.Types.ObjectId('600000000000000000000104'),
  GHOST_TOWNS: new mongoose.Types.ObjectId('600000000000000000000105'),
  SACRED_LANDS: new mongoose.Types.ObjectId('600000000000000000000106'),
  OUTLAW_TERRITORY: new mongoose.Types.ObjectId('600000000000000000000107'),
  FRONTIER: new mongoose.Types.ObjectId('600000000000000000000108'),
  TOWN: new mongoose.Types.ObjectId('600000000000000000000109'),
};

export const REGIONS_DATA = [
  {
    _id: REGION_IDS.TOWN,
    id: 'town',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Settler Towns',
    description: 'The established towns and settlements where law and order (mostly) prevail.',
    category: 'territory' as const,
    primaryFaction: 'settler' as const,
    dangerRange: [1, 3] as [number, number],
    position: { x: 50, y: 50 },
    icon: 'town',
    connections: [
      { targetRegionId: 'dusty_flats', travelCost: 5 },
      { targetRegionId: 'frontier', travelCost: 10 },
    ],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: REGION_IDS.DUSTY_FLATS,
    id: 'dusty_flats',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Dusty Flats',
    description: 'Endless plains of parched earth and scrub brush. Cattle drives and outlaws cross these lands.',
    category: 'territory' as const,
    primaryFaction: 'settler' as const,
    dangerRange: [2, 5] as [number, number],
    position: { x: 30, y: 40 },
    icon: 'plains',
    connections: [
      { targetRegionId: 'town', travelCost: 5 },
      { targetRegionId: 'devils_canyon', travelCost: 8 },
      { targetRegionId: 'frontier', travelCost: 10 },
    ],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: REGION_IDS.DEVILS_CANYON,
    id: 'devils_canyon',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: "Devil's Canyon",
    description: 'A labyrinth of red rock canyons where bandits hide and gold veins run deep.',
    category: 'territory' as const,
    primaryFaction: 'frontera' as const,
    dangerRange: [4, 7] as [number, number],
    position: { x: 20, y: 30 },
    icon: 'canyon',
    connections: [
      { targetRegionId: 'dusty_flats', travelCost: 8 },
      { targetRegionId: 'outlaw_territory', travelCost: 6 },
    ],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: REGION_IDS.SANGRE_MOUNTAINS,
    id: 'sangre_mountains',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Sangre Mountains',
    description: 'Towering peaks stained red at sunset. Rich in minerals but treacherous to traverse.',
    category: 'territory' as const,
    primaryFaction: 'neutral' as const,
    dangerRange: [5, 8] as [number, number],
    position: { x: 70, y: 20 },
    icon: 'mountains',
    connections: [
      { targetRegionId: 'sacred_lands', travelCost: 10 },
      { targetRegionId: 'frontier', travelCost: 12 },
    ],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'level', value: 15, description: 'Reach level 15' },
    ],
  },
  {
    _id: REGION_IDS.BORDER_TERRITORIES,
    id: 'border_territories',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Border Territories',
    description: 'The lawless lands where Mexico meets America. Smugglers and revolutionaries thrive.',
    category: 'borderland' as const,
    primaryFaction: 'frontera' as const,
    dangerRange: [5, 9] as [number, number],
    position: { x: 40, y: 80 },
    icon: 'border',
    connections: [
      { targetRegionId: 'outlaw_territory', travelCost: 8 },
      { targetRegionId: 'dusty_flats', travelCost: 10 },
    ],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'level', value: 20, description: 'Reach level 20' },
    ],
  },
  {
    _id: REGION_IDS.GHOST_TOWNS,
    id: 'ghost_towns',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Ghost Towns',
    description: 'Abandoned mining settlements, haunted by memories and perhaps something more.',
    category: 'territory' as const,
    primaryFaction: 'neutral' as const,
    dangerRange: [6, 9] as [number, number],
    position: { x: 60, y: 60 },
    icon: 'ghost',
    connections: [
      { targetRegionId: 'frontier', travelCost: 8 },
      { targetRegionId: 'sangre_mountains', travelCost: 10 },
    ],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'level', value: 25, description: 'Reach level 25' },
    ],
  },
  {
    _id: REGION_IDS.SACRED_LANDS,
    id: 'sacred_lands',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Sacred Lands',
    description: 'Ancient grounds protected by the Nahi Coalition. Trespassers are not welcome.',
    category: 'reservation' as const,
    primaryFaction: 'nahi' as const,
    dangerRange: [3, 6] as [number, number],
    position: { x: 80, y: 30 },
    icon: 'sacred',
    connections: [
      { targetRegionId: 'sangre_mountains', travelCost: 10 },
    ],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'reputation', value: 'nahi:friendly', description: 'Friendly with Nahi Coalition' },
    ],
  },
  {
    _id: REGION_IDS.OUTLAW_TERRITORY,
    id: 'outlaw_territory',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'Outlaw Territory',
    description: 'Where the law fears to tread. Bandits, desperados, and the truly desperate.',
    category: 'territory' as const,
    primaryFaction: 'frontera' as const,
    dangerRange: [7, 10] as [number, number],
    position: { x: 20, y: 70 },
    icon: 'outlaw',
    connections: [
      { targetRegionId: 'devils_canyon', travelCost: 6 },
      { targetRegionId: 'border_territories', travelCost: 8 },
    ],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'level', value: 10, description: 'Reach level 10' },
    ],
  },
  {
    _id: REGION_IDS.FRONTIER,
    id: 'frontier',
    continentId: CONTINENT_IDS.SANGRE_TERRITORY,
    name: 'The Frontier',
    description: 'The edge of civilization. Opportunity and danger in equal measure.',
    category: 'territory' as const,
    primaryFaction: 'neutral' as const,
    dangerRange: [3, 7] as [number, number],
    position: { x: 50, y: 30 },
    icon: 'frontier',
    connections: [
      { targetRegionId: 'town', travelCost: 10 },
      { targetRegionId: 'dusty_flats', travelCost: 10 },
      { targetRegionId: 'sangre_mountains', travelCost: 12 },
      { targetRegionId: 'ghost_towns', travelCost: 8 },
    ],
    isUnlocked: true,
    unlockRequirements: [],
  },
];

export async function seedRegions(): Promise<void> {
  try {
    logger.info('Seeding regions...');

    for (const region of REGIONS_DATA) {
      await Region.findOneAndUpdate(
        { id: region.id },
        region,
        { upsert: true, new: true }
      );
    }

    logger.info(`Seeded ${REGIONS_DATA.length} regions`);
  } catch (error) {
    logger.error('Error seeding regions:', error);
    throw error;
  }
}

export default seedRegions;
