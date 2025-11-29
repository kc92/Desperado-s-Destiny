/**
 * Seed Actions Script
 *
 * Runs the action seeder to populate the database
 */

import mongoose from 'mongoose';
import { config } from '../config';
import { seedActions } from '../seeds/actions.seed';
import logger from '../utils/logger';

async function main() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(config.database.mongoUri);
    logger.info('Connected to MongoDB');

    // Run seed
    logger.info('Seeding actions...');
    await seedActions();

    logger.info('Action seeding complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding actions:', error);
    process.exit(1);
  }
}

main();
