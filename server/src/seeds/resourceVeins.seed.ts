/**
 * Resource Vein Seed Data
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Seeds resource veins across mining zones for the scarcity system.
 * Veins have different capacities, types, and regeneration properties.
 */

import mongoose from 'mongoose';
import { ResourceVein } from '../models/ResourceVein.model';
import {
  ScarcityResourceType,
  ResourceVeinStatus,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Resource Vein definitions organized by zone
 */
const RESOURCE_VEIN_DATA = [
  // ========== GOLDFINGERS MINE ==========
  // Primary gold mining location - abundant gold, silver, and deep resources
  {
    name: 'Goldfinger Main Lode',
    resourceType: ScarcityResourceType.GOLD_ORE,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 100, y: 50 },
    baseYield: 15,
    totalCapacity: 50000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Silver Pocket Vein',
    resourceType: ScarcityResourceType.SILVER_ORE,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 120, y: 60 },
    baseYield: 20,
    totalCapacity: 35000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Deep Iron Shaft Alpha',
    resourceType: ScarcityResourceType.DEEP_IRON,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 80, y: 70 },
    baseYield: 8,
    totalCapacity: 25000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Lucky Strike Gold Vein',
    resourceType: ScarcityResourceType.GOLD_ORE,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 150, y: 40 },
    baseYield: 12,
    totalCapacity: 30000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Copper Ridge Deposit',
    resourceType: ScarcityResourceType.COPPER_ORE,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 130, y: 80 },
    baseYield: 25,
    totalCapacity: 60000,
    isRenewable: false,
    regenerationRate: 0,
  },

  // ========== RED GULCH ==========
  // Starter area with moderate resources - iron, coal, some copper
  {
    name: 'Dusty Iron Vein',
    resourceType: ScarcityResourceType.IRON_ORE,
    zoneId: 'red-gulch-market-square',
    coordinates: { x: 50, y: 30 },
    baseYield: 30,
    totalCapacity: 80000,
    isRenewable: true,
    regenerationRate: 500, // 500 units per day
  },
  {
    name: 'Canyon Coal Seam',
    resourceType: ScarcityResourceType.COAL,
    zoneId: 'red-gulch-residential',
    coordinates: { x: 60, y: 45 },
    baseYield: 40,
    totalCapacity: 100000,
    isRenewable: true,
    regenerationRate: 750,
  },
  {
    name: 'Red Rock Copper',
    resourceType: ScarcityResourceType.COPPER_ORE,
    zoneId: 'red-gulch-saloon-district',
    coordinates: { x: 45, y: 55 },
    baseYield: 22,
    totalCapacity: 45000,
    isRenewable: true,
    regenerationRate: 300,
  },
  {
    name: 'Gulch Silver Trace',
    resourceType: ScarcityResourceType.SILVER_ORE,
    zoneId: 'red-gulch-market-square',
    coordinates: { x: 70, y: 35 },
    baseYield: 10,
    totalCapacity: 20000,
    isRenewable: false,
    regenerationRate: 0,
  },

  // ========== KAIOWA MESA ==========
  // Native territory with rare minerals and spiritual significance
  {
    name: 'Spirit Stone Vein',
    resourceType: ScarcityResourceType.QUICKSILVER,
    zoneId: 'kaiowa-mesa-trading-post',
    coordinates: { x: 200, y: 150 },
    baseYield: 6,
    totalCapacity: 15000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Mesa Gold Pocket',
    resourceType: ScarcityResourceType.GOLD_ORE,
    zoneId: 'kaiowa-mesa-trading-post',
    coordinates: { x: 180, y: 130 },
    baseYield: 8,
    totalCapacity: 18000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Sacred Copper Deposit',
    resourceType: ScarcityResourceType.COPPER_ORE,
    zoneId: 'kaiowa-mesa-trading-post',
    coordinates: { x: 210, y: 140 },
    baseYield: 18,
    totalCapacity: 40000,
    isRenewable: true,
    regenerationRate: 250,
  },
  {
    name: 'Ancestral Iron Vein',
    resourceType: ScarcityResourceType.IRON_ORE,
    zoneId: 'kaiowa-mesa-trading-post',
    coordinates: { x: 190, y: 160 },
    baseYield: 28,
    totalCapacity: 55000,
    isRenewable: true,
    regenerationRate: 400,
  },

  // ========== THE SCAR ==========
  // Outlaw territory - dangerous but rich in rare resources, including eldritch
  {
    name: 'Outlaw Gold Cache',
    resourceType: ScarcityResourceType.GOLD_ORE,
    zoneId: 'the-scar-outlaw-camp',
    coordinates: { x: 300, y: 200 },
    baseYield: 20,
    totalCapacity: 25000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Mithril Deep Vein',
    resourceType: ScarcityResourceType.MITHRIL,
    zoneId: 'the-scar-outlaw-camp',
    coordinates: { x: 320, y: 220 },
    baseYield: 4,
    totalCapacity: 8000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Star Metal Crater',
    resourceType: ScarcityResourceType.STAR_METAL,
    zoneId: 'the-scar-outlaw-camp',
    coordinates: { x: 280, y: 230 },
    baseYield: 2,
    totalCapacity: 3000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Void Crystal Fissure',
    resourceType: ScarcityResourceType.VOID_CRYSTAL,
    zoneId: 'the-scar-outlaw-camp',
    coordinates: { x: 340, y: 250 },
    baseYield: 1,
    totalCapacity: 1500,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'The Eldritch Pit',
    resourceType: ScarcityResourceType.ELDRITCH_ORE,
    zoneId: 'the-scar-outlaw-camp',
    coordinates: { x: 350, y: 280 },
    baseYield: 1,
    totalCapacity: 500,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Bandit Silver Mine',
    resourceType: ScarcityResourceType.SILVER_ORE,
    zoneId: 'the-scar-outlaw-camp',
    coordinates: { x: 290, y: 210 },
    baseYield: 15,
    totalCapacity: 30000,
    isRenewable: false,
    regenerationRate: 0,
  },

  // ========== WHISKEY BEND ==========
  // Entertainment town - limited mining, some coal for industry
  {
    name: 'Bend Coal Deposit',
    resourceType: ScarcityResourceType.COAL,
    zoneId: 'whiskey-bend-gambling-row',
    coordinates: { x: 400, y: 100 },
    baseYield: 35,
    totalCapacity: 70000,
    isRenewable: true,
    regenerationRate: 600,
  },
  {
    name: 'Saloon Iron Vein',
    resourceType: ScarcityResourceType.IRON_ORE,
    zoneId: 'whiskey-bend-theater-district',
    coordinates: { x: 410, y: 120 },
    baseYield: 20,
    totalCapacity: 40000,
    isRenewable: true,
    regenerationRate: 350,
  },

  // ========== THE FRONTERA ==========
  // Border town with moderate resources
  {
    name: 'Frontera Copper Lode',
    resourceType: ScarcityResourceType.COPPER_ORE,
    zoneId: 'frontera-plaza-district',
    coordinates: { x: 500, y: 300 },
    baseYield: 24,
    totalCapacity: 50000,
    isRenewable: true,
    regenerationRate: 400,
  },
  {
    name: 'Border Gold Trace',
    resourceType: ScarcityResourceType.GOLD_ORE,
    zoneId: 'frontera-plaza-district',
    coordinates: { x: 520, y: 310 },
    baseYield: 7,
    totalCapacity: 15000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Plaza Silver Deposit',
    resourceType: ScarcityResourceType.SILVER_ORE,
    zoneId: 'frontera-plaza-district',
    coordinates: { x: 480, y: 290 },
    baseYield: 12,
    totalCapacity: 25000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Quicksilver Spring',
    resourceType: ScarcityResourceType.QUICKSILVER,
    zoneId: 'frontera-plaza-district',
    coordinates: { x: 510, y: 320 },
    baseYield: 5,
    totalCapacity: 10000,
    isRenewable: false,
    regenerationRate: 0,
  },

  // ========== FORT ASHFORD ==========
  // Military outpost - controlled, moderate resources
  {
    name: 'Military Iron Reserve',
    resourceType: ScarcityResourceType.IRON_ORE,
    zoneId: 'fort-ashford-military-zone',
    coordinates: { x: 600, y: 400 },
    baseYield: 35,
    totalCapacity: 90000,
    isRenewable: true,
    regenerationRate: 700,
  },
  {
    name: 'Fort Coal Supply',
    resourceType: ScarcityResourceType.COAL,
    zoneId: 'fort-ashford-military-zone',
    coordinates: { x: 620, y: 420 },
    baseYield: 45,
    totalCapacity: 120000,
    isRenewable: true,
    regenerationRate: 900,
  },
  {
    name: 'Garrison Copper Vein',
    resourceType: ScarcityResourceType.COPPER_ORE,
    zoneId: 'fort-ashford-military-zone',
    coordinates: { x: 580, y: 410 },
    baseYield: 20,
    totalCapacity: 45000,
    isRenewable: true,
    regenerationRate: 350,
  },

  // ========== LONGHORN RANCH ==========
  // Ranch area - some basic minerals, water resources
  {
    name: 'Ranch Coal Bed',
    resourceType: ScarcityResourceType.COAL,
    zoneId: 'longhorn-ranch-zone',
    coordinates: { x: 700, y: 500 },
    baseYield: 30,
    totalCapacity: 60000,
    isRenewable: true,
    regenerationRate: 500,
  },
  {
    name: 'Pasture Iron Deposit',
    resourceType: ScarcityResourceType.IRON_ORE,
    zoneId: 'longhorn-ranch-zone',
    coordinates: { x: 720, y: 520 },
    baseYield: 25,
    totalCapacity: 50000,
    isRenewable: true,
    regenerationRate: 400,
  },

  // ========== DEEP MINING ZONES (Tier 6-8 Resources) ==========
  // These are accessible from deep mining shafts
  {
    name: 'Deep Iron Motherload',
    resourceType: ScarcityResourceType.DEEP_IRON,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 100, y: 200 },
    baseYield: 10,
    totalCapacity: 40000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Mithril Heart',
    resourceType: ScarcityResourceType.MITHRIL,
    zoneId: 'goldfingers-mine-zone',
    coordinates: { x: 110, y: 220 },
    baseYield: 5,
    totalCapacity: 12000,
    isRenewable: false,
    regenerationRate: 0,
  },
  {
    name: 'Fallen Star Deposit',
    resourceType: ScarcityResourceType.STAR_METAL,
    zoneId: 'kaiowa-mesa-trading-post',
    coordinates: { x: 200, y: 250 },
    baseYield: 3,
    totalCapacity: 5000,
    isRenewable: false,
    regenerationRate: 0,
  },
];

/**
 * Seed resource veins into the database
 */
export async function seedResourceVeins(): Promise<void> {
  logger.info('[Seed] Starting resource vein seeding...');

  try {
    // Clear existing resource veins
    const deleteResult = await ResourceVein.deleteMany({});
    logger.info(`[Seed] Cleared ${deleteResult.deletedCount} existing resource veins`);

    // Insert new resource veins
    const veins = RESOURCE_VEIN_DATA.map((data) => ({
      ...data,
      status: ResourceVeinStatus.ABUNDANT,
      extractedAmount: 0,
      remainingPercent: 100,
      currentYieldMultiplier: 1.0,
      claimCount: 0,
      claimIds: [],
      competitionPenalty: 0,
      discoveredAt: new Date(),
    }));

    const result = await ResourceVein.insertMany(veins);
    logger.info(`[Seed] Successfully seeded ${result.length} resource veins`);

    // Log summary by zone
    const zoneCounts: Record<string, number> = {};
    for (const vein of veins) {
      zoneCounts[vein.zoneId] = (zoneCounts[vein.zoneId] || 0) + 1;
    }
    logger.info('[Seed] Resource veins by zone:', zoneCounts);

    // Log summary by resource type
    const typeCounts: Record<string, number> = {};
    for (const vein of veins) {
      typeCounts[vein.resourceType] = (typeCounts[vein.resourceType] || 0) + 1;
    }
    logger.info('[Seed] Resource veins by type:', typeCounts);

  } catch (error) {
    logger.error('[Seed] Error seeding resource veins:', error);
    throw error;
  }
}

/**
 * Remove all resource veins
 */
export async function clearResourceVeins(): Promise<void> {
  const result = await ResourceVein.deleteMany({});
  logger.info(`[Seed] Cleared ${result.deletedCount} resource veins`);
}

export default seedResourceVeins;
