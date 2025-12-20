/**
 * Seed Locations Script
 * Run with: npx ts-node src/scripts/seedLocations.ts
 */

import mongoose from 'mongoose';
import { config } from '../config';
import { seedLocations } from '../seeds/locations.seed';
import logger from '../utils/logger';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');

    await seedLocations();

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
}

main();
