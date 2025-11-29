/**
 * Shop Property Definitions
 *
 * Retail shops in the four main towns - general stores and specialty shops
 * Phase 8, Wave 8.2 - Urban Shops & Workshops
 */

import type { PropertySize } from '@desperados/shared';

/**
 * Shop category types
 */
export type ShopCategory =
  | 'general_store'
  | 'gunsmith'
  | 'clothing'
  | 'pharmacy'
  | 'jewelry'
  | 'curiosities'
  | 'blacksmith'
  | 'provisions'
  | 'saddle_tack';

/**
 * Worker roles for shops
 */
export type ShopWorkerRole = 'clerk' | 'guard' | 'appraiser' | 'specialist' | 'manager';

/**
 * Urban shop property definition
 */
export interface UrbanShop {
  id: string;
  name: string;
  description: string;
  propertyType: 'shop';
  locationId: string;
  locationName: string;
  size: PropertySize;

  // Pricing
  basePrice: number;
  weeklyTax: number;
  weeklyUpkeep: number;
  rent?: number; // If renting the building

  // Physical attributes
  squareFeet: number;
  floors: number;
  backRoom: boolean;
  basement: boolean;
  livingQuarters: boolean;

  // Business attributes
  shopType: ShopCategory;
  inventorySlots: number;
  displayCases: number;
  customerCapacity: number;

  // Staff
  maxWorkers: number;
  requiredRoles: ShopWorkerRole[];

  // Income potential
  baseCustomersPerDay: number;
  priceMultiplier: number; // Location-based markup

  // Requirements
  levelRequirement: number;
  reputationRequirement?: { faction: string; amount: number };
  licenseRequired?: string;

  // Special features
  specialFeatures: string[];
  restrictions?: string[];
}

/**
 * GENERAL STORES (4 properties)
 */
export const GENERAL_STORES: Record<string, UrbanShop> = {
  red_gulch_general: {
    id: 'red_gulch_general',
    name: 'Red Gulch General Store',
    description:
      'A modest general store in the heart of Red Gulch. Dusty shelves stock everything from flour to ammunition. The proprietor keeps a shotgun under the counter.',
    propertyType: 'shop',
    locationId: 'red_gulch_town_square',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 1200,
    weeklyTax: 12,
    weeklyUpkeep: 8,

    squareFeet: 800,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    shopType: 'general_store',
    inventorySlots: 50,
    displayCases: 4,
    customerCapacity: 15,

    maxWorkers: 2,
    requiredRoles: ['clerk'],

    baseCustomersPerDay: 20,
    priceMultiplier: 1.0,

    levelRequirement: 5,

    specialFeatures: ['Starter-friendly', 'Basic goods', 'Local supplier discounts'],
  },

  frontera_trading_post: {
    id: 'frontera_trading_post',
    name: 'Frontera Trading Post',
    description:
      'A sprawling trading post on the lawless border. No questions asked about where goods come from. Black market items sometimes available.',
    propertyType: 'shop',
    locationId: 'frontera_town_square',
    locationName: 'The Frontera',
    size: 'medium' as PropertySize,

    basePrice: 2800,
    weeklyTax: 20,
    weeklyUpkeep: 15,

    squareFeet: 1400,
    floors: 1,
    backRoom: true,
    basement: true,
    livingQuarters: false,

    shopType: 'general_store',
    inventorySlots: 80,
    displayCases: 6,
    customerCapacity: 25,

    maxWorkers: 4,
    requiredRoles: ['clerk', 'guard'],

    baseCustomersPerDay: 35,
    priceMultiplier: 1.15,

    levelRequirement: 12,

    specialFeatures: [
      'Black market access',
      'Smuggled goods available',
      'No purchase records kept',
      'Frontera faction discount',
    ],
    restrictions: ['Requires neutral or friendly Frontera standing'],
  },

  fort_supply_depot: {
    id: 'fort_supply_depot',
    name: 'Fort Supply Depot',
    description:
      'The official military supply depot at Fort Ashford. Sells government-issued equipment and maintains strict inventory controls. Popular with soldiers and veterans.',
    propertyType: 'shop',
    locationId: 'fort_ashford_parade_ground',
    locationName: 'Fort Ashford',
    size: 'medium' as PropertySize,

    basePrice: 2400,
    weeklyTax: 18,
    weeklyUpkeep: 12,

    squareFeet: 1200,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    shopType: 'general_store',
    inventorySlots: 70,
    displayCases: 5,
    customerCapacity: 20,

    maxWorkers: 3,
    requiredRoles: ['clerk', 'manager'],

    baseCustomersPerDay: 28,
    priceMultiplier: 1.05,

    levelRequirement: 10,
    reputationRequirement: { faction: 'settler', amount: 250 },

    specialFeatures: [
      'Military surplus available',
      'Bulk discounts',
      'Government contracts available',
      'Settler faction discount',
    ],
  },

  whiskey_bend_emporium: {
    id: 'whiskey_bend_emporium',
    name: 'Whiskey Bend Emporium',
    description:
      'A grand three-story emporium catering to wealthy clientele. Crystal chandeliers illuminate imported luxuries. The finest goods this side of St. Louis.',
    propertyType: 'shop',
    locationId: 'whiskey_bend_main_street',
    locationName: 'Whiskey Bend',
    size: 'large' as PropertySize,

    basePrice: 5200,
    weeklyTax: 40,
    weeklyUpkeep: 30,

    squareFeet: 2800,
    floors: 3,
    backRoom: true,
    basement: true,
    livingQuarters: true,

    shopType: 'general_store',
    inventorySlots: 120,
    displayCases: 12,
    customerCapacity: 45,

    maxWorkers: 6,
    requiredRoles: ['clerk', 'guard', 'manager', 'appraiser'],

    baseCustomersPerDay: 50,
    priceMultiplier: 1.4,

    levelRequirement: 18,

    specialFeatures: [
      'Luxury goods specialty',
      'Import contacts',
      'Wealthy clientele',
      'Premium pricing accepted',
      'Upstairs living quarters',
    ],
  },
};

/**
 * SPECIALTY SHOPS (8 properties)
 */
export const SPECIALTY_SHOPS: Record<string, UrbanShop> = {
  gunsmith_workshop: {
    id: 'gunsmith_workshop',
    name: "The Gunsmith's Workshop",
    description:
      "Red Gulch's only gunsmith. Sells firearms, ammunition, and modifications. The smell of gun oil and powder hangs heavy. Intricate work done in the back.",
    propertyType: 'shop',
    locationId: 'red_gulch_commercial_district',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 1800,
    weeklyTax: 15,
    weeklyUpkeep: 10,

    squareFeet: 900,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    shopType: 'gunsmith',
    inventorySlots: 40,
    displayCases: 6,
    customerCapacity: 10,

    maxWorkers: 2,
    requiredRoles: ['specialist'],

    baseCustomersPerDay: 15,
    priceMultiplier: 1.25,

    levelRequirement: 8,
    licenseRequired: 'Firearms dealer license',

    specialFeatures: [
      'Weapon modifications available',
      'Custom orders accepted',
      'Gunsmithing skill bonuses',
      'Ammunition crafting',
    ],
  },

  saddle_and_tack: {
    id: 'saddle_and_tack',
    name: 'Saddle & Tack',
    description:
      'Horse equipment specialist near the Red Gulch stables. Sells saddles, bridles, horseshoes, and riding gear. The leather smell is intoxicating.',
    propertyType: 'shop',
    locationId: 'red_gulch_stables',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 1400,
    weeklyTax: 12,
    weeklyUpkeep: 8,

    squareFeet: 700,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    shopType: 'saddle_tack',
    inventorySlots: 45,
    displayCases: 3,
    customerCapacity: 12,

    maxWorkers: 2,
    requiredRoles: ['clerk', 'specialist'],

    baseCustomersPerDay: 18,
    priceMultiplier: 1.15,

    levelRequirement: 6,

    specialFeatures: [
      'Horse equipment specialty',
      'Custom saddle crafting',
      'Leatherworking bonuses',
      'Stable proximity discount',
    ],
  },

  haberdashery: {
    id: 'haberdashery',
    name: 'The Haberdashery',
    description:
      'Whiskey Bend\'s finest clothing boutique. Tailored suits, fancy dresses, and the latest fashions from back East. Mirrors line the walls.',
    propertyType: 'shop',
    locationId: 'whiskey_bend_fashion_district',
    locationName: 'Whiskey Bend',
    size: 'medium' as PropertySize,

    basePrice: 2200,
    weeklyTax: 20,
    weeklyUpkeep: 12,

    squareFeet: 1100,
    floors: 2,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    shopType: 'clothing',
    inventorySlots: 60,
    displayCases: 8,
    customerCapacity: 20,

    maxWorkers: 3,
    requiredRoles: ['clerk', 'specialist'],

    baseCustomersPerDay: 25,
    priceMultiplier: 1.5,

    levelRequirement: 12,

    specialFeatures: [
      'Fashion items',
      'Custom tailoring',
      'Social status bonuses',
      'Wealthy clientele access',
    ],
  },

  frontier_pharmacy: {
    id: 'frontier_pharmacy',
    name: 'Frontier Pharmacy',
    description:
      'Fort Ashford\'s medical supplier. Bandages, tonics, and patent medicines line the shelves. The proprietor has some actual medical training.',
    propertyType: 'shop',
    locationId: 'fort_ashford_medical_ward',
    locationName: 'Fort Ashford',
    size: 'small' as PropertySize,

    basePrice: 1600,
    weeklyTax: 14,
    weeklyUpkeep: 9,

    squareFeet: 800,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    shopType: 'pharmacy',
    inventorySlots: 50,
    displayCases: 4,
    customerCapacity: 15,

    maxWorkers: 2,
    requiredRoles: ['specialist'],

    baseCustomersPerDay: 20,
    priceMultiplier: 1.3,

    levelRequirement: 10,
    licenseRequired: 'Pharmacy license',

    specialFeatures: [
      'Medical supplies',
      'Healing item bonuses',
      'Doctor NPC interactions',
      'Alchemy crafting available',
    ],
  },

  el_joyero: {
    id: 'el_joyero',
    name: 'El Joyero',
    description:
      'Frontera\'s jewelry shop, dealing in gold, silver, and precious stones. Some items bear questionable provenance. The owner asks no questions.',
    propertyType: 'shop',
    locationId: 'frontera_market_square',
    locationName: 'The Frontera',
    size: 'small' as PropertySize,

    basePrice: 2400,
    weeklyTax: 18,
    weeklyUpkeep: 12,

    squareFeet: 650,
    floors: 1,
    backRoom: true,
    basement: true,
    livingQuarters: false,

    shopType: 'jewelry',
    inventorySlots: 30,
    displayCases: 6,
    customerCapacity: 8,

    maxWorkers: 2,
    requiredRoles: ['appraiser', 'guard'],

    baseCustomersPerDay: 12,
    priceMultiplier: 1.6,

    levelRequirement: 14,

    specialFeatures: [
      'Precious metals & gems',
      'Stolen goods fence',
      'High-value transactions',
      'Appraisal services',
    ],
  },

  curiosity_cabinet: {
    id: 'curiosity_cabinet',
    name: 'The Curiosity Cabinet',
    description:
      'A mysterious shop in Whiskey Bend selling oddities and rarities. Ancient artifacts, exotic trinkets, and items of supernatural rumor. The owner is... unusual.',
    propertyType: 'shop',
    locationId: 'whiskey_bend_old_town',
    locationName: 'Whiskey Bend',
    size: 'small' as PropertySize,

    basePrice: 3200,
    weeklyTax: 24,
    weeklyUpkeep: 15,

    squareFeet: 750,
    floors: 2,
    backRoom: true,
    basement: true,
    livingQuarters: true,

    shopType: 'curiosities',
    inventorySlots: 40,
    displayCases: 8,
    customerCapacity: 10,

    maxWorkers: 1,
    requiredRoles: ['specialist'],

    baseCustomersPerDay: 8,
    priceMultiplier: 2.0,

    levelRequirement: 20,

    specialFeatures: [
      'Rare and unique items',
      'Mystical goods',
      'Quest item sales',
      'Strange NPC encounters',
      'Hidden inventory unlocks',
    ],
  },

  blacksmith_forge: {
    id: 'blacksmith_forge',
    name: "The Blacksmith's Forge",
    description:
      'Frontera\'s working forge, producing everything from horseshoes to iron bars. The heat is oppressive, the noise deafening. Quality metalwork done here.',
    propertyType: 'shop',
    locationId: 'frontera_industrial_quarter',
    locationName: 'The Frontera',
    size: 'medium' as PropertySize,

    basePrice: 2600,
    weeklyTax: 22,
    weeklyUpkeep: 18,

    squareFeet: 1300,
    floors: 1,
    backRoom: false,
    basement: false,
    livingQuarters: false,

    shopType: 'blacksmith',
    inventorySlots: 50,
    displayCases: 2,
    customerCapacity: 15,

    maxWorkers: 3,
    requiredRoles: ['specialist'],

    baseCustomersPerDay: 22,
    priceMultiplier: 1.2,

    levelRequirement: 12,

    specialFeatures: [
      'Metal goods production',
      'Repair services',
      'Blacksmithing skill bonuses',
      'Bulk orders accepted',
    ],
  },

  provisions_dry_goods: {
    id: 'provisions_dry_goods',
    name: 'Provisions & Dry Goods',
    description:
      'Fort Ashford\'s food supplier. Sacks of flour, beans, and preserved meats. Essential supplies for soldiers, travelers, and settlers heading west.',
    propertyType: 'shop',
    locationId: 'fort_ashford_supply_quarter',
    locationName: 'Fort Ashford',
    size: 'medium' as PropertySize,

    basePrice: 1900,
    weeklyTax: 16,
    weeklyUpkeep: 10,

    squareFeet: 1100,
    floors: 1,
    backRoom: true,
    basement: true,
    livingQuarters: false,

    shopType: 'provisions',
    inventorySlots: 70,
    displayCases: 3,
    customerCapacity: 25,

    maxWorkers: 3,
    requiredRoles: ['clerk', 'manager'],

    baseCustomersPerDay: 30,
    priceMultiplier: 1.1,

    levelRequirement: 8,

    specialFeatures: [
      'Food and supplies',
      'Bulk purchase discounts',
      'Caravan supply contracts',
      'Long shelf life goods',
    ],
  },
};

/**
 * All shop properties combined
 */
export const ALL_SHOPS: Record<string, UrbanShop> = {
  ...GENERAL_STORES,
  ...SPECIALTY_SHOPS,
};

/**
 * Get shops by location
 */
export function getShopsByLocation(locationName: string): UrbanShop[] {
  return Object.values(ALL_SHOPS).filter((shop) => shop.locationName === locationName);
}

/**
 * Get shops by type
 */
export function getShopsByType(shopType: ShopCategory): UrbanShop[] {
  return Object.values(ALL_SHOPS).filter((shop) => shop.shopType === shopType);
}

/**
 * Get shop by ID
 */
export function getShopById(shopId: string): UrbanShop | undefined {
  return ALL_SHOPS[shopId];
}

/**
 * Get affordable shops for a player's level and budget
 */
export function getAffordableShops(
  playerLevel: number,
  playerGold: number
): UrbanShop[] {
  return Object.values(ALL_SHOPS).filter(
    (shop) => shop.levelRequirement <= playerLevel && shop.basePrice <= playerGold
  );
}
