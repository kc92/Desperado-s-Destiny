/**
 * Schedule Service
 *
 * Manages NPC daily schedules and location tracking
 * Provides functionality to:
 * - Get NPC's current activity and location
 * - Check if NPC is available for interaction
 * - Find all NPCs at a given location
 * - Generate activity-specific dialogue
 */

import {
  NPCSchedule,
  ScheduleEntry,
  NPCActivity,
  NPCActivityState,
  NPCArchetype,
  ScheduleTemplate,
} from '@desperados/shared';
import { TimeService } from './time.service';
import { NPC_SCHEDULES, SCHEDULE_TEMPLATES, ACTIVITY_DIALOGUE_PATTERNS } from '../data/npcSchedules';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

/**
 * Schedule Service - Core NPC scheduling functionality
 */
export class ScheduleService {
  /**
   * Cache for NPC schedules (in-memory for now)
   * In production, this would be stored in database
   */
  private static scheduleCache: Map<string, NPCSchedule> = new Map();

  /**
   * Initialize the schedule service and load all NPC schedules
   */
  static initialize(): void {
    // Load all predefined schedules into cache
    for (const schedule of NPC_SCHEDULES) {
      this.scheduleCache.set(schedule.npcId, schedule);
    }

    logger.info(`Schedule Service initialized with ${this.scheduleCache.size} NPC schedules`);
  }

  /**
   * Get the complete schedule for an NPC
   * @param npcId - The NPC's unique identifier
   * @returns The NPC's complete schedule or null if not found
   */
  static getNPCSchedule(npcId: string): NPCSchedule | null {
    return this.scheduleCache.get(npcId) || null;
  }

  /**
   * Get all registered NPC schedules
   * @returns Array of all NPC schedules
   */
  static getAllNPCSchedules(): NPCSchedule[] {
    return Array.from(this.scheduleCache.values());
  }

  /**
   * Get the schedule entry that applies at a specific hour
   * @param schedule - The NPC's schedule entries
   * @param hour - Hour to check (0-23), defaults to current game time
   * @returns The active schedule entry or null if none found
   */
  static getScheduleEntryAtHour(schedule: ScheduleEntry[], hour?: number): ScheduleEntry | null {
    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();

    // Find the entry that contains this hour
    for (const entry of schedule) {
      const { hour: startHour, endHour } = entry;

      // Handle entries that wrap past midnight (e.g., 22:00 - 4:00)
      if (startHour <= endHour) {
        // Normal range (e.g., 8:00 - 17:00)
        if (currentHour >= startHour && currentHour < endHour) {
          return entry;
        }
      } else {
        // Wraps past midnight (e.g., 22:00 - 4:00)
        if (currentHour >= startHour || currentHour < endHour) {
          return entry;
        }
      }
    }

    return null;
  }

  /**
   * Get NPC's current activity and location
   * @param npcId - The NPC's unique identifier
   * @param hour - Optional specific hour (defaults to current)
   * @returns Current activity state or null if NPC not found
   */
  static getCurrentActivity(npcId: string, hour?: number): NPCActivityState | null {
    const npcSchedule = this.getNPCSchedule(npcId);
    if (!npcSchedule) {
      logger.warn(`No schedule found for NPC: ${npcId}`);
      return null;
    }

    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();
    const scheduleEntry = this.getScheduleEntryAtHour(npcSchedule.defaultSchedule, currentHour);

    if (!scheduleEntry) {
      logger.warn(`No schedule entry found for NPC ${npcId} at hour ${currentHour}`);
      return null;
    }

    // Find next activity
    const nextEntry = this.getNextScheduleEntry(npcSchedule.defaultSchedule, currentHour);

    const activityState: NPCActivityState = {
      npcId: npcSchedule.npcId,
      npcName: npcSchedule.npcName,
      currentActivity: scheduleEntry.activity,
      currentLocation: scheduleEntry.locationId || npcSchedule.homeLocation,
      currentLocationName: scheduleEntry.locationName || 'Unknown Location',
      isAvailable: scheduleEntry.interruptible,
      activityDialogue: scheduleEntry.dialogue,
      startTime: scheduleEntry.hour,
      endTime: scheduleEntry.endHour,
      nextActivity: nextEntry
        ? {
            activity: nextEntry.activity,
            location: nextEntry.locationId || npcSchedule.homeLocation,
            startsAt: nextEntry.hour,
          }
        : undefined,
    };

    return activityState;
  }

  /**
   * Get the next schedule entry after the current hour
   * @param schedule - The NPC's schedule entries
   * @param currentHour - Current hour (0-23)
   * @returns The next schedule entry or null if none found
   */
  private static getNextScheduleEntry(schedule: ScheduleEntry[], currentHour: number): ScheduleEntry | null {
    // Sort entries by start hour
    const sortedSchedule = [...schedule].sort((a, b) => a.hour - b.hour);

    // Find the first entry that starts after current hour
    for (const entry of sortedSchedule) {
      if (entry.hour > currentHour) {
        return entry;
      }
    }

    // If no entry found, return the first entry (wraps to next day)
    return sortedSchedule[0] || null;
  }

  /**
   * Get NPC's current location
   * @param npcId - The NPC's unique identifier
   * @param hour - Optional specific hour (defaults to current)
   * @returns Location ID where NPC currently is
   */
  static getNPCLocation(npcId: string, hour?: number): string | null {
    const activity = this.getCurrentActivity(npcId, hour);
    return activity?.currentLocation || null;
  }

  /**
   * Check if an NPC is available for interaction
   * @param npcId - The NPC's unique identifier
   * @param hour - Optional specific hour (defaults to current)
   * @returns True if player can interact with NPC
   */
  static isNPCAvailable(npcId: string, hour?: number): boolean {
    const activity = this.getCurrentActivity(npcId, hour);
    return activity?.isAvailable || false;
  }

  /**
   * Get all NPCs currently at a specific location
   * @param locationId - The location to check
   * @param hour - Optional specific hour (defaults to current)
   * @returns Array of NPCs present at the location
   */
  static getNPCsAtLocation(locationId: string, hour?: number): NPCActivityState[] {
    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();
    const npcsAtLocation: NPCActivityState[] = [];

    // Check all NPCs to see if they're at this location
    for (const npcSchedule of this.getAllNPCSchedules()) {
      const activity = this.getCurrentActivity(npcSchedule.npcId, currentHour);

      if (activity && activity.currentLocation === locationId) {
        npcsAtLocation.push(activity);
      }
    }

    return npcsAtLocation;
  }

  /**
   * Get all NPC locations at current time
   * @param hour - Optional specific hour (defaults to current)
   * @returns Map of location IDs to NPCs present
   */
  static getAllNPCLocations(hour?: number): Map<string, NPCActivityState[]> {
    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();
    const locationMap = new Map<string, NPCActivityState[]>();

    for (const npcSchedule of this.getAllNPCSchedules()) {
      const activity = this.getCurrentActivity(npcSchedule.npcId, currentHour);

      if (activity) {
        const location = activity.currentLocation;
        const npcsAtLocation = locationMap.get(location) || [];
        npcsAtLocation.push(activity);
        locationMap.set(location, npcsAtLocation);
      }
    }

    return locationMap;
  }

  /**
   * Get activity-specific dialogue for an NPC
   * @param npcId - The NPC's unique identifier
   * @param mood - NPC's mood towards player (friendly, neutral, busy, hostile)
   * @returns Appropriate dialogue based on current activity
   */
  static getActivityDialogue(
    npcId: string,
    mood: 'friendly' | 'neutral' | 'busy' | 'hostile' = 'neutral'
  ): string {
    const activity = this.getCurrentActivity(npcId);

    if (!activity) {
      return 'Hello there.';
    }

    // If schedule has specific dialogue, use that
    if (activity.activityDialogue) {
      return activity.activityDialogue;
    }

    // Otherwise, use generic activity-based dialogue
    const patterns = ACTIVITY_DIALOGUE_PATTERNS[activity.currentActivity];
    if (!patterns) {
      return 'Hello.';
    }

    // Select appropriate dialogue based on mood
    let dialogueOptions: string[];
    switch (mood) {
      case 'friendly':
        dialogueOptions = patterns.helpful.length > 0 ? patterns.helpful : patterns.greetings;
        break;
      case 'busy':
        dialogueOptions = patterns.busy.length > 0 ? patterns.busy : patterns.greetings;
        break;
      case 'hostile':
        dialogueOptions = patterns.dismissive.length > 0 ? patterns.dismissive : patterns.greetings;
        break;
      default:
        dialogueOptions = patterns.greetings;
    }

    // Return random dialogue from options
    return SecureRNG.select(dialogueOptions) || 'Hello.';
  }

  /**
   * Get NPC interaction context
   * Provides all info needed to generate contextual NPC interactions
   * @param npcId - The NPC's unique identifier
   * @param playerReputation - Player's reputation with NPC (0-100)
   * @returns Interaction context for dialogue generation
   */
  static getNPCInteractionContext(npcId: string, playerReputation: number = 50) {
    const activity = this.getCurrentActivity(npcId);

    if (!activity) {
      return null;
    }

    // Determine mood based on activity and reputation
    let mood: 'friendly' | 'neutral' | 'busy' | 'hostile' = 'neutral';

    if (!activity.isAvailable) {
      mood = 'busy';
    } else if (playerReputation >= 75) {
      mood = 'friendly';
    } else if (playerReputation <= 25) {
      mood = 'hostile';
    }

    // Generate suggested dialogue options
    const patterns = ACTIVITY_DIALOGUE_PATTERNS[activity.currentActivity];
    const suggestedDialogue: string[] = [];

    if (patterns) {
      if (mood === 'friendly' && patterns.helpful.length > 0) {
        suggestedDialogue.push(...patterns.helpful);
      } else if (mood === 'busy' && patterns.busy.length > 0) {
        suggestedDialogue.push(...patterns.busy);
      } else if (mood === 'hostile' && patterns.dismissive.length > 0) {
        suggestedDialogue.push(...patterns.dismissive);
      } else {
        suggestedDialogue.push(...patterns.greetings);
      }
    }

    return {
      npcId: activity.npcId,
      npcName: activity.npcName,
      currentActivity: activity.currentActivity,
      location: activity.currentLocation,
      isInterruptible: activity.isAvailable,
      mood,
      suggestedDialogue,
    };
  }

  /**
   * Get schedule template by archetype
   * @param archetype - The NPC archetype
   * @returns Schedule template for that archetype
   */
  static getScheduleTemplate(archetype: NPCArchetype): ScheduleTemplate | null {
    return SCHEDULE_TEMPLATES[archetype] || null;
  }

  /**
   * Create a new NPC schedule from a template
   * @param npcId - Unique ID for the NPC
   * @param npcName - NPC's display name
   * @param archetype - NPC archetype to base schedule on
   * @param homeLocation - Where NPC lives
   * @param workLocation - Where NPC works (optional)
   * @param customEntries - Custom schedule entries to override template
   * @returns New NPC schedule
   */
  static createScheduleFromTemplate(
    npcId: string,
    npcName: string,
    archetype: NPCArchetype,
    homeLocation: string,
    workLocation?: string,
    customEntries?: Partial<ScheduleEntry>[]
  ): NPCSchedule {
    const template = this.getScheduleTemplate(archetype);

    if (!template) {
      throw new Error(`No template found for archetype: ${archetype}`);
    }

    // Clone the template schedule
    let scheduleEntries = [...template.defaultSchedule];

    // Apply custom entries if provided
    if (customEntries && customEntries.length > 0) {
      scheduleEntries = scheduleEntries.map((entry, index) => {
        const customEntry = customEntries[index];
        return customEntry ? { ...entry, ...customEntry } : entry;
      });
    }

    const newSchedule: NPCSchedule = {
      npcId,
      npcName,
      homeLocation,
      workLocation,
      defaultSchedule: scheduleEntries,
    };

    // Add to cache
    this.scheduleCache.set(npcId, newSchedule);

    return newSchedule;
  }

  /**
   * Add or update an NPC schedule
   * @param schedule - The complete NPC schedule
   */
  static setNPCSchedule(schedule: NPCSchedule): void {
    this.scheduleCache.set(schedule.npcId, schedule);
    logger.info(`Schedule updated for NPC: ${schedule.npcName}`);
  }

  /**
   * Remove an NPC schedule
   * @param npcId - The NPC's unique identifier
   */
  static removeNPCSchedule(npcId: string): void {
    this.scheduleCache.delete(npcId);
    logger.info(`Schedule removed for NPC: ${npcId}`);
  }

  /**
   * Get upcoming activities for an NPC
   * @param npcId - The NPC's unique identifier
   * @param count - Number of upcoming activities to return
   * @returns Array of upcoming schedule entries
   */
  static getUpcomingActivities(npcId: string, count: number = 3): ScheduleEntry[] {
    const npcSchedule = this.getNPCSchedule(npcId);
    if (!npcSchedule) {
      return [];
    }

    const currentHour = TimeService.getCurrentHour();
    const schedule = npcSchedule.defaultSchedule;
    const upcoming: ScheduleEntry[] = [];

    // Sort schedule by hour
    const sortedSchedule = [...schedule].sort((a, b) => a.hour - b.hour);

    // Find entries after current hour
    for (const entry of sortedSchedule) {
      if (entry.hour > currentHour && upcoming.length < count) {
        upcoming.push(entry);
      }
    }

    // If we don't have enough, wrap around to tomorrow
    if (upcoming.length < count) {
      for (const entry of sortedSchedule) {
        if (entry.hour <= currentHour && upcoming.length < count) {
          upcoming.push(entry);
        }
      }
    }

    return upcoming;
  }

  /**
   * Find NPCs by activity
   * @param activity - The activity to search for
   * @param hour - Optional specific hour (defaults to current)
   * @returns Array of NPCs performing this activity
   */
  static getNPCsByActivity(activity: NPCActivity, hour?: number): NPCActivityState[] {
    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();
    const npcsWithActivity: NPCActivityState[] = [];

    for (const npcSchedule of this.getAllNPCSchedules()) {
      const activityState = this.getCurrentActivity(npcSchedule.npcId, currentHour);

      if (activityState && activityState.currentActivity === activity) {
        npcsWithActivity.push(activityState);
      }
    }

    return npcsWithActivity;
  }

  /**
   * Get statistics about current NPC activities
   * @param hour - Optional specific hour (defaults to current)
   * @returns Activity statistics
   */
  static getActivityStatistics(hour?: number) {
    const currentHour = hour !== undefined ? hour : TimeService.getCurrentHour();
    const stats: { [key in NPCActivity]?: number } = {};
    const totalNPCs = this.scheduleCache.size;

    for (const npcSchedule of this.getAllNPCSchedules()) {
      const activity = this.getCurrentActivity(npcSchedule.npcId, currentHour);

      if (activity) {
        const activityType = activity.currentActivity;
        stats[activityType] = (stats[activityType] || 0) + 1;
      }
    }

    return {
      hour: currentHour,
      totalNPCs,
      byActivity: stats,
      mostCommonActivity:
        Object.entries(stats).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    };
  }

  /**
   * Debug: Log current state of all NPCs
   */
  static logCurrentState(): void {
    const currentHour = TimeService.getCurrentHour();
    logger.info(`=== NPC Schedule State (Hour ${currentHour}) ===`);

    const locationMap = this.getAllNPCLocations();

    locationMap.forEach((npcs, location) => {
      logger.info(`\nLocation: ${location}`);
      npcs.forEach(npc => {
        logger.info(
          `  - ${npc.npcName}: ${npc.currentActivity} (${npc.isAvailable ? 'Available' : 'Busy'})`
        );
      });
    });

    const stats = this.getActivityStatistics();
    logger.info('\nActivity Statistics:', stats);
  }
}

// Initialize the service when module is loaded
ScheduleService.initialize();

export default ScheduleService;
