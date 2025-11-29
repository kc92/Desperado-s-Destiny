/**
 * Territory Seed Data
 *
 * Seeds the 12 territories from the Sangre Territory Atlas
 * Idempotent - safe to run multiple times
 */

import { Territory, TerritoryFaction } from '../models/Territory.model';
import logger from '../utils/logger';

/**
 * Territory seed data array
 */
export const TERRITORY_DATA = [
  {
    id: 'red-gulch',
    name: 'Red Gulch',
    description: 'Main settler town, bustling with commerce and law. The heart of settler expansion in the Sangre Territory.',
    faction: TerritoryFaction.SETTLER,
    benefits: { goldBonus: 10, xpBonus: 5, energyRegen: 0 },
    difficulty: 3,
  },
  {
    id: 'marshals-station',
    name: "Marshal's Station",
    description: 'Law enforcement outpost on the frontier. A symbol of settler authority and justice.',
    faction: TerritoryFaction.SETTLER,
    benefits: { goldBonus: 5, xpBonus: 10, energyRegen: 0 },
    difficulty: 4,
  },
  {
    id: 'railroad-camp',
    name: 'Railroad Camp',
    description: 'Construction camp for the expanding railroad. The future of settler progress and wealth.',
    faction: TerritoryFaction.SETTLER,
    benefits: { goldBonus: 15, xpBonus: 0, energyRegen: 0 },
    difficulty: 5,
  },
  {
    id: 'settlers-fort',
    name: "Settler's Fort",
    description: 'Fortified settlement protecting expansion. A bastion of defense against the wilderness.',
    faction: TerritoryFaction.SETTLER,
    benefits: { goldBonus: 0, xpBonus: 0, energyRegen: 5 },
    difficulty: 6,
  },
  {
    id: 'sacred-springs',
    name: 'Sacred Springs',
    description: 'Holy site of the Nahi people, source of spiritual power. Waters blessed by the ancestors.',
    faction: TerritoryFaction.NAHI,
    benefits: { goldBonus: 0, xpBonus: 15, energyRegen: 0 },
    difficulty: 7,
  },
  {
    id: 'kaiowa-mesa',
    name: 'Kaiowa Mesa',
    description: 'Ancient Kaiowa tribal lands. High plateaus where the spirits still walk.',
    faction: TerritoryFaction.NAHI,
    benefits: { goldBonus: 5, xpBonus: 10, energyRegen: 0 },
    difficulty: 6,
  },
  {
    id: 'spirit-rock',
    name: 'Spirit Rock',
    description: 'Sacred monument where spirits speak. A place of great supernatural power.',
    faction: TerritoryFaction.NAHI,
    benefits: { goldBonus: 0, xpBonus: 0, energyRegen: 10 },
    difficulty: 8,
  },
  {
    id: 'ancestor-grove',
    name: 'Ancestor Grove',
    description: 'Ancient grove where ancestors are honored. Trees older than memory stand guard.',
    faction: TerritoryFaction.NAHI,
    benefits: { goldBonus: 10, xpBonus: 5, energyRegen: 0 },
    difficulty: 5,
  },
  {
    id: 'villa-esperanza',
    name: 'Villa Esperanza',
    description: 'Frontera stronghold, lawless and prosperous. Where fortune favors the bold.',
    faction: TerritoryFaction.FRONTERA,
    benefits: { goldBonus: 20, xpBonus: 0, energyRegen: 0 },
    difficulty: 5,
  },
  {
    id: 'the-hideout',
    name: 'The Hideout',
    description: 'Secret outlaw camp in the canyons. Hidden from the law, perfect for planning raids.',
    faction: TerritoryFaction.FRONTERA,
    benefits: { goldBonus: 15, xpBonus: 5, energyRegen: 0 },
    difficulty: 6,
  },
  {
    id: 'sangre-canyon',
    name: 'Sangre Canyon',
    description: 'Blood-soaked canyon, most valuable territory. Where countless battles have been fought.',
    faction: TerritoryFaction.NEUTRAL,
    benefits: { goldBonus: 25, xpBonus: 10, energyRegen: 0 },
    difficulty: 10,
  },
  {
    id: 'the-scar',
    name: 'The Scar',
    description: 'Mysterious rift in reality, source of supernatural power. Where the veil between worlds is thin.',
    faction: TerritoryFaction.NEUTRAL,
    benefits: { goldBonus: 10, xpBonus: 10, energyRegen: 5 },
    difficulty: 9,
  },
];

/**
 * Seed territories into database
 * Idempotent - will not create duplicates
 */
export async function seedTerritories(): Promise<void> {
  try {
    logger.info('Seeding territories...');

    let created = 0;
    let existing = 0;

    for (const territoryData of TERRITORY_DATA) {
      const existingTerritory = await Territory.findOne({ id: territoryData.id });

      if (existingTerritory) {
        existing += 1;
      } else {
        await Territory.create({
          ...territoryData,
          controllingGangId: null,
          capturePoints: 0,
          lastConqueredAt: null,
          conquestHistory: [],
        });
        created += 1;
        logger.info(`Created territory: ${territoryData.name}`);
      }
    }

    logger.info(
      `Territory seeding complete. Created: ${created}, Existing: ${existing}, Total: ${TERRITORY_DATA.length}`
    );
  } catch (error) {
    logger.error('Error seeding territories:', error);
    throw error;
  }
}
