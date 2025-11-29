/**
 * Seed Locations Script
 * Run with: npx ts-node src/scripts/seedLocations.ts
 */

import mongoose from 'mongoose';
import { config } from '../config';
import { seedLocations } from '../seeds/locations.seed';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');

    await seedLocations();

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
