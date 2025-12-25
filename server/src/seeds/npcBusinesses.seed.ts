/**
 * NPC Business Seed Data
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Seeds NPC-owned businesses that compete with player businesses
 * for customer traffic within zones.
 */

import mongoose from 'mongoose';
import { NPCBusiness } from '../models/NPCBusiness.model';
import {
  NPCBusinessPersonality,
  NPCBusinessStatus,
  BusinessTypeCategory,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * NPC Business definitions organized by zone
 */
const NPC_BUSINESS_DATA = [
  // ========== RED GULCH ==========
  {
    name: "Old Pete's General Store",
    ownerName: 'Old Pete McGraw',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'red-gulch-market-square',
    locationId: 'red_gulch',
    personality: NPCBusinessPersonality.PASSIVE,
    baseQuality: 6,
    currentQuality: 6,
    priceModifier: 0.95, // Slightly cheaper
    reputation: 65,
    aggressiveness: 20,
    resilience: 80,
    expansionTendency: 10,
  },
  {
    name: "The Dusty Saddle Saloon",
    ownerName: 'Mama Belle',
    businessType: BusinessTypeCategory.SALOON,
    zoneId: 'red-gulch-saloon-district',
    locationId: 'red_gulch',
    personality: NPCBusinessPersonality.BALANCED,
    baseQuality: 7,
    currentQuality: 7,
    priceModifier: 1.0,
    reputation: 70,
    aggressiveness: 50,
    resilience: 60,
    expansionTendency: 30,
  },
  {
    name: "Red Canyon Smithy",
    ownerName: 'Iron Jack Thompson',
    businessType: BusinessTypeCategory.BLACKSMITH,
    zoneId: 'red-gulch-market-square',
    locationId: 'red_gulch',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 8,
    currentQuality: 8,
    priceModifier: 1.15, // Premium prices
    reputation: 75,
    aggressiveness: 30,
    resilience: 70,
    expansionTendency: 20,
  },
  {
    name: "McGinty's Stable",
    ownerName: 'Silas McGinty',
    businessType: BusinessTypeCategory.STABLE,
    zoneId: 'red-gulch-residential',
    locationId: 'red_gulch',
    personality: NPCBusinessPersonality.PASSIVE,
    baseQuality: 5,
    currentQuality: 5,
    priceModifier: 0.90,
    reputation: 55,
    aggressiveness: 15,
    resilience: 75,
    expansionTendency: 5,
  },
  {
    name: "Doc Whitmore's Office",
    ownerName: 'Dr. Eliza Whitmore',
    businessType: BusinessTypeCategory.DOCTOR,
    zoneId: 'red-gulch-residential',
    locationId: 'red_gulch',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 9,
    currentQuality: 9,
    priceModifier: 1.20,
    reputation: 85,
    aggressiveness: 10,
    resilience: 90,
    expansionTendency: 15,
  },

  // ========== WHISKEY BEND ==========
  {
    name: "The Lucky Ace Saloon",
    ownerName: 'Diamond Dan',
    businessType: BusinessTypeCategory.SALOON,
    zoneId: 'whiskey-bend-gambling-row',
    locationId: 'whiskey_bend',
    personality: NPCBusinessPersonality.AGGRESSIVE,
    baseQuality: 6,
    currentQuality: 6,
    priceModifier: 0.85, // Undercuts competition
    reputation: 60,
    aggressiveness: 85,
    resilience: 40,
    expansionTendency: 70,
  },
  {
    name: "Fancy Nancy's Parlor",
    ownerName: 'Nancy Belle',
    businessType: BusinessTypeCategory.SALOON,
    zoneId: 'whiskey-bend-theater-district',
    locationId: 'whiskey_bend',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 9,
    currentQuality: 9,
    priceModifier: 1.25,
    reputation: 80,
    aggressiveness: 25,
    resilience: 65,
    expansionTendency: 25,
  },
  {
    name: "Bent Wheel Stable",
    ownerName: 'Dusty Rhodes',
    businessType: BusinessTypeCategory.STABLE,
    zoneId: 'whiskey-bend-gambling-row',
    locationId: 'whiskey_bend',
    personality: NPCBusinessPersonality.BALANCED,
    baseQuality: 6,
    currentQuality: 6,
    priceModifier: 1.0,
    reputation: 58,
    aggressiveness: 45,
    resilience: 55,
    expansionTendency: 35,
  },

  // ========== THE FRONTERA ==========
  {
    name: "Cantina Rosa",
    ownerName: 'Rosa Delgado',
    businessType: BusinessTypeCategory.SALOON,
    zoneId: 'frontera-plaza-district',
    locationId: 'the_frontera',
    personality: NPCBusinessPersonality.BALANCED,
    baseQuality: 7,
    currentQuality: 7,
    priceModifier: 0.95,
    reputation: 72,
    aggressiveness: 50,
    resilience: 60,
    expansionTendency: 40,
  },
  {
    name: "El Mercado General",
    ownerName: 'Carlos Mendez',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'frontera-plaza-district',
    locationId: 'the_frontera',
    personality: NPCBusinessPersonality.AGGRESSIVE,
    baseQuality: 5,
    currentQuality: 5,
    priceModifier: 0.80,
    reputation: 55,
    aggressiveness: 80,
    resilience: 45,
    expansionTendency: 60,
  },
  {
    name: "Herrero Santos",
    ownerName: 'Miguel Santos',
    businessType: BusinessTypeCategory.BLACKSMITH,
    zoneId: 'frontera-plaza-district',
    locationId: 'the_frontera',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 8,
    currentQuality: 8,
    priceModifier: 1.10,
    reputation: 78,
    aggressiveness: 35,
    resilience: 70,
    expansionTendency: 20,
  },

  // ========== KAIOWA MESA ==========
  {
    name: "Spirit Water Trading Post",
    ownerName: 'Walking Bear',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'kaiowa-mesa-trading-post',
    locationId: 'kaiowa_mesa',
    personality: NPCBusinessPersonality.PASSIVE,
    baseQuality: 7,
    currentQuality: 7,
    priceModifier: 1.0,
    reputation: 70,
    aggressiveness: 20,
    resilience: 85,
    expansionTendency: 10,
  },
  {
    name: "Mesa View Stable",
    ownerName: 'Swift Horse',
    businessType: BusinessTypeCategory.STABLE,
    zoneId: 'kaiowa-mesa-trading-post',
    locationId: 'kaiowa_mesa',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 9,
    currentQuality: 9,
    priceModifier: 1.15,
    reputation: 82,
    aggressiveness: 15,
    resilience: 80,
    expansionTendency: 15,
  },

  // ========== THE SCAR ==========
  {
    name: "Shady Sam's Emporium",
    ownerName: 'Shady Sam',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'the-scar-outlaw-camp',
    locationId: 'the_scar',
    personality: NPCBusinessPersonality.AGGRESSIVE,
    baseQuality: 4,
    currentQuality: 4,
    priceModifier: 0.75, // Very cheap, low quality
    reputation: 40,
    aggressiveness: 90,
    resilience: 35,
    expansionTendency: 80,
  },
  {
    name: "The Vulture's Nest",
    ownerName: 'One-Eye Malone',
    businessType: BusinessTypeCategory.SALOON,
    zoneId: 'the-scar-outlaw-camp',
    locationId: 'the_scar',
    personality: NPCBusinessPersonality.AGGRESSIVE,
    baseQuality: 3,
    currentQuality: 3,
    priceModifier: 0.70,
    reputation: 35,
    aggressiveness: 95,
    resilience: 30,
    expansionTendency: 75,
  },

  // ========== FORT ASHFORD ==========
  {
    name: "Fort Sutler's Store",
    ownerName: 'Quartermaster Burke',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'fort-ashford-military-zone',
    locationId: 'fort_ashford',
    personality: NPCBusinessPersonality.PASSIVE,
    baseQuality: 7,
    currentQuality: 7,
    priceModifier: 1.05,
    reputation: 75,
    aggressiveness: 10,
    resilience: 95, // Military backing
    expansionTendency: 5,
  },
  {
    name: "Military Smithy",
    ownerName: 'Sergeant Hammer',
    businessType: BusinessTypeCategory.BLACKSMITH,
    zoneId: 'fort-ashford-military-zone',
    locationId: 'fort_ashford',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 9,
    currentQuality: 9,
    priceModifier: 1.20,
    reputation: 85,
    aggressiveness: 15,
    resilience: 90,
    expansionTendency: 10,
  },

  // ========== LONGHORN RANCH ==========
  {
    name: "Ranch Supply Store",
    ownerName: 'Big Jim Hawkins',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'longhorn-ranch-zone',
    locationId: 'longhorn_ranch',
    personality: NPCBusinessPersonality.BALANCED,
    baseQuality: 6,
    currentQuality: 6,
    priceModifier: 0.95,
    reputation: 65,
    aggressiveness: 45,
    resilience: 60,
    expansionTendency: 30,
  },
  {
    name: "Longhorn Stable",
    ownerName: 'Mary Hawkins',
    businessType: BusinessTypeCategory.STABLE,
    zoneId: 'longhorn-ranch-zone',
    locationId: 'longhorn_ranch',
    personality: NPCBusinessPersonality.QUALITY_FOCUSED,
    baseQuality: 8,
    currentQuality: 8,
    priceModifier: 1.10,
    reputation: 80,
    aggressiveness: 20,
    resilience: 75,
    expansionTendency: 25,
  },

  // ========== GOLDFINGERS MINE ==========
  {
    name: "Miner's Supply",
    ownerName: 'Goldfingers Jenkins',
    businessType: BusinessTypeCategory.GENERAL_STORE,
    zoneId: 'goldfingers-mine-zone',
    locationId: 'goldfingers_mine',
    personality: NPCBusinessPersonality.AGGRESSIVE,
    baseQuality: 5,
    currentQuality: 5,
    priceModifier: 1.20, // Gouging miners
    reputation: 45,
    aggressiveness: 75,
    resilience: 50,
    expansionTendency: 55,
  },
];

/**
 * Seed NPC businesses into the database
 */
export async function seedNPCBusinesses(): Promise<void> {
  logger.info('[Seed] Starting NPC business seeding...');

  try {
    // Clear existing NPC businesses
    const deleteResult = await NPCBusiness.deleteMany({});
    logger.info(`[Seed] Cleared ${deleteResult.deletedCount} existing NPC businesses`);

    // Insert new NPC businesses
    const businesses = NPC_BUSINESS_DATA.map((data) => ({
      ...data,
      status: NPCBusinessStatus.STABLE,
      weeklyRevenue: 0,
      averageRevenue: 0,
      consecutiveLossWeeks: 0,
      consecutiveGainWeeks: 0,
      gangProtected: false,
      competingWithPlayerBusinesses: [],
      establishedAt: new Date(),
    }));

    const result = await NPCBusiness.insertMany(businesses);
    logger.info(`[Seed] Successfully seeded ${result.length} NPC businesses`);

    // Log summary by zone
    const zoneCounts: Record<string, number> = {};
    for (const biz of businesses) {
      zoneCounts[biz.zoneId] = (zoneCounts[biz.zoneId] || 0) + 1;
    }
    logger.info('[Seed] NPC businesses by zone:', zoneCounts);

  } catch (error) {
    logger.error('[Seed] Error seeding NPC businesses:', error);
    throw error;
  }
}

/**
 * Remove all NPC businesses
 */
export async function clearNPCBusinesses(): Promise<void> {
  const result = await NPCBusiness.deleteMany({});
  logger.info(`[Seed] Cleared ${result.deletedCount} NPC businesses`);
}

export default seedNPCBusinesses;
