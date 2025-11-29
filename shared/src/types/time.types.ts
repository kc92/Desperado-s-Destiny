/**
 * Time System Types
 *
 * Types for the dynamic time-of-day system that affects
 * building access, NPC availability, crime difficulty, and atmosphere
 */

/**
 * Time periods throughout a 24-hour day
 * Each period has unique gameplay effects and atmosphere
 */
export enum TimePeriod {
  DAWN = 'dawn',           // 5-7: Early morning, few people about
  MORNING = 'morning',     // 7-12: Business hours begin
  NOON = 'noon',           // 12-14: Peak activity, siesta in some places
  AFTERNOON = 'afternoon', // 14-17: Full business hours
  EVENING = 'evening',     // 17-21: Saloons open, social hour
  NIGHT = 'night',         // 21-24: Dark, fewer witnesses
  MIDNIGHT = 'midnight',   // 0-5: Dead of night, illegal activity
}

/**
 * Current game time state
 */
export interface TimeState {
  currentHour: number;           // 0-23 hour of day
  currentPeriod: TimePeriod;     // Calculated time period
  isDaylight: boolean;           // True during dawn-evening
  effectModifiers: TimeEffects;  // Current gameplay modifiers
}

/**
 * Gameplay effects that vary by time of day
 */
export interface TimeEffects {
  crimeDetectionModifier: number;   // Multiplier for witness chance (1.0 = normal, 0.5 = half detection)
  npcActivityLevel: number;         // 0.0-1.0 how many NPCs are active/available
  travelSafetyModifier: number;     // Multiplier for bandit encounters (1.0 = normal, 0.6 = more dangerous)
  shopAvailability: ShopType[];     // Which types of shops are currently open
  buildingCategories: BuildingCategory[]; // Which building categories are accessible
}

/**
 * Shop types for availability tracking
 */
export type ShopType =
  | 'general'
  | 'weapons'
  | 'armor'
  | 'medicine'
  | 'black_market'
  | 'specialty';

/**
 * Building categories for time-based access
 */
export type BuildingCategory =
  | 'government'      // Banks, sheriff offices, courts
  | 'business'        // Shops, general stores
  | 'service'         // Doctors, blacksmiths
  | 'entertainment'   // Saloons, theaters, gambling halls
  | 'religious'       // Churches, chapels
  | 'illegal'         // Smugglers dens, black market
  | 'residential'     // Hotels, boarding houses
  | 'always_open';    // Train stations, 24hr establishments

/**
 * Time-restricted crime types
 */
export interface CrimeTimeRestriction {
  crimeId: string;
  crimeName: string;
  allowedPeriods: TimePeriod[];
  reason?: string; // Why this restriction exists
}

/**
 * Building type to category mapping
 */
export interface BuildingTimeProfile {
  category: BuildingCategory;
  defaultOpenHour: number;
  defaultCloseHour: number;
  peakPeriods?: TimePeriod[];
}

/**
 * NPC schedule entry (foundation for Phase 3)
 */
export interface NPCScheduleEntry {
  npcId: string;
  hour: number;              // 0-23
  locationId: string;        // Where the NPC is at this hour
  isAvailable: boolean;      // Can player interact?
  activityDescription?: string; // What they're doing
}

/**
 * Location atmosphere by time period
 */
export interface TimeBasedAtmosphere {
  locationId: string;
  atmospheres: {
    [key in TimePeriod]?: string; // Different description for each time
  };
}

/**
 * API Response: Current time state
 */
export interface GetTimeStateResponse {
  success: boolean;
  data: {
    timeState: TimeState;
    gameTimeRatio: number; // How fast game time moves (e.g., 4 = 4x real time)
  };
}

/**
 * Building access check result
 */
export interface BuildingAccessResult {
  isOpen: boolean;
  reason?: string;          // Why building is closed
  opensAt?: number;         // Hour when it opens (0-23)
  closesAt?: number;        // Hour when it closes (0-23)
  currentPeriod: TimePeriod;
}

/**
 * Crime availability check result
 */
export interface CrimeAvailabilityResult {
  isAvailable: boolean;
  reason?: string;          // Why crime is unavailable
  effectiveWitnessChance?: number; // Modified witness chance
  timeModifier?: number;    // Applied time-based modifier
}
