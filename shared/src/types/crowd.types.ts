/**
 * Crowd System Types
 * Dynamic population system for buildings and locations
 */

/**
 * Crowd density levels
 */
export enum CrowdLevel {
  EMPTY = 'empty',       // 0-5% capacity
  SPARSE = 'sparse',     // 5-25%
  MODERATE = 'moderate', // 25-50%
  BUSY = 'busy',         // 50-75%
  CROWDED = 'crowded',   // 75-90%
  PACKED = 'packed',     // 90-100%
}

/**
 * Current crowd state at a location
 */
export interface CrowdState {
  locationId: string;
  currentLevel: CrowdLevel;
  estimatedCount: number;
  baseCapacity: number;
  percentFull: number;
  factors: CrowdFactor[];
  atmosphereDescription: string;
  lastUpdated: Date;
}

/**
 * Factor affecting crowd levels
 */
export interface CrowdFactor {
  type: 'time' | 'weather' | 'event' | 'day_of_week' | 'random';
  modifier: number; // Multiplier (e.g., 1.5 = 50% more people)
  description: string;
}

/**
 * Time-based crowd pattern for location types
 */
export interface CrowdPattern {
  dawn: number;      // 5-7
  morning: number;   // 7-12
  noon: number;      // 12-14
  afternoon: number; // 14-18
  dusk: number;      // 18-20
  evening: number;   // 20-22
  night: number;     // 22-24
  midnight: number;  // 0-5
}

/**
 * Crowd effects on gameplay
 */
export interface CrowdEffects {
  crimeDetectionModifier: number;  // Multiplier for witness chance
  pickpocketingAvailable: boolean; // Can pickpocket in crowds
  pickpocketingBonus: number;      // Bonus gold from pickpocketing
  atmosphereBonus: string;         // Additional atmosphere text
}

/**
 * Location capacity data
 */
export interface LocationCapacity {
  baseCapacity: number;
  isIndoor: boolean;
  isPublic: boolean;
}

/**
 * Crowd calculation result
 */
export interface CrowdCalculation {
  rawMultiplier: number;
  finalMultiplier: number;
  estimatedCount: number;
  level: CrowdLevel;
  factors: CrowdFactor[];
}

/**
 * API Response types
 */
export interface GetCrowdStateResponse {
  crowdState: CrowdState;
  effects: CrowdEffects;
}
