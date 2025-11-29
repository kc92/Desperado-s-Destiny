/**
 * Urban Property Index
 *
 * Central export for all urban property definitions
 * Phase 8, Wave 8.2 - Urban Shops & Workshops
 */

// Shop imports
import {
  UrbanShop,
  ShopCategory,
  ShopWorkerRole,
  ALL_SHOPS,
  GENERAL_STORES,
  SPECIALTY_SHOPS,
  getShopsByLocation,
  getShopsByType,
  getShopById,
  getAffordableShops,
} from './shops';

// Saloon imports
import {
  UrbanSaloon,
  SaloonWorkerRole,
  ALL_SALOONS,
  SALOONS,
  TAVERNS,
  getSaloonsByLocation,
  getSaloonsBySize,
  getSaloonById,
  getAffordableSaloons,
  calculateDailySaloonRevenue,
  calculateWeeklySaloonProfit,
} from './saloons';

// Workshop imports
import {
  UrbanWorkshop,
  FacilityType,
  WorkshopProfession,
  WorkshopWorkerRole,
  ALL_WORKSHOPS,
  WORKSHOPS,
  SPECIALTY_WORKSHOPS,
  getWorkshopsByLocation,
  getWorkshopsByProfession,
  getWorkshopById,
  getAffordableWorkshops,
  calculateWorkshopEfficiency,
  getWorkshopsWithFacility,
} from './workshops';

import type { PropertySize } from '@desperados/shared';

/**
 * Re-export all types
 */
export type {
  UrbanShop,
  ShopCategory,
  ShopWorkerRole,
  UrbanSaloon,
  SaloonWorkerRole,
  UrbanWorkshop,
  FacilityType,
  WorkshopProfession,
  WorkshopWorkerRole,
};

/**
 * Re-export all data
 */
export {
  // Shops
  ALL_SHOPS,
  GENERAL_STORES,
  SPECIALTY_SHOPS,
  getShopsByLocation,
  getShopsByType,
  getShopById,
  getAffordableShops,
  // Saloons
  ALL_SALOONS,
  SALOONS,
  TAVERNS,
  getSaloonsByLocation,
  getSaloonsBySize,
  getSaloonById,
  getAffordableSaloons,
  calculateDailySaloonRevenue,
  calculateWeeklySaloonProfit,
  // Workshops
  ALL_WORKSHOPS,
  WORKSHOPS,
  SPECIALTY_WORKSHOPS,
  getWorkshopsByLocation,
  getWorkshopsByProfession,
  getWorkshopById,
  getAffordableWorkshops,
  calculateWorkshopEfficiency,
  getWorkshopsWithFacility,
};

/**
 * Unified urban property type
 */
export type UrbanProperty = UrbanShop | UrbanSaloon | UrbanWorkshop;

/**
 * Combined collection of all urban properties
 */
export const ALL_URBAN_PROPERTIES: Record<string, UrbanProperty> = {
  ...ALL_SHOPS,
  ...ALL_SALOONS,
  ...ALL_WORKSHOPS,
};

/**
 * Property statistics
 */
export const URBAN_PROPERTY_STATS = {
  totalProperties: Object.keys(ALL_URBAN_PROPERTIES).length,
  shops: Object.keys(ALL_SHOPS).length,
  saloons: Object.keys(ALL_SALOONS).length,
  workshops: Object.keys(ALL_WORKSHOPS).length,
  byLocation: {
    'Red Gulch': [
      ...getShopsByLocation('Red Gulch'),
      ...getSaloonsByLocation('Red Gulch'),
      ...getWorkshopsByLocation('Red Gulch'),
    ].length,
    'The Frontera': [
      ...getShopsByLocation('The Frontera'),
      ...getSaloonsByLocation('The Frontera'),
      ...getWorkshopsByLocation('The Frontera'),
    ].length,
    'Fort Ashford': [
      ...getShopsByLocation('Fort Ashford'),
      ...getSaloonsByLocation('Fort Ashford'),
      ...getWorkshopsByLocation('Fort Ashford'),
    ].length,
    'Whiskey Bend': [
      ...getShopsByLocation('Whiskey Bend'),
      ...getSaloonsByLocation('Whiskey Bend'),
      ...getWorkshopsByLocation('Whiskey Bend'),
    ].length,
  },
};

/**
 * Get all urban properties by location
 */
export function getUrbanPropertiesByLocation(locationName: string): UrbanProperty[] {
  return [
    ...getShopsByLocation(locationName),
    ...getSaloonsByLocation(locationName),
    ...getWorkshopsByLocation(locationName),
  ];
}

/**
 * Get urban property by ID (searches all types)
 */
export function getUrbanPropertyById(propertyId: string): UrbanProperty | undefined {
  return (
    getShopById(propertyId) ||
    getSaloonById(propertyId) ||
    getWorkshopById(propertyId)
  );
}

/**
 * Get all properties affordable for player
 */
export function getAffordableUrbanProperties(
  playerLevel: number,
  playerGold: number,
  playerSkills?: Record<string, number>
): UrbanProperty[] {
  return [
    ...getAffordableShops(playerLevel, playerGold),
    ...getAffordableSaloons(playerLevel, playerGold),
    ...getAffordableWorkshops(playerLevel, playerGold, playerSkills),
  ];
}

/**
 * Get properties by size
 */
export function getUrbanPropertiesBySize(size: PropertySize): UrbanProperty[] {
  const shops = Object.values(ALL_SHOPS).filter((shop) => shop.size === size);
  const saloons = getSaloonsBySize(size);
  const workshops = Object.values(ALL_WORKSHOPS).filter((workshop) => workshop.size === size);

  return [...shops, ...saloons, ...workshops];
}

/**
 * Get properties by price range
 */
export function getUrbanPropertiesByPriceRange(
  minPrice: number,
  maxPrice: number
): UrbanProperty[] {
  return Object.values(ALL_URBAN_PROPERTIES).filter(
    (property) => property.basePrice >= minPrice && property.basePrice <= maxPrice
  );
}

/**
 * Get starter properties (low level, low price)
 */
export function getStarterProperties(): UrbanProperty[] {
  return Object.values(ALL_URBAN_PROPERTIES).filter(
    (property) => property.levelRequirement <= 10 && property.basePrice <= 2000
  );
}

/**
 * Get premium properties (high level, high price)
 */
export function getPremiumProperties(): UrbanProperty[] {
  return Object.values(ALL_URBAN_PROPERTIES).filter(
    (property) => property.levelRequirement >= 18 || property.basePrice >= 5000
  );
}

/**
 * Search properties by name or description
 */
export function searchUrbanProperties(query: string): UrbanProperty[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ALL_URBAN_PROPERTIES).filter(
    (property) =>
      property.name.toLowerCase().includes(lowerQuery) ||
      property.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get properties with specific special feature
 */
export function getPropertiesWithFeature(feature: string): UrbanProperty[] {
  const lowerFeature = feature.toLowerCase();
  return Object.values(ALL_URBAN_PROPERTIES).filter((property) =>
    property.specialFeatures.some((f) => f.toLowerCase().includes(lowerFeature))
  );
}

/**
 * Calculate total weekly costs for a property
 */
export function calculateWeeklyCosts(property: UrbanProperty): number {
  return property.weeklyTax + property.weeklyUpkeep + (property.rent || 0);
}

/**
 * Calculate ROI estimate (weeks to break even)
 */
export function estimateROI(property: UrbanProperty, estimatedWeeklyRevenue: number): number {
  const weeklyCosts = calculateWeeklyCosts(property);
  const weeklyProfit = estimatedWeeklyRevenue - weeklyCosts;

  if (weeklyProfit <= 0) return Infinity;

  return Math.ceil(property.basePrice / weeklyProfit);
}

/**
 * Get property recommendation based on player profile
 */
export function getRecommendedProperties(
  playerLevel: number,
  playerGold: number,
  playerSkills: Record<string, number>,
  preference: 'income' | 'crafting' | 'social'
): UrbanProperty[] {
  const affordable = getAffordableUrbanProperties(playerLevel, playerGold, playerSkills);

  if (preference === 'income') {
    // Prioritize saloons for income
    return affordable.filter((p) => p.propertyType === 'saloon');
  } else if (preference === 'crafting') {
    // Prioritize workshops
    return affordable.filter((p) => p.propertyType === 'workshop');
  } else {
    // Social - saloons and shops
    return affordable.filter((p) => p.propertyType === 'saloon' || p.propertyType === 'shop');
  }
}

/**
 * Validate property requirements for player
 */
export function canPlayerPurchase(
  property: UrbanProperty,
  player: {
    level: number;
    gold: number;
    reputation?: Record<string, number>;
    skills?: Record<string, number>;
  }
): { canPurchase: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Level check
  if (player.level < property.levelRequirement) {
    reasons.push(`Requires level ${property.levelRequirement}`);
  }

  // Gold check
  if (player.gold < property.basePrice) {
    reasons.push(`Requires ${property.basePrice} gold (you have ${player.gold})`);
  }

  // Reputation check (shops and saloons only)
  if ('reputationRequirement' in property && property.reputationRequirement) {
    const { faction, amount } = property.reputationRequirement;
    const playerRep = player.reputation?.[faction] || 0;
    if (playerRep < amount) {
      reasons.push(`Requires ${amount} ${faction} reputation (you have ${playerRep})`);
    }
  }

  // Skill check (for workshops)
  if (property.propertyType === 'workshop') {
    const workshop = property as UrbanWorkshop;
    if (workshop.professionSkillRequired) {
      const { skill, level } = workshop.professionSkillRequired;
      const playerSkillLevel = player.skills?.[skill] || 0;
      if (playerSkillLevel < level) {
        reasons.push(`Requires ${skill} level ${level} (you have ${playerSkillLevel})`);
      }
    }
  }

  return {
    canPurchase: reasons.length === 0,
    reasons,
  };
}

/**
 * Export summary for logging
 */
console.log('Urban Properties Loaded:');
console.log(`- Total Properties: ${URBAN_PROPERTY_STATS.totalProperties}`);
console.log(`- Shops: ${URBAN_PROPERTY_STATS.shops}`);
console.log(`- Saloons: ${URBAN_PROPERTY_STATS.saloons}`);
console.log(`- Workshops: ${URBAN_PROPERTY_STATS.workshops}`);
console.log('Properties by Location:');
Object.entries(URBAN_PROPERTY_STATS.byLocation).forEach(([location, count]) => {
  console.log(`  - ${location}: ${count}`);
});
