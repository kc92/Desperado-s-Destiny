/**
 * Territory Zones Seed Data
 *
 * Initial zones for gang territory control system
 */

import mongoose from 'mongoose';
import { TerritoryZone, ZoneType, ZoneBenefitType } from '../models/TerritoryZone.model';
import logger from '../utils/logger';

/**
 * NPC Gang IDs (placeholder - will be created in separate seed)
 */
const NPC_GANGS = {
  EL_REY_FRONTERA: new mongoose.Types.ObjectId(),
  COMANCHE_RAIDERS: new mongoose.Types.ObjectId(),
  RAILROAD_BARONS: new mongoose.Types.ObjectId(),
  BANKERS_SYNDICATE: new mongoose.Types.ObjectId(),
};

const ZONE_DEFINITIONS = [
  // RED GULCH DISTRICTS
  {
    id: 'red-gulch-saloon-district',
    name: 'Red Gulch - Saloon District',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'red_gulch',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Saloon protection money', value: 100 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Liquor trade profits', value: 50 },
    ],
    defenseRating: 40,
    dailyIncome: 150,
    npcGang: null,
  },
  {
    id: 'red-gulch-market-square',
    name: 'Red Gulch - Market Square',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'red_gulch',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Merchant taxes', value: 120 },
      { type: ZoneBenefitType.ECONOMIC, description: '10% shop discount', value: 10 },
    ],
    defenseRating: 35,
    dailyIncome: 180,
    npcGang: NPC_GANGS.BANKERS_SYNDICATE,
    npcGangName: "The Banker's Syndicate",
  },
  {
    id: 'red-gulch-residential',
    name: 'Red Gulch - Residential Quarter',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'red_gulch',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Safe houses', value: 20 },
      { type: ZoneBenefitType.INCOME, description: 'Protection rackets', value: 80 },
    ],
    defenseRating: 30,
    dailyIncome: 100,
    npcGang: null,
  },

  // WHISKEY BEND DISTRICTS
  {
    id: 'whiskey-bend-gambling-row',
    name: 'Whiskey Bend - Gambling Row',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'whiskey_bend',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Gambling house cuts', value: 150 },
      { type: ZoneBenefitType.COMBAT, description: 'Enforcer recruitment bonus', value: 10 },
    ],
    defenseRating: 50,
    dailyIncome: 200,
    npcGang: null,
  },
  {
    id: 'whiskey-bend-theater-district',
    name: 'Whiskey Bend - Theater District',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'whiskey_bend',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Information network', value: 15 },
      { type: ZoneBenefitType.INCOME, description: 'Entertainment profits', value: 90 },
    ],
    defenseRating: 35,
    dailyIncome: 120,
    npcGang: null,
  },
  {
    id: 'whiskey-bend-docks',
    name: 'Whiskey Bend - Docks',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'whiskey_bend',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Smuggling operations', value: 180 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Black market access', value: 25 },
    ],
    defenseRating: 60,
    dailyIncome: 250,
    npcGang: NPC_GANGS.RAILROAD_BARONS,
    npcGangName: 'The Railroad Barons',
  },

  // THE FRONTERA DISTRICTS
  {
    id: 'frontera-cantina-strip',
    name: 'The Frontera - Cantina Strip',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'the_frontera',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cantina profits', value: 120 },
      { type: ZoneBenefitType.TACTICAL, description: 'Border intel', value: 20 },
    ],
    defenseRating: 70,
    dailyIncome: 160,
    npcGang: NPC_GANGS.EL_REY_FRONTERA,
    npcGangName: "El Rey's Frontera Gang",
  },
  {
    id: 'frontera-outlaws-rest',
    name: "The Frontera - Outlaw's Rest",
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'the_frontera',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Hideout network', value: 30 },
      { type: ZoneBenefitType.COMBAT, description: '+15% combat in zone', value: 15 },
    ],
    defenseRating: 80,
    dailyIncome: 100,
    npcGang: NPC_GANGS.EL_REY_FRONTERA,
    npcGangName: "El Rey's Frontera Gang",
  },
  {
    id: 'frontera-smugglers-alley',
    name: "The Frontera - Smuggler's Alley",
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'the_frontera',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Contraband trade', value: 200 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Smuggling bonus +20%', value: 20 },
    ],
    defenseRating: 75,
    dailyIncome: 280,
    npcGang: NPC_GANGS.EL_REY_FRONTERA,
    npcGangName: "El Rey's Frontera Gang",
  },

  // WILDERNESS AREAS
  {
    id: 'dusty-trail-north-checkpoint',
    name: 'Dusty Trail - North Checkpoint',
    type: ZoneType.WILDERNESS,
    parentLocation: 'dusty_trail',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Toll collection', value: 60 },
      { type: ZoneBenefitType.TACTICAL, description: 'Travel route control', value: 25 },
    ],
    defenseRating: 45,
    dailyIncome: 80,
    npcGang: null,
  },
  {
    id: 'dusty-trail-south-checkpoint',
    name: 'Dusty Trail - South Checkpoint',
    type: ZoneType.WILDERNESS,
    parentLocation: 'dusty_trail',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Toll collection', value: 60 },
      { type: ZoneBenefitType.TACTICAL, description: 'Travel route control', value: 25 },
    ],
    defenseRating: 45,
    dailyIncome: 80,
    npcGang: null,
  },
  {
    id: 'mining-camp-influence',
    name: 'Mining Camp - Zone of Influence',
    type: ZoneType.WILDERNESS,
    parentLocation: 'mining_camp',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Miner protection fees', value: 100 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Ore trade access', value: 30 },
    ],
    defenseRating: 55,
    dailyIncome: 150,
    npcGang: NPC_GANGS.RAILROAD_BARONS,
    npcGangName: 'The Railroad Barons',
  },
  {
    id: 'ranch-territory-east',
    name: 'Eastern Ranch Territory',
    type: ZoneType.WILDERNESS,
    parentLocation: 'ranch_lands',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cattle rustling profits', value: 90 },
      { type: ZoneBenefitType.TACTICAL, description: 'Remote hideouts', value: 15 },
    ],
    defenseRating: 40,
    dailyIncome: 110,
    npcGang: null,
  },
  {
    id: 'ranch-territory-west',
    name: 'Western Ranch Territory',
    type: ZoneType.WILDERNESS,
    parentLocation: 'ranch_lands',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cattle rustling profits', value: 90 },
      { type: ZoneBenefitType.TACTICAL, description: 'Remote hideouts', value: 15 },
    ],
    defenseRating: 40,
    dailyIncome: 110,
    npcGang: null,
  },
  {
    id: 'sacred-lands-border',
    name: 'Sacred Lands - Border Zone',
    type: ZoneType.WILDERNESS,
    parentLocation: 'sacred_lands',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Spiritual protection', value: 20 },
      { type: ZoneBenefitType.COMBAT, description: 'Defensive advantage', value: 10 },
    ],
    defenseRating: 85,
    dailyIncome: 50,
    npcGang: NPC_GANGS.COMANCHE_RAIDERS,
    npcGangName: 'The Comanche Raiders',
  },

  // STRATEGIC POINTS
  {
    id: 'canyon-bridge-toll',
    name: 'Canyon Bridge - Toll Station',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'devils_canyon',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Bridge tolls', value: 140 },
      { type: ZoneBenefitType.TACTICAL, description: 'Chokepoint control', value: 30 },
    ],
    defenseRating: 65,
    dailyIncome: 180,
    npcGang: null,
  },
  {
    id: 'springs-water-source',
    name: 'Desert Springs - Water Rights',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'desert_springs',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Water access fees', value: 100 },
      { type: ZoneBenefitType.TACTICAL, description: 'Supply control', value: 25 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Water trade monopoly', value: 20 },
    ],
    defenseRating: 70,
    dailyIncome: 160,
    npcGang: null,
  },
  {
    id: 'trade-route-junction',
    name: 'Trade Route Junction',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'trade_routes',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Caravan protection fees', value: 160 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Trading post access', value: 25 },
    ],
    defenseRating: 60,
    dailyIncome: 220,
    npcGang: NPC_GANGS.RAILROAD_BARONS,
    npcGangName: 'The Railroad Barons',
  },
  {
    id: 'hideout-valley',
    name: 'Hideout Valley',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'outlaw_territory',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Perfect hideout location', value: 40 },
      { type: ZoneBenefitType.COMBAT, description: 'Ambush opportunities', value: 20 },
    ],
    defenseRating: 90,
    dailyIncome: 80,
    npcGang: null,
  },
  {
    id: 'railroad-depot',
    name: 'Railroad Depot',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'railroad_junction',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cargo theft opportunities', value: 180 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Fast travel access', value: 15 },
    ],
    defenseRating: 75,
    dailyIncome: 240,
    npcGang: NPC_GANGS.RAILROAD_BARONS,
    npcGangName: 'The Railroad Barons',
  },
  {
    id: 'border-crossing',
    name: 'Border Crossing',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'border_territories',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Smuggling routes', value: 200 },
      { type: ZoneBenefitType.TACTICAL, description: 'Escape routes', value: 35 },
    ],
    defenseRating: 80,
    dailyIncome: 280,
    npcGang: NPC_GANGS.EL_REY_FRONTERA,
    npcGangName: "El Rey's Frontera Gang",
  },

  // ADDITIONAL TOWN DISTRICTS
  {
    id: 'red-gulch-mining-office-district',
    name: 'Red Gulch - Mining Office District',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'red_gulch',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Mining claim fees', value: 110 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Ore processing access', value: 20 },
    ],
    defenseRating: 45,
    dailyIncome: 150,
    npcGang: NPC_GANGS.BANKERS_SYNDICATE,
    npcGangName: "The Banker's Syndicate",
  },
  {
    id: 'red-gulch-chinatown',
    name: 'Red Gulch - Chinatown',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'red_gulch',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Hidden passages network', value: 25 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Exotic goods trade', value: 30 },
      { type: ZoneBenefitType.INCOME, description: 'Opium den profits', value: 130 },
    ],
    defenseRating: 60,
    dailyIncome: 170,
    npcGang: null,
  },
  {
    id: 'whiskey-bend-industrial-quarter',
    name: 'Whiskey Bend - Industrial Quarter',
    type: ZoneType.TOWN_DISTRICT,
    parentLocation: 'whiskey_bend',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Worker extortion', value: 100 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Industrial supply access', value: 15 },
    ],
    defenseRating: 50,
    dailyIncome: 140,
    npcGang: NPC_GANGS.RAILROAD_BARONS,
    npcGangName: 'The Railroad Barons',
  },

  // WILDERNESS OUTPOSTS
  {
    id: 'ghost-town-remnants',
    name: 'Ghost Town Remnants',
    type: ZoneType.WILDERNESS,
    parentLocation: 'ghost_towns',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Secret meeting spot', value: 30 },
      { type: ZoneBenefitType.INCOME, description: 'Scavenger rights', value: 50 },
    ],
    defenseRating: 35,
    dailyIncome: 60,
    npcGang: null,
  },
  {
    id: 'mesa-lookout',
    name: 'Mesa Lookout Point',
    type: ZoneType.WILDERNESS,
    parentLocation: 'sangre_mountains',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Early warning system', value: 35 },
      { type: ZoneBenefitType.COMBAT, description: 'High ground advantage', value: 15 },
    ],
    defenseRating: 70,
    dailyIncome: 40,
    npcGang: NPC_GANGS.COMANCHE_RAIDERS,
    npcGangName: 'The Comanche Raiders',
  },
  {
    id: 'canyon-hideout',
    name: 'Canyon Hideout Network',
    type: ZoneType.WILDERNESS,
    parentLocation: 'devils_canyon',
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Multiple escape routes', value: 40 },
      { type: ZoneBenefitType.COMBAT, description: 'Defensive positions', value: 20 },
    ],
    defenseRating: 85,
    dailyIncome: 70,
    npcGang: null,
  },

  // STRATEGIC RESOURCES
  {
    id: 'timber-operation',
    name: 'Timber Operation Zone',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'frontier_wilderness',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Lumber trade profits', value: 120 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Building material access', value: 20 },
    ],
    defenseRating: 50,
    dailyIncome: 160,
    npcGang: null,
  },
  {
    id: 'hunting-grounds',
    name: 'Prime Hunting Grounds',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'frontier_wilderness',
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Fur trade monopoly', value: 90 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Food supply advantage', value: 15 },
    ],
    defenseRating: 40,
    dailyIncome: 120,
    npcGang: NPC_GANGS.COMANCHE_RAIDERS,
    npcGangName: 'The Comanche Raiders',
  },
];

/**
 * Seed territory zones into database
 */
export async function seedTerritoryZones(): Promise<void> {
  try {
    logger.info('Seeding territory zones...');

    for (const zoneDef of ZONE_DEFINITIONS) {
      const existing = await TerritoryZone.findOne({ id: zoneDef.id });

      if (existing) {
        logger.debug(`Zone ${zoneDef.id} already exists, skipping`);
        continue;
      }

      const zone = new TerritoryZone({
        id: zoneDef.id,
        name: zoneDef.name,
        type: zoneDef.type,
        parentLocation: zoneDef.parentLocation,
        benefits: zoneDef.benefits,
        defenseRating: zoneDef.defenseRating,
        dailyIncome: zoneDef.dailyIncome,
        controlledBy: zoneDef.npcGang || null,
        controllingGangName: zoneDef.npcGangName || null,
        influence: zoneDef.npcGang
          ? [
              {
                gangId: zoneDef.npcGang,
                gangName: zoneDef.npcGangName!,
                influence: 100,
                isNpcGang: true,
                lastActivity: new Date(),
              },
            ]
          : [],
        contestedBy: [],
      });

      await zone.save();
      logger.debug(`Created zone: ${zoneDef.name}`);
    }

    const count = await TerritoryZone.countDocuments();
    logger.info(`Territory zones seeded successfully. Total zones: ${count}`);
  } catch (error) {
    logger.error('Error seeding territory zones:', error);
    throw error;
  }
}
