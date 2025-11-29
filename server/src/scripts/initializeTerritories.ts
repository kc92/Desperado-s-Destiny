/**
 * Initialize Territory Influence System
 *
 * Seed script to set up all territories with initial faction influence
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import mongoose from 'mongoose';
import { TerritoryInfluenceService } from '../services/territoryInfluence.service';
import config from '../config';
import logger from '../utils/logger';

/**
 * Initialize territories
 */
async function initializeTerritories(): Promise<void> {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await mongoose.connect(config.database.mongoUri);
    logger.info('Database connected');

    // Initialize territories
    logger.info('Starting territory initialization...');
    await TerritoryInfluenceService.initializeTerritories();
    logger.info('Territory initialization complete');

    // Display summary
    logger.info('\n=== Territory Influence Summary ===');
    const territories = await TerritoryInfluenceService.getAllTerritories();

    for (const territory of territories) {
      logger.info(`\n${territory.territoryName}:`);
      logger.info(`  Type: ${territory.territoryType}`);
      logger.info(`  Control: ${territory.controlLevel}`);
      logger.info(`  Controlling Faction: ${territory.controllingFaction || 'None'}`);
      logger.info(`  Stability: ${territory.stability}%`);
      logger.info(`  Top Factions:`);
      for (const faction of territory.topFactions.slice(0, 3)) {
        logger.info(`    - ${faction.factionId}: ${faction.influence.toFixed(1)}% (${faction.trend})`);
      }
    }

    logger.info('\n=== Initialization Complete ===');
  } catch (error) {
    logger.error('Error initializing territories:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run initialization
initializeTerritories();
