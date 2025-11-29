/**
 * Weather Types
 *
 * Shared types for the weather system
 */

/**
 * Weather types available in the game
 */
export enum WeatherType {
  CLEAR = 'CLEAR',
  CLOUDY = 'CLOUDY',
  RAIN = 'RAIN',
  DUST_STORM = 'DUST_STORM',
  SANDSTORM = 'SANDSTORM',
  HEAT_WAVE = 'HEAT_WAVE',
  COLD_SNAP = 'COLD_SNAP',
  FOG = 'FOG',
  THUNDERSTORM = 'THUNDERSTORM',
  // Supernatural weather
  SUPERNATURAL_MIST = 'SUPERNATURAL_MIST',
  THUNDERBIRD_STORM = 'THUNDERBIRD_STORM',
  REALITY_DISTORTION = 'REALITY_DISTORTION',
}

/**
 * Effects that weather has on gameplay
 */
export interface WeatherEffects {
  travelTimeModifier: number;       // 1.0 = normal, 1.5 = 50% slower
  combatModifier: number;           // Affects accuracy/damage
  energyCostModifier: number;       // Energy cost for actions
  visibilityModifier: number;       // Affects detection/stealth
  encounterModifier: number;        // Random encounter chance
  jobSuccessModifier: number;       // Job success rate modifier
  crimeDetectionModifier: number;   // Crime detection chance modifier
  shopAvailabilityModifier: number; // 1.0 = all open, 0.5 = half close
  energyRegenModifier: number;      // Energy regeneration rate modifier
}

/**
 * Regional weather state
 */
export interface RegionalWeather {
  region: string;
  currentWeather: WeatherType;
  intensity: number; // 1-10
  startedAt: Date;
  endsAt: Date;
  isSupernatural: boolean;
}

/**
 * Weather information for display
 */
export interface WeatherInfo {
  region: string;
  weather: WeatherType;
  intensity: number;
  description: string;
  effects: WeatherEffects;
  startedAt: Date;
  endsAt: Date;
  isSupernatural: boolean;
  travelable: boolean;
}

/**
 * API response for getting all weather
 */
export interface GetAllWeatherResponse {
  success: boolean;
  data: {
    weather: WeatherInfo[];
  };
}

/**
 * API response for getting region weather
 */
export interface GetRegionWeatherResponse {
  success: boolean;
  data: WeatherInfo;
}

/**
 * API response for getting location weather
 */
export interface GetLocationWeatherResponse {
  success: boolean;
  data: {
    weather: WeatherType;
    intensity: number;
    description: string;
    effects: WeatherEffects;
    isSupernatural: boolean;
    travelable: boolean;
  };
}

/**
 * API request for setting weather
 */
export interface SetWeatherRequest {
  region: string;
  weather: WeatherType;
  intensity?: number;
  duration?: number;
}

/**
 * API response for weather types
 */
export interface GetWeatherTypesResponse {
  success: boolean;
  data: {
    weatherTypes: Array<{
      type: WeatherType;
      effects: WeatherEffects;
      description: string;
    }>;
  };
}
