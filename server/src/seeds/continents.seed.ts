/**
 * Continent Seed Data
 * Seeds the top-level geographic entities
 */

import mongoose from 'mongoose';
import { Continent } from '../models/Continent.model';
import logger from '../utils/logger';

// Fixed ObjectIds for referential integrity
export const CONTINENT_IDS = {
  SANGRE_TERRITORY: new mongoose.Types.ObjectId('600000000000000000000001'),
};

export const CONTINENTS_DATA = [
  {
    _id: CONTINENT_IDS.SANGRE_TERRITORY,
    id: 'sangre_territory',
    name: 'Sangre Territory',
    description:
      'The Sangre Territory stretches across the untamed frontier, a land of opportunity and danger. From the dusty plains to the sacred mountains, this vast region holds the promise of fortune for those bold enough to claim it.',
    icon: 'frontier',
    bounds: {
      north: 100,
      south: 0,
      east: 100,
      west: 0,
    },
    isUnlocked: true,
    unlockRequirements: [],
  },
];

export async function seedContinents(): Promise<void> {
  try {
    logger.info('Seeding continents...');

    for (const continent of CONTINENTS_DATA) {
      await Continent.findOneAndUpdate(
        { id: continent.id },
        continent,
        { upsert: true, new: true }
      );
    }

    logger.info(`Seeded ${CONTINENTS_DATA.length} continents`);
  } catch (error) {
    logger.error('Error seeding continents:', error);
    throw error;
  }
}

export default seedContinents;
