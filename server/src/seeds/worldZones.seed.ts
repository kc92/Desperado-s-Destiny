/**
 * WorldZone Seed Data
 * Seeds geographic zones within regions
 */

import mongoose from 'mongoose';
import { WorldZone } from '../models/WorldZone.model';
import { REGION_IDS } from './regions.seed';
import logger from '../utils/logger';
import { ZONE_INFO } from '@desperados/shared';

// Fixed ObjectIds for referential integrity
export const WORLD_ZONE_IDS = {
  SETTLER_TERRITORY: new mongoose.Types.ObjectId('600000000000000000000201'),
  SANGRE_CANYON: new mongoose.Types.ObjectId('600000000000000000000202'),
  COALITION_LANDS: new mongoose.Types.ObjectId('600000000000000000000203'),
  OUTLAW_TERRITORY: new mongoose.Types.ObjectId('600000000000000000000204'),
  FRONTIER: new mongoose.Types.ObjectId('600000000000000000000205'),
  RANCH_COUNTRY: new mongoose.Types.ObjectId('600000000000000000000206'),
  SACRED_MOUNTAINS: new mongoose.Types.ObjectId('600000000000000000000207'),
};

export const WORLD_ZONES_DATA = [
  {
    _id: WORLD_ZONE_IDS.SETTLER_TERRITORY,
    id: 'settler_territory' as const,
    regionId: REGION_IDS.TOWN,
    name: 'Settler Territory',
    description: 'The heartland of civilization in the West. Towns, ranches, and honest folk trying to make a living.',
    theme: 'law_and_order',
    dangerRange: [1, 3] as [number, number],
    primaryFaction: 'settler' as const,
    icon: 'home',
    adjacentZones: ['frontier', 'ranch_country'],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: WORLD_ZONE_IDS.SANGRE_CANYON,
    id: 'sangre_canyon' as const,
    regionId: REGION_IDS.DEVILS_CANYON,
    name: 'Sangre Canyon',
    description: 'Blood-red walls rise from the desert floor. Rich in gold, but dangerous to mine.',
    theme: 'danger_and_riches',
    dangerRange: [5, 8] as [number, number],
    primaryFaction: 'frontera' as const,
    icon: 'canyon',
    adjacentZones: ['outlaw_territory', 'frontier'],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: WORLD_ZONE_IDS.COALITION_LANDS,
    id: 'coalition_lands' as const,
    regionId: REGION_IDS.SACRED_LANDS,
    name: 'Coalition Lands',
    description: 'Territory of the Nahi Coalition. Ancient ways meet modern threats.',
    theme: 'tradition_and_resistance',
    dangerRange: [3, 6] as [number, number],
    primaryFaction: 'nahi' as const,
    icon: 'feather',
    adjacentZones: ['sacred_mountains', 'frontier'],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'reputation', value: 'nahi:friendly', description: 'Gain favor with the Nahi Coalition' },
    ],
  },
  {
    _id: WORLD_ZONE_IDS.OUTLAW_TERRITORY,
    id: 'outlaw_territory' as const,
    regionId: REGION_IDS.OUTLAW_TERRITORY,
    name: 'Outlaw Territory',
    description: 'No law, no order, just survival. The desperate and the dangerous call this home.',
    theme: 'lawlessness',
    dangerRange: [7, 10] as [number, number],
    primaryFaction: 'frontera' as const,
    icon: 'skull',
    adjacentZones: ['sangre_canyon', 'frontier'],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'level', value: 10, description: 'Reach level 10 to enter Outlaw Territory' },
    ],
  },
  {
    _id: WORLD_ZONE_IDS.FRONTIER,
    id: 'frontier' as const,
    regionId: REGION_IDS.FRONTIER,
    name: 'The Frontier',
    description: 'Where the known world ends and adventure begins. Opportunity for those with courage.',
    theme: 'exploration',
    dangerRange: [4, 7] as [number, number],
    primaryFaction: 'neutral' as const,
    icon: 'compass',
    adjacentZones: ['settler_territory', 'sangre_canyon', 'coalition_lands', 'outlaw_territory', 'ranch_country', 'sacred_mountains'],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: WORLD_ZONE_IDS.RANCH_COUNTRY,
    id: 'ranch_country' as const,
    regionId: REGION_IDS.DUSTY_FLATS,
    name: 'Ranch Country',
    description: 'Miles of open range where cattle is king. Cowboys, rustlers, and endless horizon.',
    theme: 'pastoral_frontier',
    dangerRange: [2, 5] as [number, number],
    primaryFaction: 'settler' as const,
    icon: 'cow',
    adjacentZones: ['settler_territory', 'frontier'],
    isUnlocked: true,
    unlockRequirements: [],
  },
  {
    _id: WORLD_ZONE_IDS.SACRED_MOUNTAINS,
    id: 'sacred_mountains' as const,
    regionId: REGION_IDS.SANGRE_MOUNTAINS,
    name: 'Sacred Mountains',
    description: 'Ancient peaks revered by the Nahi. Spirits dwell in these heights.',
    theme: 'spiritual_wilderness',
    dangerRange: [5, 9] as [number, number],
    primaryFaction: 'nahi' as const,
    icon: 'mountain',
    adjacentZones: ['coalition_lands', 'frontier'],
    isUnlocked: false,
    unlockRequirements: [
      { type: 'level', value: 15, description: 'Reach level 15' },
      { type: 'reputation', value: 'nahi:neutral', description: 'Be at least neutral with Nahi Coalition' },
    ],
  },
];

export async function seedWorldZones(): Promise<void> {
  try {
    logger.info('Seeding world zones...');

    for (const zone of WORLD_ZONES_DATA) {
      await WorldZone.findOneAndUpdate(
        { id: zone.id },
        zone,
        { upsert: true, new: true }
      );
    }

    logger.info(`Seeded ${WORLD_ZONES_DATA.length} world zones`);
  } catch (error) {
    logger.error('Error seeding world zones:', error);
    throw error;
  }
}

export default seedWorldZones;
