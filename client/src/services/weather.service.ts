/**
 * Weather Service
 * API client for weather system operations
 */

import api from './api';
import type {
  WeatherType,
  WeatherEffects,
  WeatherInfo,
  GetAllWeatherResponse,
  GetRegionWeatherResponse,
  GetLocationWeatherResponse,
  SetWeatherRequest,
  GetWeatherTypesResponse,
} from '@shared/types/weather.types';

// ===== Additional Types =====

export interface WeatherTypeInfo {
  type: WeatherType;
  effects: WeatherEffects;
  description: string;
}

export interface SetWeatherResponse {
  success: boolean;
  data: {
    message: string;
    weather: WeatherInfo;
  };
}

export interface UpdateWeatherResponse {
  success: boolean;
  data: {
    message: string;
    updatedRegions: string[];
  };
}

// ===== Weather Service =====

export const weatherService = {
  // ===== Public Routes =====

  /**
   * Get current weather for all regions
   */
  async getAllWeather(): Promise<WeatherInfo[]> {
    const response = await api.get<GetAllWeatherResponse>('/weather');
    return response.data.data.weather;
  },

  /**
   * Get all available weather types and their effects
   */
  async getWeatherTypes(): Promise<WeatherTypeInfo[]> {
    const response = await api.get<GetWeatherTypesResponse>('/weather/types');
    return response.data.data.weatherTypes;
  },

  /**
   * Get current weather for a specific region
   */
  async getRegionWeather(region: string): Promise<WeatherInfo> {
    const response = await api.get<GetRegionWeatherResponse>(`/weather/region/${region}`);
    return response.data.data;
  },

  /**
   * Get current weather at a specific location
   */
  async getLocationWeather(locationId: string): Promise<{
    weather: WeatherType;
    intensity: number;
    description: string;
    effects: WeatherEffects;
    isSupernatural: boolean;
    travelable: boolean;
  }> {
    const response = await api.get<GetLocationWeatherResponse>(`/weather/location/${locationId}`);
    return response.data.data;
  },

  /**
   * Manually trigger weather update (can be used by cron jobs)
   */
  async updateWeather(): Promise<UpdateWeatherResponse> {
    const response = await api.post<UpdateWeatherResponse>('/weather/update');
    return response.data;
  },

  // ===== Admin Routes =====

  /**
   * Admin: Set weather for testing purposes
   * @requires Admin authentication
   */
  async setWeather(request: SetWeatherRequest): Promise<SetWeatherResponse> {
    const response = await api.post<SetWeatherResponse>('/weather/set', request);
    return response.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if weather is safe for travel
   */
  isTravelSafe(weather: WeatherInfo): boolean {
    return weather.travelable && weather.intensity < 8;
  },

  /**
   * Check if weather affects crime detection
   */
  hasCrimeBenefit(effects: WeatherEffects): boolean {
    return effects.crimeDetectionModifier < 1.0 || effects.visibilityModifier < 1.0;
  },

  /**
   * Check if weather is supernatural
   */
  isSupernatural(weather: WeatherInfo): boolean {
    return weather.isSupernatural || [
      WeatherType.SUPERNATURAL_MIST,
      WeatherType.THUNDERBIRD_STORM,
      WeatherType.REALITY_DISTORTION,
    ].includes(weather.weather);
  },

  /**
   * Get weather severity level
   */
  getSeverityLevel(intensity: number): 'mild' | 'moderate' | 'severe' | 'extreme' {
    if (intensity <= 3) return 'mild';
    if (intensity <= 6) return 'moderate';
    if (intensity <= 8) return 'severe';
    return 'extreme';
  },

  /**
   * Calculate total modifier for combat
   */
  getCombatModifier(effects: WeatherEffects): number {
    return effects.combatModifier * effects.visibilityModifier;
  },

  /**
   * Calculate total modifier for travel time
   */
  getTravelTimeModifier(effects: WeatherEffects): number {
    return effects.travelTimeModifier;
  },

  /**
   * Get energy cost multiplier
   */
  getEnergyCostMultiplier(effects: WeatherEffects): number {
    return effects.energyCostModifier;
  },

  /**
   * Get formatted weather description
   */
  formatWeatherDescription(weather: WeatherInfo): string {
    const severity = this.getSeverityLevel(weather.intensity);
    const supernatural = weather.isSupernatural ? ' (Supernatural)' : '';
    return `${severity} ${weather.weather.toLowerCase().replace(/_/g, ' ')}${supernatural}`;
  },

  /**
   * Get time remaining until weather changes
   */
  getTimeRemaining(endsAt: Date): string {
    const now = new Date();
    const end = new Date(endsAt);
    const msRemaining = end.getTime() - now.getTime();

    if (msRemaining <= 0) return 'Ending soon';

    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  },

  /**
   * Check if specific weather type is active in any region
   */
  isWeatherTypeActive(allWeather: WeatherInfo[], weatherType: WeatherType): boolean {
    return allWeather.some(w => w.weather === weatherType);
  },

  /**
   * Get regions with specific weather type
   */
  getRegionsWithWeather(allWeather: WeatherInfo[], weatherType: WeatherType): string[] {
    return allWeather
      .filter(w => w.weather === weatherType)
      .map(w => w.region);
  },

  /**
   * Find best region for activity based on weather
   */
  getBestRegionForActivity(allWeather: WeatherInfo[], activity: 'travel' | 'crime' | 'combat'): string | null {
    const sorted = [...allWeather].sort((a, b) => {
      if (activity === 'travel') {
        return a.effects.travelTimeModifier - b.effects.travelTimeModifier;
      } else if (activity === 'crime') {
        return a.effects.crimeDetectionModifier - b.effects.crimeDetectionModifier;
      } else if (activity === 'combat') {
        return b.effects.combatModifier - a.effects.combatModifier;
      }
      return 0;
    });

    return sorted[0]?.region || null;
  },
};

export default weatherService;
