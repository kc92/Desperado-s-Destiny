/**
 * Workshop Property Definitions
 *
 * Crafting facilities and production workshops in the four towns
 * Phase 8, Wave 8.2 - Urban Shops & Workshops
 */

import type { PropertySize } from '@desperados/shared';

/**
 * Workshop facility types
 */
export type FacilityType =
  | 'forge'
  | 'anvil'
  | 'workbench'
  | 'tanning_rack'
  | 'alchemy_station'
  | 'sewing_station'
  | 'gunsmithing_bench'
  | 'grinding_wheel'
  | 'kiln';

/**
 * Workshop profession types
 */
export type WorkshopProfession =
  | 'blacksmithing'
  | 'leatherworking'
  | 'alchemy'
  | 'tailoring'
  | 'gunsmithing'
  | 'general_crafting';

/**
 * Workshop worker roles
 */
export type WorkshopWorkerRole = 'apprentice' | 'journeyman' | 'master' | 'laborer' | 'manager';

/**
 * Urban workshop property definition
 */
export interface UrbanWorkshop {
  id: string;
  name: string;
  description: string;
  propertyType: 'workshop';
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

  // Workshop-specific features
  profession: WorkshopProfession;
  facilities: FacilityType[];
  facilityTier: number; // 1-5, affects crafting quality
  craftingSlots: number; // Simultaneous crafting operations
  storageCapacity: number;

  // Business attributes
  maxWorkers: number;
  requiredRoles: WorkshopWorkerRole[];

  // Production
  productionSpeedBonus: number; // Percentage
  qualityBonus: number; // Percentage
  commissionSlotsPerDay: number; // NPC/player orders

  // Requirements
  levelRequirement: number;
  professionSkillRequired?: { skill: string; level: number };
  licenseRequired?: string;

  // Special features
  specialFeatures: string[];
  restrictions?: string[];
}

/**
 * WORKSHOPS (6 properties)
 */
export const WORKSHOPS: Record<string, UrbanWorkshop> = {
  pioneer_smithy: {
    id: 'pioneer_smithy',
    name: 'Pioneer Smithy',
    description:
      'Red Gulch\'s blacksmith workshop. The forge burns hot, the anvil rings with hammer strikes. Iron bars, nails, and horseshoes are the bread and butter here.',
    propertyType: 'workshop',
    locationId: 'red_gulch_industrial_quarter',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 2200,
    weeklyTax: 20,
    weeklyUpkeep: 15,

    squareFeet: 1000,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    profession: 'blacksmithing',
    facilities: ['forge', 'anvil', 'grinding_wheel'],
    facilityTier: 2,
    craftingSlots: 2,
    storageCapacity: 150,

    maxWorkers: 3,
    requiredRoles: ['journeyman', 'apprentice'],

    productionSpeedBonus: 10,
    qualityBonus: 5,
    commissionSlotsPerDay: 3,

    levelRequirement: 10,
    professionSkillRequired: { skill: 'blacksmithing', level: 15 },

    specialFeatures: [
      'Basic metalworking',
      'Tool crafting',
      'Weapon repairs',
      'Custom commissions',
      'Iron bar production',
    ],
  },

  desert_tannery: {
    id: 'desert_tannery',
    name: 'Desert Tannery',
    description:
      'A leatherworking workshop in Red Gulch. The smell is... distinctive. Hides hang drying in the desert sun. Quality leather goods crafted here.',
    propertyType: 'workshop',
    locationId: 'red_gulch_craftsman_quarter',
    locationName: 'Red Gulch',
    size: 'small' as PropertySize,

    basePrice: 1600,
    weeklyTax: 16,
    weeklyUpkeep: 12,

    squareFeet: 900,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    profession: 'leatherworking',
    facilities: ['tanning_rack', 'workbench', 'sewing_station'],
    facilityTier: 2,
    craftingSlots: 2,
    storageCapacity: 120,

    maxWorkers: 2,
    requiredRoles: ['journeyman', 'laborer'],

    productionSpeedBonus: 15,
    qualityBonus: 10,
    commissionSlotsPerDay: 4,

    levelRequirement: 8,
    professionSkillRequired: { skill: 'leatherworking', level: 10 },

    specialFeatures: [
      'Leather armor crafting',
      'Saddle production',
      'Belt and holster making',
      'Hide processing',
      'Custom leather goods',
    ],
  },

  wus_apothecary: {
    id: 'wus_apothecary',
    name: "Wu's Apothecary Workshop",
    description:
      'A mysterious alchemy workshop in Whiskey Bend, run by the enigmatic Mr. Wu. Dried herbs hang from rafters, strange liquids bubble in glass vessels. Powerful tonics crafted here.',
    propertyType: 'workshop',
    locationId: 'whiskey_bend_chinatown',
    locationName: 'Whiskey Bend',
    size: 'medium' as PropertySize,

    basePrice: 3400,
    weeklyTax: 28,
    weeklyUpkeep: 20,

    squareFeet: 1400,
    floors: 2,
    backRoom: true,
    basement: true,
    livingQuarters: true,

    profession: 'alchemy',
    facilities: ['alchemy_station', 'grinding_wheel', 'workbench'],
    facilityTier: 4,
    craftingSlots: 4,
    storageCapacity: 200,

    maxWorkers: 3,
    requiredRoles: ['master', 'apprentice'],

    productionSpeedBonus: 20,
    qualityBonus: 25,
    commissionSlotsPerDay: 5,

    levelRequirement: 16,
    professionSkillRequired: { skill: 'alchemy', level: 25 },

    specialFeatures: [
      'Potion crafting',
      'Medicine production',
      'Poison creation',
      'Rare ingredient access',
      'Chinese medicine secrets',
      'Masterwork potion chance',
    ],
  },

  tailors_needle: {
    id: 'tailors_needle',
    name: "The Tailor's Needle",
    description:
      'An upscale tailoring workshop in Whiskey Bend. Fine fabrics fill the shelves, mannequins model the latest fashions. Skilled seamstresses create wearable art.',
    propertyType: 'workshop',
    locationId: 'whiskey_bend_fashion_district',
    locationName: 'Whiskey Bend',
    size: 'medium' as PropertySize,

    basePrice: 2800,
    weeklyTax: 24,
    weeklyUpkeep: 18,

    squareFeet: 1300,
    floors: 2,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    profession: 'tailoring',
    facilities: ['sewing_station', 'workbench'],
    facilityTier: 3,
    craftingSlots: 3,
    storageCapacity: 180,

    maxWorkers: 4,
    requiredRoles: ['journeyman', 'apprentice'],

    productionSpeedBonus: 15,
    qualityBonus: 20,
    commissionSlotsPerDay: 6,

    levelRequirement: 12,
    professionSkillRequired: { skill: 'tailoring', level: 15 },

    specialFeatures: [
      'Fine clothing crafting',
      'Armor padding',
      'Social status items',
      'Custom tailoring',
      'Fashion bonuses',
      'Wealthy clientele',
    ],
  },

  ammunition_works: {
    id: 'ammunition_works',
    name: 'Ammunition Works',
    description:
      'Fort Ashford\'s gunsmithing workshop. Strictly regulated facility producing ammunition and firearm modifications. Military contracts available.',
    propertyType: 'workshop',
    locationId: 'fort_ashford_armory_district',
    locationName: 'Fort Ashford',
    size: 'medium' as PropertySize,

    basePrice: 4200,
    weeklyTax: 32,
    weeklyUpkeep: 25,

    squareFeet: 1600,
    floors: 1,
    backRoom: true,
    basement: true,
    livingQuarters: false,

    profession: 'gunsmithing',
    facilities: ['gunsmithing_bench', 'forge', 'workbench', 'grinding_wheel'],
    facilityTier: 3,
    craftingSlots: 3,
    storageCapacity: 160,

    maxWorkers: 4,
    requiredRoles: ['master', 'journeyman', 'laborer'],

    productionSpeedBonus: 10,
    qualityBonus: 15,
    commissionSlotsPerDay: 4,

    levelRequirement: 14,
    professionSkillRequired: { skill: 'gunsmithing', level: 20 },
    licenseRequired: 'Federal firearms manufacturing license',

    specialFeatures: [
      'Ammunition production',
      'Weapon modifications',
      'Firearm repairs',
      'Military contracts',
      'Settler faction benefits',
      'Government subsidies',
    ],
    restrictions: ['Strict inventory audits', 'No illegal modifications'],
  },

  shadow_forge: {
    id: 'shadow_forge',
    name: 'The Shadow Forge',
    description:
      'A hidden workshop in Frontera\'s back alleys. No sign marks its door. Inside, illegal weapons and forbidden modifications are crafted. The owner asks no questions.',
    propertyType: 'workshop',
    locationId: 'frontera_shadow_quarter',
    locationName: 'The Frontera',
    size: 'small' as PropertySize,

    basePrice: 3800,
    weeklyTax: 30,
    weeklyUpkeep: 22,

    squareFeet: 800,
    floors: 1,
    backRoom: false,
    basement: true,
    livingQuarters: true,

    profession: 'gunsmithing',
    facilities: ['gunsmithing_bench', 'forge', 'grinding_wheel'],
    facilityTier: 4,
    craftingSlots: 2,
    storageCapacity: 100,

    maxWorkers: 2,
    requiredRoles: ['master'],

    productionSpeedBonus: 5,
    qualityBonus: 30,
    commissionSlotsPerDay: 2,

    levelRequirement: 18,
    professionSkillRequired: { skill: 'gunsmithing', level: 30 },

    specialFeatures: [
      'Illegal modifications',
      'Untraceable weapons',
      'Custom deadly ammunition',
      'Black market access',
      'No records kept',
      'Criminal clientele',
      'Masterwork illegal items',
    ],
    restrictions: [
      'Requires Frontera criminal reputation',
      'Risk of law enforcement raids',
      'High danger level',
    ],
  },
};

/**
 * ADDITIONAL WORKSHOPS (2 more for variety)
 */
export const SPECIALTY_WORKSHOPS: Record<string, UrbanWorkshop> = {
  frontier_carpentry: {
    id: 'frontier_carpentry',
    name: 'Frontier Carpentry',
    description:
      'A general carpentry workshop in Fort Ashford. Furniture, wagon repairs, and building supplies. Honest work for honest pay.',
    propertyType: 'workshop',
    locationId: 'fort_ashford_construction_yard',
    locationName: 'Fort Ashford',
    size: 'medium' as PropertySize,

    basePrice: 2400,
    weeklyTax: 22,
    weeklyUpkeep: 16,

    squareFeet: 1500,
    floors: 1,
    backRoom: true,
    basement: false,
    livingQuarters: false,

    profession: 'general_crafting',
    facilities: ['workbench', 'grinding_wheel'],
    facilityTier: 2,
    craftingSlots: 3,
    storageCapacity: 200,

    maxWorkers: 4,
    requiredRoles: ['journeyman', 'laborer'],

    productionSpeedBonus: 15,
    qualityBonus: 10,
    commissionSlotsPerDay: 5,

    levelRequirement: 10,

    specialFeatures: [
      'Furniture crafting',
      'Wagon repairs',
      'Building materials',
      'Bulk orders',
      'Construction contracts',
    ],
  },

  el_taller_maestro: {
    id: 'el_taller_maestro',
    name: 'El Taller del Maestro',
    description:
      'A master blacksmith workshop in the Frontera. The maestro here is legendary for creating weapons of exceptional quality. Only the skilled may apprentice.',
    propertyType: 'workshop',
    locationId: 'frontera_artisan_quarter',
    locationName: 'The Frontera',
    size: 'medium' as PropertySize,

    basePrice: 4600,
    weeklyTax: 35,
    weeklyUpkeep: 28,

    squareFeet: 1700,
    floors: 2,
    backRoom: true,
    basement: true,
    livingQuarters: true,

    profession: 'blacksmithing',
    facilities: ['forge', 'anvil', 'grinding_wheel', 'workbench'],
    facilityTier: 5,
    craftingSlots: 3,
    storageCapacity: 180,

    maxWorkers: 3,
    requiredRoles: ['master', 'journeyman'],

    productionSpeedBonus: 5,
    qualityBonus: 40,
    commissionSlotsPerDay: 3,

    levelRequirement: 20,
    professionSkillRequired: { skill: 'blacksmithing', level: 35 },

    specialFeatures: [
      'Masterwork weapons',
      'Legendary quality chance',
      'Custom blade forging',
      'Master training available',
      'Frontera artisan reputation',
      'Collector clientele',
    ],
  },
};

/**
 * All workshop properties combined
 */
export const ALL_WORKSHOPS: Record<string, UrbanWorkshop> = {
  ...WORKSHOPS,
  ...SPECIALTY_WORKSHOPS,
};

/**
 * Get workshops by location
 */
export function getWorkshopsByLocation(locationName: string): UrbanWorkshop[] {
  return Object.values(ALL_WORKSHOPS).filter((workshop) => workshop.locationName === locationName);
}

/**
 * Get workshops by profession
 */
export function getWorkshopsByProfession(profession: WorkshopProfession): UrbanWorkshop[] {
  return Object.values(ALL_WORKSHOPS).filter((workshop) => workshop.profession === profession);
}

/**
 * Get workshop by ID
 */
export function getWorkshopById(workshopId: string): UrbanWorkshop | undefined {
  return ALL_WORKSHOPS[workshopId];
}

/**
 * Get affordable workshops for a player's level and budget
 */
export function getAffordableWorkshops(
  playerLevel: number,
  playerGold: number,
  playerSkills?: Record<string, number>
): UrbanWorkshop[] {
  return Object.values(ALL_WORKSHOPS).filter((workshop) => {
    // Check level requirement
    if (workshop.levelRequirement > playerLevel) return false;

    // Check price
    if (workshop.basePrice > playerGold) return false;

    // Check skill requirement if player skills provided
    if (workshop.professionSkillRequired && playerSkills) {
      const requiredSkill = workshop.professionSkillRequired;
      const playerSkillLevel = playerSkills[requiredSkill.skill] || 0;
      if (playerSkillLevel < requiredSkill.level) return false;
    }

    return true;
  });
}

/**
 * Calculate workshop production efficiency
 */
export function calculateWorkshopEfficiency(workshop: UrbanWorkshop): number {
  const tierBonus = workshop.facilityTier * 10;
  const speedBonus = workshop.productionSpeedBonus;
  const qualityBonus = workshop.qualityBonus;

  return (tierBonus + speedBonus + qualityBonus) / 3;
}

/**
 * Get workshops with specific facilities
 */
export function getWorkshopsWithFacility(facility: FacilityType): UrbanWorkshop[] {
  return Object.values(ALL_WORKSHOPS).filter((workshop) =>
    workshop.facilities.includes(facility)
  );
}
