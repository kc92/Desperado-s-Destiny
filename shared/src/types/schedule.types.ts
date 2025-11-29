/**
 * NPC Schedule System Types
 *
 * Types for the NPC life simulation system where NPCs follow
 * daily routines including working, eating, sleeping, and socializing
 */

/**
 * Activities that NPCs can perform throughout their day
 */
export enum NPCActivity {
  SLEEPING = 'sleeping',
  WAKING = 'waking',
  EATING = 'eating',
  WORKING = 'working',
  SOCIALIZING = 'socializing',
  TRAVELING = 'traveling',
  PRAYING = 'praying',
  DRINKING = 'drinking',
  SHOPPING = 'shopping',
  PATROLLING = 'patrolling',
  RESTING = 'resting',
  GAMBLING = 'gambling',
  PERFORMING = 'performing',
  CRAFTING = 'crafting',
  GUARDING = 'guarding',
}

/**
 * A single entry in an NPC's daily schedule
 * Represents one time block with an activity and location
 */
export interface ScheduleEntry {
  hour: number;              // Start hour (0-23)
  endHour: number;           // End hour (0-23), can wrap past midnight
  activity: NPCActivity;
  locationId?: string;       // Building/location ID where they are
  locationName?: string;     // Human-readable location name
  interruptible: boolean;    // Can player interact with NPC during this activity?
  dialogue?: string;         // Activity-specific dialogue hint
  priority?: number;         // Higher priority activities override lower ones (1-10)
}

/**
 * Complete schedule for an NPC including default and special schedules
 */
export interface NPCSchedule {
  npcId: string;
  npcName: string;
  homeLocation: string;      // Where they sleep/live
  workLocation?: string;     // Primary work building (if applicable)
  defaultSchedule: ScheduleEntry[];
  weekendSchedule?: ScheduleEntry[];  // Different on weekends (optional)
  specialDays?: { [date: string]: ScheduleEntry[] }; // Special event days
  personality?: string;      // Affects dialogue during activities
  faction?: string;          // Faction affiliation
}

/**
 * Current activity state for an NPC at a given time
 */
export interface NPCActivityState {
  npcId: string;
  npcName: string;
  currentActivity: NPCActivity;
  currentLocation: string;
  currentLocationName: string;
  isAvailable: boolean;      // Can player interact?
  activityDialogue?: string; // Context-specific dialogue
  startTime: number;         // Hour when current activity started
  endTime: number;           // Hour when current activity ends
  nextActivity?: {
    activity: NPCActivity;
    location: string;
    startsAt: number;        // Hour
  };
}

/**
 * NPC archetype for schedule templates
 * Defines common schedule patterns by role
 */
export enum NPCArchetype {
  WORKER = 'worker',           // Shopkeepers, blacksmiths, etc.
  OUTLAW = 'outlaw',           // Criminals, gang members
  LAWMAN = 'lawman',           // Sheriff, deputies, marshals
  RELIGIOUS = 'religious',     // Priests, shamans
  ENTERTAINER = 'entertainer', // Saloon girls, musicians
  MERCHANT = 'merchant',       // Traders, storekeepers
  DOCTOR = 'doctor',           // Medical professionals
  SERVANT = 'servant',         // Stable hands, hotel workers
  GAMBLER = 'gambler',         // Professional gamblers
  VAGRANT = 'vagrant',         // Drifters, beggars
}

/**
 * Schedule template by archetype
 * Reusable patterns for creating NPC schedules
 */
export interface ScheduleTemplate {
  archetype: NPCArchetype;
  name: string;
  description: string;
  defaultSchedule: ScheduleEntry[];
  weekendVariation?: Partial<ScheduleEntry>[];
}

/**
 * Request to get NPCs at a location
 */
export interface GetNPCsAtLocationRequest {
  locationId: string;
  hour?: number;             // Optional specific hour (defaults to current)
}

/**
 * Response with NPCs currently at a location
 */
export interface GetNPCsAtLocationResponse {
  success: boolean;
  data: {
    locationId: string;
    locationName: string;
    currentHour: number;
    npcsPresent: NPCActivityState[];
    totalNPCs: number;
  };
}

/**
 * Request to get a specific NPC's schedule
 */
export interface GetNPCScheduleRequest {
  npcId: string;
  includeNextActivities?: boolean; // Include upcoming activities
}

/**
 * Response with NPC schedule information
 */
export interface GetNPCScheduleResponse {
  success: boolean;
  data: {
    schedule: NPCSchedule;
    currentActivity: NPCActivityState;
    upcomingActivities?: ScheduleEntry[];
  };
}

/**
 * Request to get current activity for an NPC
 */
export interface GetCurrentActivityRequest {
  npcId: string;
  hour?: number;             // Optional specific hour (defaults to current)
}

/**
 * Response with NPC's current activity
 */
export interface GetCurrentActivityResponse {
  success: boolean;
  data: {
    activityState: NPCActivityState;
  };
}

/**
 * Request to check if NPC is available for interaction
 */
export interface CheckNPCAvailabilityRequest {
  npcId: string;
  hour?: number;             // Optional specific hour (defaults to current)
}

/**
 * Response with NPC availability status
 */
export interface CheckNPCAvailabilityResponse {
  success: boolean;
  data: {
    isAvailable: boolean;
    reason?: string;           // Why NPC is unavailable
    availableAt?: number;      // Hour when NPC becomes available
    currentActivity: NPCActivity;
    currentLocation: string;
  };
}

/**
 * Bulk request to get all NPC locations at current time
 */
export interface GetAllNPCLocationsRequest {
  hour?: number;             // Optional specific hour (defaults to current)
  locationFilter?: string;   // Optional filter by location
  activityFilter?: NPCActivity; // Optional filter by activity
}

/**
 * Response with all NPC current locations
 */
export interface GetAllNPCLocationsResponse {
  success: boolean;
  data: {
    currentHour: number;
    npcStates: NPCActivityState[];
    totalNPCs: number;
    byLocation: {
      [locationId: string]: {
        locationName: string;
        npcs: NPCActivityState[];
      };
    };
  };
}

/**
 * Activity-based dialogue configuration
 * Maps activities to dialogue patterns
 */
export interface ActivityDialoguePattern {
  activity: NPCActivity;
  greetings: string[];       // Possible greetings during this activity
  busy: string[];            // Responses when too busy to talk
  helpful: string[];         // Responses when available to help
  dismissive: string[];      // Responses when player is unwelcome
}

/**
 * NPC interaction context based on schedule
 */
export interface NPCInteractionContext {
  npcId: string;
  npcName: string;
  currentActivity: NPCActivity;
  location: string;
  isInterruptible: boolean;
  mood: 'friendly' | 'neutral' | 'busy' | 'hostile';
  suggestedDialogue: string[];
}
