/**
 * Territory Zones Seed Data
 *
 * Initial zones for gang territory control system
 */

import mongoose from 'mongoose';
import { TerritoryZone, ZoneType, ZoneBenefitType, ZoneSpecialization } from '../models/TerritoryZone.model';
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
    specialization: ZoneSpecialization.CRIMINAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Saloon protection money', value: 100 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Liquor trade profits', value: 50 },
      { type: ZoneBenefitType.CRIME_SUCCESS, description: 'Drunk marks are easy', value: 15 },
      { type: ZoneBenefitType.CRIME_DETECTION, description: 'Noisy crowd cover', value: 20 },
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
    specialization: ZoneSpecialization.TRADING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Merchant taxes', value: 120 },
      { type: ZoneBenefitType.ECONOMIC, description: '10% shop discount', value: 10 },
      { type: ZoneBenefitType.TRADE_BUY, description: 'Wholesale access', value: 15 },
      { type: ZoneBenefitType.TRADE_SELL, description: 'Premium buyers', value: 20 },
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
    specialization: ZoneSpecialization.MIXED,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Safe houses', value: 20 },
      { type: ZoneBenefitType.INCOME, description: 'Protection rackets', value: 80 },
      { type: ZoneBenefitType.CONTRACT_GOLD, description: 'Local contract network', value: 10 },
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
    specialization: ZoneSpecialization.CRIMINAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Gambling house cuts', value: 150 },
      { type: ZoneBenefitType.COMBAT, description: 'Enforcer recruitment bonus', value: 10 },
      { type: ZoneBenefitType.CRIME_FENCE, description: 'No-questions fences', value: 25 },
      { type: ZoneBenefitType.COMBAT_GOLD, description: 'High-stakes winnings', value: 15 },
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
    specialization: ZoneSpecialization.TRADING,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Information network', value: 15 },
      { type: ZoneBenefitType.INCOME, description: 'Entertainment profits', value: 90 },
      { type: ZoneBenefitType.CONTRACT_GOLD, description: 'Connected clientele', value: 15 },
      { type: ZoneBenefitType.CONTRACT_XP, description: 'Learned patrons', value: 10 },
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
    specialization: ZoneSpecialization.TRADING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Smuggling operations', value: 180 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Black market access', value: 25 },
      { type: ZoneBenefitType.TRADE_BUY, description: 'Direct imports', value: 20 },
      { type: ZoneBenefitType.TRADE_SELL, description: 'Export network', value: 25 },
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
    specialization: ZoneSpecialization.CRIMINAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cantina profits', value: 120 },
      { type: ZoneBenefitType.TACTICAL, description: 'Border intel', value: 20 },
      { type: ZoneBenefitType.CRIME_SUCCESS, description: 'Tourist marks', value: 20 },
      { type: ZoneBenefitType.BOUNTY_VALUE, description: 'Cross-border targets', value: 15 },
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
    specialization: ZoneSpecialization.MILITARY,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Hideout network', value: 30 },
      { type: ZoneBenefitType.COMBAT, description: '+15% combat in zone', value: 15 },
      { type: ZoneBenefitType.COMBAT_DAMAGE, description: 'Hardened fighters', value: 20 },
      { type: ZoneBenefitType.COMBAT_DEFENSE, description: 'Safe haven', value: 15 },
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
    specialization: ZoneSpecialization.CRIMINAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Contraband trade', value: 200 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Smuggling bonus +20%', value: 20 },
      { type: ZoneBenefitType.CRIME_FENCE, description: 'Black market network', value: 30 },
      { type: ZoneBenefitType.CRIME_JAIL, description: 'Bribed officials', value: 25 },
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
    specialization: ZoneSpecialization.FRONTIER,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Toll collection', value: 60 },
      { type: ZoneBenefitType.TACTICAL, description: 'Travel route control', value: 25 },
      { type: ZoneBenefitType.BOUNTY_TRACKING, description: 'Trail surveillance', value: 20 },
      { type: ZoneBenefitType.CATTLE_SURVIVAL, description: 'Safe passage', value: 15 },
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
    specialization: ZoneSpecialization.FRONTIER,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Toll collection', value: 60 },
      { type: ZoneBenefitType.TACTICAL, description: 'Travel route control', value: 25 },
      { type: ZoneBenefitType.BOUNTY_TRACKING, description: 'Trail surveillance', value: 20 },
      { type: ZoneBenefitType.CATTLE_SURVIVAL, description: 'Safe passage', value: 15 },
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
    specialization: ZoneSpecialization.MINING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Miner protection fees', value: 100 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Ore trade access', value: 30 },
      { type: ZoneBenefitType.MINING_YIELD, description: 'Rich ore veins', value: 25 },
      { type: ZoneBenefitType.MINING_RARE, description: 'Gold deposits', value: 20 },
      { type: ZoneBenefitType.MINING_VALUE, description: 'Assayer access', value: 15 },
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
    specialization: ZoneSpecialization.RANCHING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cattle rustling profits', value: 90 },
      { type: ZoneBenefitType.TACTICAL, description: 'Remote hideouts', value: 15 },
      { type: ZoneBenefitType.CATTLE_REWARD, description: 'Prime grazing', value: 25 },
      { type: ZoneBenefitType.CATTLE_SURVIVAL, description: 'Water sources', value: 20 },
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
    specialization: ZoneSpecialization.RANCHING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cattle rustling profits', value: 90 },
      { type: ZoneBenefitType.TACTICAL, description: 'Remote hideouts', value: 15 },
      { type: ZoneBenefitType.CATTLE_REWARD, description: 'Prime grazing', value: 25 },
      { type: ZoneBenefitType.CATTLE_SURVIVAL, description: 'Shelter valleys', value: 20 },
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
    specialization: ZoneSpecialization.MILITARY,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Spiritual protection', value: 20 },
      { type: ZoneBenefitType.COMBAT, description: 'Defensive advantage', value: 10 },
      { type: ZoneBenefitType.COMBAT_DEFENSE, description: 'Sacred ground', value: 25 },
      { type: ZoneBenefitType.BOUNTY_XP, description: 'Tribal wisdom', value: 15 },
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
    specialization: ZoneSpecialization.TRADING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Bridge tolls', value: 140 },
      { type: ZoneBenefitType.TACTICAL, description: 'Chokepoint control', value: 30 },
      { type: ZoneBenefitType.TRADE_DISCOUNT, description: 'Trade route access', value: 15 },
      { type: ZoneBenefitType.CATTLE_SURVIVAL, description: 'Safe crossing', value: 20 },
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
    specialization: ZoneSpecialization.RANCHING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Water access fees', value: 100 },
      { type: ZoneBenefitType.TACTICAL, description: 'Supply control', value: 25 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Water trade monopoly', value: 20 },
      { type: ZoneBenefitType.CATTLE_SURVIVAL, description: 'Hydration source', value: 25 },
      { type: ZoneBenefitType.CATTLE_REWARD, description: 'Healthy herds', value: 15 },
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
    specialization: ZoneSpecialization.TRADING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Caravan protection fees', value: 160 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Trading post access', value: 25 },
      { type: ZoneBenefitType.TRADE_BUY, description: 'Bulk discount', value: 20 },
      { type: ZoneBenefitType.TRADE_SELL, description: 'Multiple buyers', value: 25 },
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
    specialization: ZoneSpecialization.MILITARY,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Perfect hideout location', value: 40 },
      { type: ZoneBenefitType.COMBAT, description: 'Ambush opportunities', value: 20 },
      { type: ZoneBenefitType.COMBAT_DAMAGE, description: 'Ambush tactics', value: 25 },
      { type: ZoneBenefitType.COMBAT_DEFENSE, description: 'Fortified positions', value: 20 },
      { type: ZoneBenefitType.CRIME_JAIL, description: 'Hard to find', value: 30 },
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
    specialization: ZoneSpecialization.INDUSTRIAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Cargo theft opportunities', value: 180 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Fast travel access', value: 15 },
      { type: ZoneBenefitType.PROPERTY_SPEED, description: 'Rail shipments', value: 20 },
      { type: ZoneBenefitType.TRADE_DISCOUNT, description: 'Freight rates', value: 15 },
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
    specialization: ZoneSpecialization.CRIMINAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Smuggling routes', value: 200 },
      { type: ZoneBenefitType.TACTICAL, description: 'Escape routes', value: 35 },
      { type: ZoneBenefitType.CRIME_FENCE, description: 'Cross-border fences', value: 30 },
      { type: ZoneBenefitType.BOUNTY_VALUE, description: 'International targets', value: 20 },
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
    specialization: ZoneSpecialization.MINING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Mining claim fees', value: 110 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Ore processing access', value: 20 },
      { type: ZoneBenefitType.MINING_VALUE, description: 'Official assayers', value: 20 },
      { type: ZoneBenefitType.MINING_SPEED, description: 'Claim permits', value: 15 },
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
    specialization: ZoneSpecialization.CRIMINAL,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Hidden passages network', value: 25 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Exotic goods trade', value: 30 },
      { type: ZoneBenefitType.INCOME, description: 'Opium den profits', value: 130 },
      { type: ZoneBenefitType.CRIME_DETECTION, description: 'Labyrinth streets', value: 25 },
      { type: ZoneBenefitType.TRADE_BUY, description: 'Exotic imports', value: 15 },
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
    specialization: ZoneSpecialization.INDUSTRIAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Worker extortion', value: 100 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Industrial supply access', value: 15 },
      { type: ZoneBenefitType.PROPERTY_INCOME, description: 'Factory profits', value: 20 },
      { type: ZoneBenefitType.PROPERTY_SPEED, description: 'Skilled labor', value: 15 },
      { type: ZoneBenefitType.WORKER_EFFICIENCY, description: 'Trained workforce', value: 20 },
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
    specialization: ZoneSpecialization.FRONTIER,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Secret meeting spot', value: 30 },
      { type: ZoneBenefitType.INCOME, description: 'Scavenger rights', value: 50 },
      { type: ZoneBenefitType.BOUNTY_TRACKING, description: 'Outlaw hideouts', value: 25 },
      { type: ZoneBenefitType.MINING_RARE, description: 'Abandoned claims', value: 15 },
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
    specialization: ZoneSpecialization.MILITARY,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Early warning system', value: 35 },
      { type: ZoneBenefitType.COMBAT, description: 'High ground advantage', value: 15 },
      { type: ZoneBenefitType.COMBAT_DAMAGE, description: 'Sniper positions', value: 20 },
      { type: ZoneBenefitType.BOUNTY_TRACKING, description: 'Surveillance point', value: 25 },
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
    specialization: ZoneSpecialization.MILITARY,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Multiple escape routes', value: 40 },
      { type: ZoneBenefitType.COMBAT, description: 'Defensive positions', value: 20 },
      { type: ZoneBenefitType.COMBAT_DEFENSE, description: 'Canyon walls', value: 25 },
      { type: ZoneBenefitType.CRIME_JAIL, description: 'Impossible to track', value: 25 },
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
    specialization: ZoneSpecialization.INDUSTRIAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Lumber trade profits', value: 120 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Building material access', value: 20 },
      { type: ZoneBenefitType.PROPERTY_INCOME, description: 'Timber sales', value: 25 },
      { type: ZoneBenefitType.PROPERTY_SPEED, description: 'Raw materials', value: 15 },
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
    specialization: ZoneSpecialization.FRONTIER,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Fur trade monopoly', value: 90 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Food supply advantage', value: 15 },
      { type: ZoneBenefitType.BOUNTY_VALUE, description: 'Predator bounties', value: 20 },
      { type: ZoneBenefitType.BOUNTY_XP, description: 'Tracking skills', value: 20 },
      { type: ZoneBenefitType.COMBAT_XP, description: 'Hunting experience', value: 15 },
    ],
    defenseRating: 40,
    dailyIncome: 120,
    npcGang: NPC_GANGS.COMANCHE_RAIDERS,
    npcGangName: 'The Comanche Raiders',
  },

  // =================================================================
  // SILVERADO VALLEY - Phase 19.4 "Heart of the Territory" (L26-35)
  // =================================================================
  // The Silverado Strike - biggest silver discovery since Comstock Lode
  // These zones become available after Colonel Blackwood's defeat

  {
    id: 'silverado-central-claims',
    name: 'Silverado Valley - Central Claims',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'silverado_valley',
    specialization: ZoneSpecialization.MINING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Prime silver claim revenues', value: 350 },
      { type: ZoneBenefitType.MINING_YIELD, description: 'Richest silver veins', value: 40 },
      { type: ZoneBenefitType.MINING_RARE, description: 'Native silver deposits', value: 35 },
      { type: ZoneBenefitType.MINING_VALUE, description: 'Premium ore grades', value: 30 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Central market access', value: 25 },
    ],
    defenseRating: 75,
    dailyIncome: 350,
    npcGang: null, // Contested - no initial owner
  },
  {
    id: 'silverado-eastern-claims',
    name: 'Silverado Valley - Eastern Claims',
    type: ZoneType.WILDERNESS,
    parentLocation: 'silverado_valley',
    specialization: ZoneSpecialization.MINING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Silver claim revenues', value: 180 },
      { type: ZoneBenefitType.MINING_YIELD, description: 'Deep silver veins', value: 30 },
      { type: ZoneBenefitType.MINING_RARE, description: 'Gold trace deposits', value: 20 },
      { type: ZoneBenefitType.TACTICAL, description: 'Canyon approaches', value: 20 },
      { type: ZoneBenefitType.COMBAT_DEFENSE, description: 'Narrow passages', value: 15 },
    ],
    defenseRating: 60,
    dailyIncome: 220,
    npcGang: null, // Claim Jumpers territory (becomes contested)
  },
  {
    id: 'silverado-western-claims',
    name: 'Silverado Valley - Western Claims',
    type: ZoneType.WILDERNESS,
    parentLocation: 'silverado_valley',
    specialization: ZoneSpecialization.MINING,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Silver claim revenues', value: 180 },
      { type: ZoneBenefitType.MINING_YIELD, description: 'Surface silver deposits', value: 35 },
      { type: ZoneBenefitType.MINING_SPEED, description: 'Easy extraction', value: 25 },
      { type: ZoneBenefitType.TACTICAL, description: 'Multiple escape routes', value: 15 },
      { type: ZoneBenefitType.BOUNTY_TRACKING, description: 'Open terrain', value: 15 },
    ],
    defenseRating: 50,
    dailyIncome: 200,
    npcGang: null, // Open claims
  },
  {
    id: 'silverado-processing-facility',
    name: 'Silverado Valley - Processing Facility',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'silverado_valley',
    specialization: ZoneSpecialization.INDUSTRIAL,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Processing monopoly fees', value: 280 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Refinery access', value: 35 },
      { type: ZoneBenefitType.MINING_VALUE, description: 'Smelting operations', value: 40 },
      { type: ZoneBenefitType.PROPERTY_INCOME, description: 'Industrial output', value: 30 },
      { type: ZoneBenefitType.WORKER_EFFICIENCY, description: 'Skilled metallurgists', value: 25 },
    ],
    defenseRating: 70,
    dailyIncome: 320,
    npcGang: NPC_GANGS.BANKERS_SYNDICATE, // Silver Baron controls this initially
    npcGangName: "The Banker's Syndicate",
  },
  {
    id: 'sacred-mountain-approach',
    name: 'Sacred Mountain - Approach',
    type: ZoneType.WILDERNESS,
    parentLocation: 'silverado_valley',
    specialization: ZoneSpecialization.MILITARY,
    benefits: [
      { type: ZoneBenefitType.TACTICAL, description: 'Ancestral fortifications', value: 40 },
      { type: ZoneBenefitType.COMBAT, description: 'Defensive terrain', value: 25 },
      { type: ZoneBenefitType.COMBAT_DEFENSE, description: 'Sacred ground blessing', value: 30 },
      { type: ZoneBenefitType.COMBAT_DAMAGE, description: 'War Chief tactics', value: 20 },
      { type: ZoneBenefitType.BOUNTY_XP, description: 'Tribal wisdom', value: 20 },
    ],
    defenseRating: 90,
    dailyIncome: 120,
    npcGang: NPC_GANGS.COMANCHE_RAIDERS, // War Chief Iron Wolf's territory
    npcGangName: 'The Comanche Raiders',
  },
  {
    id: 'heart-of-silverado',
    name: 'Heart of Silverado',
    type: ZoneType.STRATEGIC_POINT,
    parentLocation: 'silverado_valley',
    specialization: ZoneSpecialization.MIXED,
    benefits: [
      { type: ZoneBenefitType.INCOME, description: 'Territory throne revenues', value: 500 },
      { type: ZoneBenefitType.ECONOMIC, description: 'Valley-wide trade control', value: 40 },
      { type: ZoneBenefitType.TACTICAL, description: 'Central command', value: 35 },
      { type: ZoneBenefitType.MINING_YIELD, description: 'All claims tribute', value: 25 },
      { type: ZoneBenefitType.COMBAT, description: 'Claim King authority', value: 20 },
      { type: ZoneBenefitType.PROPERTY_INCOME, description: 'Empire hub', value: 30 },
    ],
    defenseRating: 95,
    dailyIncome: 500,
    npcGang: null, // Final boss location - contested by all
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
        specialization: zoneDef.specialization || ZoneSpecialization.MIXED,
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
