/**
 * Seasonal Effects Data
 * Phase 12, Wave 12.2 - Desperados Destiny
 *
 * Defines the effects of each season on gameplay
 */

import {
  Season,
  SeasonalEffects,
  WeatherProbability,
  RoadCondition,
  ItemCategory,
} from '@desperados/shared';
import { WeatherType } from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Seasonal effects for each season
 */
export const SEASONAL_EFFECTS: Record<Season, SeasonalEffects> = {
  [Season.SPRING]: {
    season: Season.SPRING,
    weatherPatterns: [
      { weather: WeatherType.RAIN, probability: 0.4 },
      { weather: WeatherType.THUNDERSTORM, probability: 0.2 },
      { weather: WeatherType.CLOUDY, probability: 0.25 },
      { weather: WeatherType.CLEAR, probability: 0.15 },
    ],

    // Travel - muddy roads slow things down
    travelSpeedModifier: 0.85,
    travelDangerModifier: 0.9,
    roadCondition: 'muddy' as RoadCondition,

    // Economy - planting season
    cropYieldModifier: 1.2,
    animalSpawnModifier: 1.1,
    fishingModifier: 1.15,
    priceModifiers: new Map<ItemCategory, number>([
      ['crops', 1.1],       // Seeds more expensive
      ['livestock', 0.95],  // Baby animals cheaper
      ['furs', 0.8],        // Out of season
      ['fish', 1.0],
      ['wood', 1.0],
      ['ore', 1.0],
      ['medicine', 1.05],   // Spring allergies
      ['clothing', 0.9],    // Lighter clothing cheaper
      ['weapons', 1.0],
      ['ammunition', 1.0],
      ['food', 1.0],
      ['alcohol', 1.0],
      ['luxury', 1.0],
    ]),

    // Activities
    huntingBonus: 0,
    fishingBonus: 15,
    miningPenalty: 0,
    gatheringBonus: 10,

    // Atmosphere
    dayLengthHours: 13,
    temperatureRange: [50, 75],
    specialWeatherChance: 0.25, // Spring storms

    // Gameplay
    energyCostModifier: 1.0,
    healthDrainRate: 0,
    npcActivityModifier: 1.1,
  },

  [Season.SUMMER]: {
    season: Season.SUMMER,
    weatherPatterns: [
      { weather: WeatherType.CLEAR, probability: 0.4 },
      { weather: WeatherType.HEAT_WAVE, probability: 0.3 },
      { weather: WeatherType.DUST_STORM, probability: 0.2 },
      { weather: WeatherType.CLOUDY, probability: 0.1 },
    ],

    // Travel - good roads, but heat danger
    travelSpeedModifier: 1.1,
    travelDangerModifier: 1.2, // Heat stroke, bandits active
    roadCondition: 'dusty' as RoadCondition,

    // Economy - growing season
    cropYieldModifier: 1.0,
    animalSpawnModifier: 1.2,
    fishingModifier: 0.9,
    priceModifiers: new Map<ItemCategory, number>([
      ['crops', 0.9],       // Fresh produce available
      ['livestock', 1.0],
      ['furs', 0.7],        // Very out of season
      ['fish', 0.95],       // Fish less active in heat
      ['wood', 1.0],
      ['ore', 1.0],
      ['medicine', 1.1],    // Heat illness treatments
      ['clothing', 1.0],
      ['weapons', 1.0],
      ['ammunition', 1.0],
      ['food', 0.95],       // Abundant
      ['alcohol', 1.05],    // Everyone wants a cold beer
      ['luxury', 1.0],
    ]),

    // Activities
    huntingBonus: 5,
    fishingBonus: -5,
    miningPenalty: 5,
    gatheringBonus: 0,

    // Atmosphere
    dayLengthHours: 15,
    temperatureRange: [75, 105],
    specialWeatherChance: 0.2, // Dust storms

    // Gameplay
    energyCostModifier: 1.15, // Heat exhaustion
    healthDrainRate: 2, // Heat damage in extreme conditions
    npcActivityModifier: 0.9, // NPCs avoid midday heat
  },

  [Season.FALL]: {
    season: Season.FALL,
    weatherPatterns: [
      { weather: WeatherType.CLEAR, probability: 0.35 },
      { weather: WeatherType.CLOUDY, probability: 0.3 },
      { weather: WeatherType.RAIN, probability: 0.25 },
      { weather: WeatherType.COLD_SNAP, probability: 0.1 },
    ],

    // Travel - excellent conditions
    travelSpeedModifier: 1.15,
    travelDangerModifier: 1.0,
    roadCondition: 'excellent' as RoadCondition,

    // Economy - harvest time
    cropYieldModifier: 1.3,
    animalSpawnModifier: 1.15,
    fishingModifier: 1.1,
    priceModifiers: new Map<ItemCategory, number>([
      ['crops', 0.7],       // Harvest glut
      ['livestock', 1.05],  // Preparing for winter
      ['furs', 1.1],        // Hunting season begins
      ['fish', 1.0],
      ['wood', 1.05],       // Stocking up for winter
      ['ore', 1.0],
      ['medicine', 1.0],
      ['clothing', 1.1],    // Warmer clothing more expensive
      ['weapons', 1.05],    // Hunting season
      ['ammunition', 1.05],
      ['food', 0.8],        // Harvest abundance
      ['alcohol', 1.0],
      ['luxury', 1.0],
    ]),

    // Activities
    huntingBonus: 20,
    fishingBonus: 10,
    miningPenalty: 0,
    gatheringBonus: 15,

    // Atmosphere
    dayLengthHours: 12,
    temperatureRange: [40, 70],
    specialWeatherChance: 0.15,

    // Gameplay
    energyCostModifier: 0.95,
    healthDrainRate: 0,
    npcActivityModifier: 1.15, // Everyone's active during harvest
  },

  [Season.WINTER]: {
    season: Season.WINTER,
    weatherPatterns: [
      { weather: WeatherType.COLD_SNAP, probability: 0.3 },
      { weather: WeatherType.CLOUDY, probability: 0.3 },
      { weather: WeatherType.CLEAR, probability: 0.2 },
      { weather: WeatherType.THUNDERSTORM, probability: 0.2 }, // Winter storms/blizzards
    ],

    // Travel - dangerous and slow
    travelSpeedModifier: 0.7,
    travelDangerModifier: 1.5, // Exposure, wolves
    roadCondition: 'icy' as RoadCondition,

    // Economy - scarcity
    cropYieldModifier: 0.3,
    animalSpawnModifier: 0.6,
    fishingModifier: 0.7,
    priceModifiers: new Map<ItemCategory, number>([
      ['crops', 1.5],       // Scarce
      ['livestock', 1.2],   // Feed is expensive
      ['furs', 1.3],        // Peak season, high demand
      ['fish', 1.1],        // Ice fishing, harder
      ['wood', 1.3],        // Firewood essential
      ['ore', 1.1],         // Mining harder
      ['medicine', 1.2],    // Cold/flu season
      ['clothing', 1.3],    // Warm clothing premium
      ['weapons', 1.0],
      ['ammunition', 1.0],
      ['food', 1.3],        // Preserved food
      ['alcohol', 1.1],     // Warms you up
      ['luxury', 1.2],      // Scarce
    ]),

    // Activities
    huntingBonus: 10,
    fishingBonus: -10,
    miningPenalty: 15,
    gatheringBonus: -20,

    // Atmosphere
    dayLengthHours: 10,
    temperatureRange: [15, 45],
    specialWeatherChance: 0.3, // Blizzards

    // Gameplay
    energyCostModifier: 1.2, // Cold exhaustion
    healthDrainRate: 3, // Exposure damage
    npcActivityModifier: 0.7, // People stay inside
  },
};

/**
 * Get seasonal effects for a given season
 */
export function getSeasonalEffects(season: Season): SeasonalEffects {
  return SEASONAL_EFFECTS[season];
}

/**
 * Get the season for a given month
 */
export function getSeasonForMonth(month: number): Season {
  if (month >= 3 && month <= 5) return Season.SPRING;
  if (month >= 6 && month <= 8) return Season.SUMMER;
  if (month >= 9 && month <= 11) return Season.FALL;
  return Season.WINTER; // 12, 1, 2
}

/**
 * Get weather probabilities for a season
 */
export function getWeatherProbabilities(season: Season): WeatherProbability[] {
  return SEASONAL_EFFECTS[season].weatherPatterns;
}

/**
 * Get a random weather type based on seasonal probabilities
 */
export function getRandomSeasonalWeather(season: Season): WeatherType {
  const probabilities = getWeatherProbabilities(season);
  const roll = SecureRNG.float(0, 1);
  let cumulative = 0;

  for (const { weather, probability } of probabilities) {
    cumulative += probability;
    if (roll <= cumulative) {
      return weather;
    }
  }

  // Fallback to clear weather
  return WeatherType.CLEAR;
}

/**
 * Get price modifier for an item category in a season
 */
export function getSeasonalPriceModifier(
  season: Season,
  category: ItemCategory
): number {
  const effects = SEASONAL_EFFECTS[season];
  return effects.priceModifiers.get(category) || 1.0;
}

/**
 * Calculate combined travel time modifier for season and weather
 */
export function calculateTravelModifier(
  season: Season,
  currentWeather?: WeatherType
): number {
  const seasonalModifier = SEASONAL_EFFECTS[season].travelSpeedModifier;

  // Weather adds additional modification (this would use weather effects)
  // For now, just return seasonal
  return seasonalModifier;
}

/**
 * Get description of current season
 */
export function getSeasonDescription(season: Season): string {
  const descriptions: Record<Season, string> = {
    [Season.SPRING]:
      'Spring brings new life to the frontier. Rain-soaked roads slow travel, but crops are being planted and animals are breeding. The perfect time for fishing and gathering herbs.',
    [Season.SUMMER]:
      'The summer sun beats down mercilessly on the dusty trails. Heat waves shimmer across the desert, and dust storms can appear without warning. Wildlife is abundant, but the heat can be deadly.',
    [Season.FALL]:
      'Autumn is harvest time in the West. The weather is perfect for travel, hunting is at its peak, and farmers reap the rewards of their labor. Make hay while the sun shines.',
    [Season.WINTER]:
      'Winter brings hardship to the frontier. Snow and ice make travel treacherous, game is scarce, and the cold can kill the unprepared. Communities huddle together and wait for spring.',
  };

  return descriptions[season];
}
