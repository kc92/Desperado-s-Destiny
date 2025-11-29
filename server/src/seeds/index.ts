/**
 * Master Seed Script
 * Seeds all game data
 */

import mongoose from 'mongoose';
import { config } from '../config';
import { seedItems } from './items.seed';
import { seedQuests } from './quests.seed';
import { seedLocations } from './locations.seed';
import { seedRedGulchBuildings } from './redGulchBuildings.seed';
import { seedKaiowaMesaBuildings } from './kaiowaMesaBuildings.seed';
import { seedFronteraBuildings } from './fronteraBuildings.seed';
import { seedTheScarBuildings } from './buildings/theScar.seed';
import { seedTheWastesBuildings } from './buildings/theWastes.seed';
import { seedEncounters } from './encounters.seed';
import { seedTerritoryZones } from './territoryZones.seed';

async function seedAll() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');

    // Run seeds (order matters - buildings depend on locations)
    await seedLocations();
    await seedRedGulchBuildings(); // Settler faction buildings
    await seedKaiowaMesaBuildings(); // Nahi faction buildings
    await seedFronteraBuildings(); // Frontera faction buildings
    await seedTheScarBuildings(); // The Scar - Cosmic horror placeholder (L30-40)
    await seedTheWastesBuildings(); // The Wastes - Mad Max wasteland (L25-35)
    await seedItems();
    await seedQuests();
    await seedEncounters(); // Random encounters
    await seedTerritoryZones(); // Territory control zones

    console.log('\n✅ All seeds completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedAll();
}

export {
  seedAll,
  seedItems,
  seedQuests,
  seedLocations,
  seedRedGulchBuildings,
  seedKaiowaMesaBuildings,
  seedFronteraBuildings,
  seedTheScarBuildings,
  seedTheWastesBuildings,
  seedEncounters,
  seedTerritoryZones
};
