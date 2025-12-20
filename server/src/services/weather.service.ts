/**
 * Weather Service
 *
 * Manages regional weather systems, supernatural weather, and weather effects on gameplay
 */

import {
  WorldState,
  IWorldState,
  WeatherType,
  WeatherEffects,
  WEATHER_EFFECTS,
  RegionalWeather
} from '../models/WorldState.model';
import { Location } from '../models/Location.model';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

// Region types from location types
export type RegionType =
  | 'town'
  | 'dusty_flats'
  | 'devils_canyon'
  | 'sangre_mountains'
  | 'border_territories'
  | 'ghost_towns'
  | 'sacred_lands'
  | 'outlaw_territory'
  | 'frontier';

/**
 * Regional weather patterns - determines which weather types are likely in each region
 */
const REGIONAL_WEATHER_PATTERNS: Record<RegionType, Record<WeatherType, number>> = {
  // Desert regions - sandstorms and heat waves common
  dusty_flats: {
    [WeatherType.CLEAR]: 35,
    [WeatherType.CLOUDY]: 10,
    [WeatherType.SANDSTORM]: 25,
    [WeatherType.DUST_STORM]: 15,
    [WeatherType.HEAT_WAVE]: 10,
    [WeatherType.RAIN]: 3,
    [WeatherType.FOG]: 2,
    [WeatherType.COLD_SNAP]: 0,
    [WeatherType.THUNDERSTORM]: 0,
    [WeatherType.SUPERNATURAL_MIST]: 0,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Mountains - cold weather, storms, supernatural lightning
  sangre_mountains: {
    [WeatherType.CLEAR]: 25,
    [WeatherType.CLOUDY]: 20,
    [WeatherType.SANDSTORM]: 0,
    [WeatherType.DUST_STORM]: 5,
    [WeatherType.HEAT_WAVE]: 2,
    [WeatherType.RAIN]: 15,
    [WeatherType.FOG]: 10,
    [WeatherType.COLD_SNAP]: 15,
    [WeatherType.THUNDERSTORM]: 5,
    [WeatherType.SUPERNATURAL_MIST]: 1,
    [WeatherType.THUNDERBIRD_STORM]: 2,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Sacred lands - supernatural weather more common
  sacred_lands: {
    [WeatherType.CLEAR]: 20,
    [WeatherType.CLOUDY]: 15,
    [WeatherType.SANDSTORM]: 5,
    [WeatherType.DUST_STORM]: 5,
    [WeatherType.HEAT_WAVE]: 5,
    [WeatherType.RAIN]: 10,
    [WeatherType.FOG]: 15,
    [WeatherType.COLD_SNAP]: 5,
    [WeatherType.THUNDERSTORM]: 5,
    [WeatherType.SUPERNATURAL_MIST]: 10,
    [WeatherType.THUNDERBIRD_STORM]: 5,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Devil's Canyon / The Scar - extreme and supernatural weather
  devils_canyon: {
    [WeatherType.CLEAR]: 10,
    [WeatherType.CLOUDY]: 10,
    [WeatherType.SANDSTORM]: 10,
    [WeatherType.DUST_STORM]: 10,
    [WeatherType.HEAT_WAVE]: 10,
    [WeatherType.RAIN]: 5,
    [WeatherType.FOG]: 10,
    [WeatherType.COLD_SNAP]: 5,
    [WeatherType.THUNDERSTORM]: 10,
    [WeatherType.SUPERNATURAL_MIST]: 15,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 5,
  },

  // Border territories - varied weather
  border_territories: {
    [WeatherType.CLEAR]: 30,
    [WeatherType.CLOUDY]: 20,
    [WeatherType.SANDSTORM]: 10,
    [WeatherType.DUST_STORM]: 10,
    [WeatherType.HEAT_WAVE]: 8,
    [WeatherType.RAIN]: 10,
    [WeatherType.FOG]: 7,
    [WeatherType.COLD_SNAP]: 3,
    [WeatherType.THUNDERSTORM]: 2,
    [WeatherType.SUPERNATURAL_MIST]: 0,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Ghost towns - fog and dust common
  ghost_towns: {
    [WeatherType.CLEAR]: 25,
    [WeatherType.CLOUDY]: 15,
    [WeatherType.SANDSTORM]: 5,
    [WeatherType.DUST_STORM]: 20,
    [WeatherType.HEAT_WAVE]: 10,
    [WeatherType.RAIN]: 5,
    [WeatherType.FOG]: 15,
    [WeatherType.COLD_SNAP]: 3,
    [WeatherType.THUNDERSTORM]: 1,
    [WeatherType.SUPERNATURAL_MIST]: 1,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Outlaw territory - harsh weather
  outlaw_territory: {
    [WeatherType.CLEAR]: 30,
    [WeatherType.CLOUDY]: 15,
    [WeatherType.SANDSTORM]: 15,
    [WeatherType.DUST_STORM]: 15,
    [WeatherType.HEAT_WAVE]: 10,
    [WeatherType.RAIN]: 8,
    [WeatherType.FOG]: 5,
    [WeatherType.COLD_SNAP]: 2,
    [WeatherType.THUNDERSTORM]: 0,
    [WeatherType.SUPERNATURAL_MIST]: 0,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Frontier - standard weather
  frontier: {
    [WeatherType.CLEAR]: 40,
    [WeatherType.CLOUDY]: 20,
    [WeatherType.SANDSTORM]: 5,
    [WeatherType.DUST_STORM]: 10,
    [WeatherType.HEAT_WAVE]: 8,
    [WeatherType.RAIN]: 10,
    [WeatherType.FOG]: 5,
    [WeatherType.COLD_SNAP]: 2,
    [WeatherType.THUNDERSTORM]: 0,
    [WeatherType.SUPERNATURAL_MIST]: 0,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 0,
  },

  // Towns - mild weather, no extreme conditions
  town: {
    [WeatherType.CLEAR]: 50,
    [WeatherType.CLOUDY]: 25,
    [WeatherType.SANDSTORM]: 0,
    [WeatherType.DUST_STORM]: 5,
    [WeatherType.HEAT_WAVE]: 5,
    [WeatherType.RAIN]: 10,
    [WeatherType.FOG]: 3,
    [WeatherType.COLD_SNAP]: 2,
    [WeatherType.THUNDERSTORM]: 0,
    [WeatherType.SUPERNATURAL_MIST]: 0,
    [WeatherType.THUNDERBIRD_STORM]: 0,
    [WeatherType.REALITY_DISTORTION]: 0,
  },
};

/**
 * Locations that always have supernatural weather
 */
const SUPERNATURAL_LOCATIONS = [
  'the_scar',
  'reality_tear',
  'spirit_springs',
  'thunderbird_perch',
];

export class WeatherService {
  /**
   * Get current weather for a specific region
   */
  static async getRegionalWeather(region: RegionType): Promise<RegionalWeather | null> {
    const worldState = await WorldState.findOne();
    if (!worldState) return null;

    const regionalWeather = worldState.regionalWeather.find(w => w.region === region);
    return regionalWeather || null;
  }

  /**
   * Get current weather for a specific location ID
   */
  static async getLocationWeather(locationId: string): Promise<{
    weather: WeatherType;
    effects: WeatherEffects;
    intensity: number;
    isSupernatural: boolean;
  } | null> {
    try {
      const location = await Location.findById(locationId);
      if (!location) return null;

      const worldState = await WorldState.findOne();
      if (!worldState) return null;

      // Check if this is a supernatural location
      const isSupernatural = this.isLocationSupernatural(locationId, location.name);

      // Get regional weather
      const regionalWeather = worldState.regionalWeather.find(
        w => w.region === location.region
      );

      // Fallback to global weather if no regional weather
      const weatherType = regionalWeather?.currentWeather || worldState.currentWeather;
      const intensity = regionalWeather?.intensity || 5;

      return {
        weather: weatherType,
        effects: this.getWeatherEffects(weatherType, intensity),
        intensity,
        isSupernatural: regionalWeather?.isSupernatural || isSupernatural,
      };
    } catch (error) {
      logger.error('Error getting location weather:', error);
      return null;
    }
  }

  /**
   * Check if a location has supernatural weather
   */
  static isLocationSupernatural(locationId: string, locationName?: string): boolean {
    if (locationName) {
      const lowerName = locationName.toLowerCase();
      return SUPERNATURAL_LOCATIONS.some(name => lowerName.includes(name));
    }
    return false;
  }

  /**
   * Get weather effects with intensity modifier
   */
  static getWeatherEffects(weatherType: WeatherType, intensity: number = 5): WeatherEffects {
    const baseEffects = WEATHER_EFFECTS[weatherType];

    // Intensity scales from 1-10, with 5 being normal
    // Multiply negative effects by intensity factor
    const intensityFactor = intensity / 5;

    return {
      travelTimeModifier: 1 + (baseEffects.travelTimeModifier - 1) * intensityFactor,
      combatModifier: 1 - (1 - baseEffects.combatModifier) * intensityFactor,
      energyCostModifier: 1 + (baseEffects.energyCostModifier - 1) * intensityFactor,
      visibilityModifier: 1 - (1 - baseEffects.visibilityModifier) * intensityFactor,
      encounterModifier: 1 + (baseEffects.encounterModifier - 1) * intensityFactor,
      jobSuccessModifier: 1 - (1 - baseEffects.jobSuccessModifier) * intensityFactor,
      crimeDetectionModifier: 1 - (1 - baseEffects.crimeDetectionModifier) * intensityFactor,
      shopAvailabilityModifier: 1 - (1 - baseEffects.shopAvailabilityModifier) * intensityFactor,
      energyRegenModifier: 1 - (1 - baseEffects.energyRegenModifier) * intensityFactor,
    };
  }

  /**
   * Generate new weather for a region based on patterns
   */
  static generateRegionalWeather(region: RegionType): {
    weather: WeatherType;
    intensity: number;
    duration: number;
    isSupernatural: boolean;
  } {
    const patterns = REGIONAL_WEATHER_PATTERNS[region];
    const totalWeight = Object.values(patterns).reduce((a, b) => a + b, 0);
    let random = SecureRNG.float(0, 1) * totalWeight;

    let selectedWeather = WeatherType.CLEAR;
    for (const [weather, weight] of Object.entries(patterns)) {
      random -= weight;
      if (random <= 0) {
        selectedWeather = weather as WeatherType;
        break;
      }
    }

    // Determine if this is supernatural weather
    const isSupernatural = [
      WeatherType.SUPERNATURAL_MIST,
      WeatherType.THUNDERBIRD_STORM,
      WeatherType.REALITY_DISTORTION,
    ].includes(selectedWeather);

    // Generate intensity (1-10)
    // Supernatural weather tends to be more intense
    const intensity = isSupernatural
      ? SecureRNG.range(7, 10)
      : SecureRNG.range(3, 8);

    // Duration in minutes (30-180 minutes)
    // Supernatural weather lasts longer
    const duration = isSupernatural
      ? SecureRNG.range(120, 240)
      : SecureRNG.range(30, 180);

    return {
      weather: selectedWeather,
      intensity,
      duration,
      isSupernatural,
    };
  }

  /**
   * Update weather for all regions
   */
  static async updateWorldWeather(): Promise<IWorldState> {
    const worldState = await WorldState.findOne();
    if (!worldState) {
      throw new Error('World state not found');
    }

    const now = new Date();
    const regions: RegionType[] = [
      'town',
      'dusty_flats',
      'devils_canyon',
      'sangre_mountains',
      'border_territories',
      'ghost_towns',
      'sacred_lands',
      'outlaw_territory',
      'frontier',
    ];

    // Initialize regional weather if empty
    if (worldState.regionalWeather.length === 0) {
      for (const region of regions) {
        const { weather, intensity, duration, isSupernatural } = this.generateRegionalWeather(region);
        worldState.regionalWeather.push({
          region,
          currentWeather: weather,
          intensity,
          startedAt: now,
          endsAt: new Date(now.getTime() + duration * 60 * 1000),
          isSupernatural,
        });
      }
      logger.info('Initialized regional weather for all regions');
    } else {
      // Update expired weather
      for (let i = 0; i < worldState.regionalWeather.length; i++) {
        const regional = worldState.regionalWeather[i];

        if (now >= regional.endsAt) {
          const { weather, intensity, duration, isSupernatural } =
            this.generateRegionalWeather(regional.region as RegionType);

          worldState.regionalWeather[i] = {
            region: regional.region,
            currentWeather: weather,
            intensity,
            startedAt: now,
            endsAt: new Date(now.getTime() + duration * 60 * 1000),
            isSupernatural,
          };

          logger.info(
            `Weather changed in ${regional.region}: ${weather} (intensity: ${intensity}, duration: ${duration}m)`
          );
        }
      }
    }

    await worldState.save();
    return worldState;
  }

  /**
   * Force set weather for a region (admin/testing)
   */
  static async setRegionalWeather(
    region: RegionType,
    weather: WeatherType,
    intensity: number = 5,
    durationMinutes: number = 60
  ): Promise<IWorldState> {
    const worldState = await WorldState.findOne();
    if (!worldState) {
      throw new Error('World state not found');
    }

    const now = new Date();
    const isSupernatural = [
      WeatherType.SUPERNATURAL_MIST,
      WeatherType.THUNDERBIRD_STORM,
      WeatherType.REALITY_DISTORTION,
    ].includes(weather);

    const existingIndex = worldState.regionalWeather.findIndex(w => w.region === region);

    const newWeather: RegionalWeather = {
      region,
      currentWeather: weather,
      intensity: Math.max(1, Math.min(10, intensity)),
      startedAt: now,
      endsAt: new Date(now.getTime() + durationMinutes * 60 * 1000),
      isSupernatural,
    };

    if (existingIndex >= 0) {
      worldState.regionalWeather[existingIndex] = newWeather;
    } else {
      worldState.regionalWeather.push(newWeather);
    }

    await worldState.save();
    logger.info(`Manually set weather for ${region}: ${weather} (intensity: ${intensity})`);

    return worldState;
  }

  /**
   * Get all current regional weather
   */
  static async getAllRegionalWeather(): Promise<RegionalWeather[]> {
    const worldState = await WorldState.findOne();
    if (!worldState) return [];
    return worldState.regionalWeather;
  }

  /**
   * Get weather description for display
   */
  static getWeatherDescription(weather: WeatherType, intensity: number): string {
    const intensityDesc = intensity >= 8 ? 'Severe' : intensity >= 6 ? 'Moderate' : 'Light';

    const descriptions: Record<WeatherType, string> = {
      [WeatherType.CLEAR]: 'Clear skies and good visibility',
      [WeatherType.CLOUDY]: 'Overcast with clouds',
      [WeatherType.RAIN]: `${intensityDesc} rain`,
      [WeatherType.DUST_STORM]: `${intensityDesc} dust storm`,
      [WeatherType.SANDSTORM]: `${intensityDesc} sandstorm - visibility severely reduced`,
      [WeatherType.HEAT_WAVE]: `${intensityDesc} heat wave - exhausting conditions`,
      [WeatherType.COLD_SNAP]: `${intensityDesc} cold snap - freezing temperatures`,
      [WeatherType.FOG]: `${intensityDesc} fog - limited visibility`,
      [WeatherType.THUNDERSTORM]: `${intensityDesc} thunderstorm - dangerous conditions`,
      [WeatherType.SUPERNATURAL_MIST]: 'Unnatural mist - reality feels thin',
      [WeatherType.THUNDERBIRD_STORM]: 'Thunderbird storm - blessed by spirits',
      [WeatherType.REALITY_DISTORTION]: 'Reality distortion - the Scar bleeds into the world',
    };

    return descriptions[weather] || 'Unknown weather';
  }

  /**
   * Check if weather prevents travel
   */
  static isWeatherTravelable(weather: WeatherType, intensity: number): boolean {
    // Extreme weather at high intensity prevents travel
    if (intensity >= 9) {
      return ![
        WeatherType.SANDSTORM,
        WeatherType.THUNDERSTORM,
        WeatherType.REALITY_DISTORTION,
      ].includes(weather);
    }
    return true;
  }

  /**
   * Check if weather closes shops
   */
  static getOpenShops(weather: WeatherType, intensity: number, totalShops: number): number {
    const effects = this.getWeatherEffects(weather, intensity);
    return Math.floor(totalShops * effects.shopAvailabilityModifier);
  }
}

export default WeatherService;
