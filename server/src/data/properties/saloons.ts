/**
 * Saloon Property Definitions
 *
 * Entertainment venues, gambling halls, and drinking establishments
 * Phase 8, Wave 8.2 - Urban Shops & Workshops
 */

import type { PropertySize } from '@desperados/shared';

/**
 * Saloon worker roles
 */
export type SaloonWorkerRole = 'bartender' | 'dealer' | 'bouncer' | 'entertainer' | 'cook' | 'manager';

/**
 * Urban saloon property definition
 */
export interface UrbanSaloon {
  id: string;
  name: string;
  description: string;
  propertyType: 'saloon';
  locationId: string;
  locationName: string;
  size: PropertySize;

  // Pricing
  basePrice: number;
  weeklyTax: number;
  weeklyUpkeep: number;
  rent?: number;

  // Physical attributes
  squareFeet: number;
  floors: number;
  backRoom: boolean;
  basement: boolean;
  livingQuarters: boolean;

  // Saloon-specific features
  gamblingTables: number;
  entertainmentStage: boolean;
  rooms: number; // Rental rooms upstairs
  barLength: number; // In feet
  privateBooths: number;

  // Business attributes
  customerCapacity: number;
  maxWorkers: number;
  requiredRoles: SaloonWorkerRole[];

  // Income streams
  drinkSalesPerDay: number;
  gamblingRevenuePerDay: number;
  roomRentalPerNight: number;
  entertainmentBonus: number;

  // Requirements
  levelRequirement: number;
  reputationRequirement?: { faction: string; amount: number };
  licenseRequired: string;

  // Special features
  specialFeatures: string[];
  restrictions?: string[];
  atmosphere: string;
}

/**
 * SALOONS & ENTERTAINMENT VENUES (4 properties)
 */
export const SALOONS: Record<string, UrbanSaloon> = {
  lucky_strike_saloon: {
    id: 'lucky_strike_saloon',
    name: 'The Lucky Strike Saloon',
    description:
      'Red Gulch\'s main watering hole. A modest saloon with a well-worn bar, a few gaming tables, and the occasional traveling musician. The whiskey is cheap, the company cheaper.',
    propertyType: 'saloon',
    locationId: 'red_gulch_saloon_row',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 2800,
    weeklyTax: 25,
    weeklyUpkeep: 20,

    squareFeet: 1200,
    floors: 2,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    gamblingTables: 3,
    entertainmentStage: false,
    rooms: 4,
    barLength: 20,
    privateBooths: 2,

    customerCapacity: 30,
    maxWorkers: 4,
    requiredRoles: ['bartender', 'bouncer'],

    drinkSalesPerDay: 150,
    gamblingRevenuePerDay: 80,
    roomRentalPerNight: 5,
    entertainmentBonus: 0,

    levelRequirement: 10,
    licenseRequired: 'Liquor license',

    specialFeatures: [
      'Local hangout',
      'Poker games',
      'Town gossip hub',
      'Room rentals available',
      'Occasional brawls',
    ],
    atmosphere: 'Rough and ready frontier saloon',
  },

  casa_de_placer: {
    id: 'casa_de_placer',
    name: 'Casa de Placer',
    description:
      'Frontera\'s infamous gambling hall. High stakes games run day and night. Beautiful dealers, strong drinks, and dangerous men. The house always wins... eventually.',
    propertyType: 'saloon',
    locationId: 'frontera_entertainment_district',
    locationName: 'The Frontera',
    size: 'large' as PropertySize,

    basePrice: 5500,
    weeklyTax: 35,
    weeklyUpkeep: 30,

    squareFeet: 2400,
    floors: 2,
    backRoom: true,
    basement: true,
    livingQuarters: false,

    gamblingTables: 10,
    entertainmentStage: true,
    rooms: 8,
    barLength: 40,
    privateBooths: 6,

    customerCapacity: 70,
    maxWorkers: 8,
    requiredRoles: ['bartender', 'dealer', 'bouncer', 'entertainer'],

    drinkSalesPerDay: 300,
    gamblingRevenuePerDay: 450,
    roomRentalPerNight: 15,
    entertainmentBonus: 100,

    levelRequirement: 16,
    reputationRequirement: { faction: 'frontera', amount: 200 },
    licenseRequired: 'Gambling house license',

    specialFeatures: [
      'High stakes gambling',
      'Multiple game types',
      'Private rooms for VIPs',
      'Frontera power broker hangout',
      'Information trading',
      'Dangerous clientele',
    ],
    restrictions: ['Requires Frontera faction standing'],
    atmosphere: 'Opulent and dangerous',
  },

  golden_spur: {
    id: 'golden_spur',
    name: 'The Golden Spur',
    description:
      'Whiskey Bend\'s premier saloon and entertainment palace. Crystal chandeliers, mahogany bar, and nightly performances. The wealthy come here to see and be seen.',
    propertyType: 'saloon',
    locationId: 'whiskey_bend_entertainment_quarter',
    locationName: 'Whiskey Bend',
    size: 'huge' as PropertySize,

    basePrice: 8200,
    weeklyTax: 60,
    weeklyUpkeep: 45,

    squareFeet: 4500,
    floors: 3,
    backRoom: true,
    basement: true,
    livingQuarters: true,

    gamblingTables: 12,
    entertainmentStage: true,
    rooms: 15,
    barLength: 60,
    privateBooths: 10,

    customerCapacity: 100,
    maxWorkers: 12,
    requiredRoles: ['bartender', 'dealer', 'bouncer', 'entertainer', 'cook', 'manager'],

    drinkSalesPerDay: 500,
    gamblingRevenuePerDay: 600,
    roomRentalPerNight: 25,
    entertainmentBonus: 250,

    levelRequirement: 22,
    licenseRequired: 'Premium liquor & gambling license',

    specialFeatures: [
      'Luxury venue',
      'Famous entertainers',
      'High-class clientele',
      'Premium drinks',
      'Fine dining',
      'Private suites',
      'Social status benefits',
      'Wealthy patron access',
    ],
    atmosphere: 'Elegant and sophisticated',
  },

  officers_club: {
    id: 'officers_club',
    name: "The Officer's Club",
    description:
      'Fort Ashford\'s military officers\' club. Strictly regulated, respectable establishment. Officers unwind here after duty. Civilians welcome if properly behaved.',
    propertyType: 'saloon',
    locationId: 'fort_ashford_officers_quarter',
    locationName: 'Fort Ashford',
    size: 'medium' as PropertySize,

    basePrice: 3400,
    weeklyTax: 28,
    weeklyUpkeep: 22,

    squareFeet: 1800,
    floors: 2,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    gamblingTables: 4,
    entertainmentStage: false,
    rooms: 6,
    barLength: 30,
    privateBooths: 4,

    customerCapacity: 45,
    maxWorkers: 5,
    requiredRoles: ['bartender', 'manager'],

    drinkSalesPerDay: 200,
    gamblingRevenuePerDay: 100,
    roomRentalPerNight: 10,
    entertainmentBonus: 0,

    levelRequirement: 14,
    reputationRequirement: { faction: 'settler', amount: 300 },
    licenseRequired: 'Military establishment license',

    specialFeatures: [
      'Respectable clientele',
      'Military contracts',
      'Officer networking',
      'Settler faction benefits',
      'Civilized gambling only',
      'Information on military movements',
    ],
    restrictions: ['Military dress code enforced', 'No outlaws'],
    atmosphere: 'Dignified military club',
  },
};

/**
 * ADDITIONAL SALOONS - Smaller venues (2 more for variety)
 */
export const TAVERNS: Record<string, UrbanSaloon> = {
  dusty_trail_tavern: {
    id: 'dusty_trail_tavern',
    name: 'The Dusty Trail Tavern',
    description:
      'A working-class tavern in Red Gulch. Miners and ranch hands drink here after long shifts. Strong beer, simple food, honest folk.',
    propertyType: 'saloon',
    locationId: 'red_gulch_workers_quarter',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 1800,
    weeklyTax: 18,
    weeklyUpkeep: 14,

    squareFeet: 900,
    floors: 1,
    backRoom: false,
    basement: true,
    livingQuarters: false,

    gamblingTables: 1,
    entertainmentStage: false,
    rooms: 2,
    barLength: 15,
    privateBooths: 0,

    customerCapacity: 25,
    maxWorkers: 2,
    requiredRoles: ['bartender'],

    drinkSalesPerDay: 100,
    gamblingRevenuePerDay: 20,
    roomRentalPerNight: 3,
    entertainmentBonus: 0,

    levelRequirement: 8,
    licenseRequired: 'Tavern license',

    specialFeatures: [
      'Working-class hangout',
      'Cheap drinks',
      'Miner gossip',
      'Labor contracts',
      'Simple fare',
    ],
    atmosphere: 'Down-to-earth working tavern',
  },

  cantina_del_sol: {
    id: 'cantina_del_sol',
    name: 'Cantina del Sol',
    description:
      'A lively cantina in the Frontera. Music, dancing, and tequila flow freely. Popular with locals and those embracing the border culture.',
    propertyType: 'saloon',
    locationId: 'frontera_pueblo_quarter',
    locationName: 'The Frontera',
    size: 'medium' as PropertySize,

    basePrice: 3200,
    weeklyTax: 26,
    weeklyUpkeep: 20,

    squareFeet: 1600,
    floors: 2,
    backRoom: true,
    basement: false,
    livingQuarters: true,

    gamblingTables: 5,
    entertainmentStage: true,
    rooms: 6,
    barLength: 35,
    privateBooths: 3,

    customerCapacity: 50,
    maxWorkers: 6,
    requiredRoles: ['bartender', 'entertainer', 'bouncer'],

    drinkSalesPerDay: 220,
    gamblingRevenuePerDay: 180,
    roomRentalPerNight: 8,
    entertainmentBonus: 80,

    levelRequirement: 12,
    licenseRequired: 'Cantina license',

    specialFeatures: [
      'Live music nightly',
      'Traditional dancing',
      'Tequila specialty',
      'Cultural events',
      'Frontera community hub',
      'Spicy food available',
    ],
    atmosphere: 'Vibrant and musical',
  },
};

/**
 * All saloon properties combined
 */
export const ALL_SALOONS: Record<string, UrbanSaloon> = {
  ...SALOONS,
  ...TAVERNS,
};

/**
 * Get saloons by location
 */
export function getSaloonsByLocation(locationName: string): UrbanSaloon[] {
  return Object.values(ALL_SALOONS).filter((saloon) => saloon.locationName === locationName);
}

/**
 * Get saloons by size
 */
export function getSaloonsBySize(size: PropertySize): UrbanSaloon[] {
  return Object.values(ALL_SALOONS).filter((saloon) => saloon.size === size);
}

/**
 * Get saloon by ID
 */
export function getSaloonById(saloonId: string): UrbanSaloon | undefined {
  return ALL_SALOONS[saloonId];
}

/**
 * Get affordable saloons for a player's level and budget
 */
export function getAffordableSaloons(
  playerLevel: number,
  playerGold: number
): UrbanSaloon[] {
  return Object.values(ALL_SALOONS).filter(
    (saloon) => saloon.levelRequirement <= playerLevel && saloon.basePrice <= playerGold
  );
}

/**
 * Calculate daily revenue potential for a saloon
 */
export function calculateDailySaloonRevenue(saloon: UrbanSaloon): number {
  return (
    saloon.drinkSalesPerDay +
    saloon.gamblingRevenuePerDay +
    saloon.roomRentalPerNight * saloon.rooms * 0.7 + // 70% occupancy
    saloon.entertainmentBonus
  );
}

/**
 * Calculate weekly profit (revenue - costs)
 */
export function calculateWeeklySaloonProfit(saloon: UrbanSaloon): number {
  const dailyRevenue = calculateDailySaloonRevenue(saloon);
  const weeklyRevenue = dailyRevenue * 7;
  const weeklyCosts = saloon.weeklyTax + saloon.weeklyUpkeep;

  return weeklyRevenue - weeklyCosts;
}
