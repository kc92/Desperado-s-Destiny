/**
 * Seed Items Script
 *
 * Runs the item seeder to populate the database with comprehensive item catalog
 */

import mongoose from 'mongoose';
import { config } from '../config';
import { seedItems } from '../seeds/items.seed';
import logger from '../utils/logger';

async function main() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.database.mongoUri);
    logger.info('Connected to MongoDB');

    // Run seed
    logger.info('Seeding items...');
    await seedItems();

    logger.info('✅ Item seeding complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding items:', error);
    process.exit(1);
  }
}

main();
