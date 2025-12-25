/**
 * Player Event Service
 *
 * Handles player-triggered random events based on:
 * - Wanted level (bounty hunter ambush)
 * - Time of day (night bandit attack)
 * - Reputation with factions (hostile/friendly encounters)
 * - Random chance (mysterious stranger)
 */

import { Character, ICharacter, PlayerEventStats } from '../models/Character.model';
import { WorldState, IWorldState, TimeOfDay } from '../models/WorldState.model';
import { EncounterService } from './encounter.service';
import { SecureRNG } from './base/SecureRNG';
import { safeAchievementUpdate } from '../utils/achievementUtils';
import { broadcastEvent } from '../config/socket';
import logger from '../utils/logger';

// Default stats for new characters
const DEFAULT_EVENT_STATS: PlayerEventStats = {
  nightTravels: 0,
  mysteriousEncounters: 0,
  bountyHunterSurvived: 0,
  weatherHazardsSurvived: 0,
  hostileFactionEncounters: 0,
  friendlyFactionGifts: 0,
  eventsTotal: 0,
};

// ============================================================================
// TYPES
// ============================================================================

export interface PlayerEventTrigger {
  type: 'bounty_hunter' | 'night_bandit' | 'hostile_faction' | 'friendly_faction' | 'mysterious_stranger' | 'weather_hazard';
  chance: number; // 0-100
  condition: (character: ICharacter, worldState: IWorldState | null) => boolean;
  encounter?: {
    type: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    rewards?: {
      gold?: number;
      xp?: number;
    };
  };
  message: string;
}

export interface PlayerEventResult {
  triggered: boolean;
  eventType?: string;
  message?: string;
  encounterId?: string;
  rewards?: {
    gold?: number;
    xp?: number;
  };
}

// ============================================================================
// EVENT DEFINITIONS
// ============================================================================

const PLAYER_EVENT_TRIGGERS: PlayerEventTrigger[] = [
  // Bounty Hunter Ambush - triggers when wanted level is 3+
  {
    type: 'bounty_hunter',
    chance: 25, // 25% chance when conditions met
    condition: (char, _ws) => char.wantedLevel >= 3,
    encounter: {
      type: 'bounty_hunter_ambush',
      difficulty: 'hard',
      rewards: { gold: 100, xp: 50 },
    },
    message: 'A bounty hunter has tracked you down!',
  },

  // Night Bandit Attack - triggers when traveling at night
  {
    type: 'night_bandit',
    chance: 15, // 15% chance when traveling at night
    condition: (_char, ws) => {
      if (!ws) return false;
      return ws.timeOfDay === TimeOfDay.NIGHT;
    },
    encounter: {
      type: 'bandit_ambush',
      difficulty: 'medium',
      rewards: { gold: 75, xp: 35 },
    },
    message: 'Bandits emerge from the shadows!',
  },

  // Mysterious Stranger - small chance on any travel
  {
    type: 'mysterious_stranger',
    chance: 5, // 5% chance
    condition: () => true, // Always possible
    message: 'A mysterious stranger approaches you...',
  },

  // Weather Hazard - triggers during severe weather
  {
    type: 'weather_hazard',
    chance: 20,
    condition: (_char, ws) => {
      if (!ws) return false;
      const severeWeathers = ['DUST_STORM', 'BLIZZARD', 'TORNADO', 'FLASH_FLOOD'];
      return severeWeathers.includes(ws.currentWeather as string);
    },
    message: 'The harsh weather catches you off guard!',
  },
];

// ============================================================================
// SERVICE
// ============================================================================

export class PlayerEventService {
  /**
   * Check and potentially trigger a player event during travel
   * Call this after the base encounter check in LocationService
   */
  static async checkForPlayerEvent(
    characterId: string,
    locationId: string
  ): Promise<PlayerEventResult> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { triggered: false };
      }

      // Get world state for time-based conditions
      const worldState = await WorldState.findOne();

      // Check each trigger in order
      for (const trigger of PLAYER_EVENT_TRIGGERS) {
        // Check if condition is met
        if (!trigger.condition(character, worldState)) {
          continue;
        }

        // Roll for chance
        if (!SecureRNG.chance(trigger.chance / 100)) {
          continue;
        }

        // Event triggered!
        logger.info(`Player event triggered: ${trigger.type} for character ${characterId}`);

        // Handle different event types
        switch (trigger.type) {
          case 'bounty_hunter':
            return this.handleBountyHunterAmbush(character, locationId);

          case 'night_bandit':
            return this.handleNightBandit(character, locationId);

          case 'mysterious_stranger':
            return this.handleMysteriousStranger(character, locationId);

          case 'weather_hazard':
            return this.handleWeatherHazard(character);

          default:
            return {
              triggered: true,
              eventType: trigger.type,
              message: trigger.message,
            };
        }
      }

      return { triggered: false };
    } catch (error) {
      logger.error('Error checking for player event:', error);
      return { triggered: false };
    }
  }

  /**
   * Handle bounty hunter ambush
   */
  private static async handleBountyHunterAmbush(
    character: ICharacter,
    locationId: string
  ): Promise<PlayerEventResult> {
    try {
      // Create a bounty hunter encounter
      const encounter = await EncounterService.rollForRandomEncounter(
        character._id.toString(),
        locationId,
        'high' // High danger for bounty hunters
      );

      if (encounter) {
        // Track event stat
        void this.incrementEventStat(character._id.toString(), 'bountyHunterSurvived');

        // Broadcast event to all (client filters by characterId)
        broadcastEvent('player_event', {
          characterId: character._id.toString(),
          type: 'bounty_hunter_ambush',
          message: 'A bounty hunter has tracked you down! Your wanted level has attracted unwanted attention.',
          encounterId: encounter._id,
        });

        return {
          triggered: true,
          eventType: 'bounty_hunter',
          message: 'A bounty hunter has tracked you down!',
          encounterId: encounter._id?.toString(),
        };
      }

      return { triggered: false };
    } catch (error) {
      logger.error('Error handling bounty hunter ambush:', error);
      return { triggered: false };
    }
  }

  /**
   * Handle night bandit attack
   */
  private static async handleNightBandit(
    character: ICharacter,
    locationId: string
  ): Promise<PlayerEventResult> {
    try {
      const encounter = await EncounterService.rollForRandomEncounter(
        character._id.toString(),
        locationId,
        'medium'
      );

      if (encounter) {
        // Track event stat
        void this.incrementEventStat(character._id.toString(), 'nightTravels');
        // Track night travel for achievement (with safe error handling)
        safeAchievementUpdate(character._id.toString(), 'night_owl', 1, 'playerEvent:nightBandit');

        broadcastEvent('player_event', {
          characterId: character._id.toString(),
          type: 'night_bandit',
          message: 'Bandits emerge from the darkness! Traveling at night has its dangers.',
          encounterId: encounter._id,
        });

        return {
          triggered: true,
          eventType: 'night_bandit',
          message: 'Bandits emerge from the shadows!',
          encounterId: encounter._id?.toString(),
        };
      }

      return { triggered: false };
    } catch (error) {
      logger.error('Error handling night bandit:', error);
      return { triggered: false };
    }
  }

  /**
   * Handle mysterious stranger encounter
   */
  private static async handleMysteriousStranger(
    character: ICharacter,
    _locationId: string
  ): Promise<PlayerEventResult> {
    try {
      // Track event stat
      void this.incrementEventStat(character._id.toString(), 'mysteriousEncounters');
      // The mysterious stranger is a special encounter
      // For now, just trigger the achievement and notify player (with safe error handling)
      safeAchievementUpdate(character._id.toString(), 'mysterious_encounter', 1, 'playerEvent:mysteriousStranger');

      broadcastEvent('player_event', {
        characterId: character._id.toString(),
        type: 'mysterious_stranger',
        message: 'A mysterious stranger in a dark cloak approaches you. They seem to know more than they should...',
      });

      // Could trigger a special encounter or dialogue here
      // For now, just return the trigger
      return {
        triggered: true,
        eventType: 'mysterious_stranger',
        message: 'A mysterious stranger approaches you...',
      };
    } catch (error) {
      logger.error('Error handling mysterious stranger:', error);
      return { triggered: false };
    }
  }

  /**
   * Handle weather hazard
   */
  private static async handleWeatherHazard(character: ICharacter): Promise<PlayerEventResult> {
    try {
      // Track event stat
      void this.incrementEventStat(character._id.toString(), 'weatherHazardsSurvived');
      // Track storm survival achievement (with safe error handling)
      safeAchievementUpdate(character._id.toString(), 'storm_survivor', 1, 'playerEvent:weatherHazard');

      broadcastEvent('player_event', {
        characterId: character._id.toString(),
        type: 'weather_hazard',
        message: 'The severe weather takes its toll. You must seek shelter!',
      });

      return {
        triggered: true,
        eventType: 'weather_hazard',
        message: 'The harsh weather catches you off guard!',
      };
    } catch (error) {
      logger.error('Error handling weather hazard:', error);
      return { triggered: false };
    }
  }

  /**
   * Check for reputation-based events when entering a territory
   */
  static async checkReputationEvent(
    characterId: string,
    factionId: string,
    reputation: number
  ): Promise<PlayerEventResult> {
    try {
      // Hostile encounter for very low reputation
      if (reputation < -50 && SecureRNG.chance(0.15)) {
        // Track event stat
        void this.incrementEventStat(characterId, 'hostileFactionEncounters');

        broadcastEvent('player_event', {
          characterId,
          type: 'hostile_faction',
          message: `Members of ${factionId} recognize you as an enemy! They attack!`,
        });

        return {
          triggered: true,
          eventType: 'hostile_faction',
          message: 'Faction members attack you on sight!',
        };
      }

      // Friendly encounter for very high reputation
      if (reputation > 75 && SecureRNG.chance(0.10)) {
        // Track event stat
        void this.incrementEventStat(characterId, 'friendlyFactionGifts');

        broadcastEvent('player_event', {
          characterId,
          type: 'friendly_faction',
          message: `A member of ${factionId} approaches with a gift to thank you for your support.`,
        });

        return {
          triggered: true,
          eventType: 'friendly_faction',
          message: 'A faction member offers you a gift!',
          rewards: {
            gold: Math.floor(50 + reputation / 2),
          },
        };
      }

      return { triggered: false };
    } catch (error) {
      logger.error('Error checking reputation event:', error);
      return { triggered: false };
    }
  }

  /**
   * Increment a specific event stat counter
   * @private
   */
  private static async incrementEventStat(
    characterId: string,
    statField: keyof PlayerEventStats
  ): Promise<void> {
    try {
      const updateQuery: Record<string, number> = {
        [`playerEventStats.${statField}`]: 1,
        ['playerEventStats.eventsTotal']: 1,
      };

      // Initialize playerEventStats if it doesn't exist, then increment
      await Character.findByIdAndUpdate(
        characterId,
        {
          $inc: updateQuery,
          $setOnInsert: {
            playerEventStats: DEFAULT_EVENT_STATS
          }
        },
        { upsert: false }
      );
    } catch (error) {
      logger.error('Failed to increment event stat:', { characterId, statField, error });
    }
  }

  /**
   * Get player event history count (for achievements)
   */
  static async getPlayerEventStats(characterId: string): Promise<PlayerEventStats> {
    try {
      const character = await Character.findById(characterId).select('playerEventStats').lean();
      if (!character || !character.playerEventStats) {
        return { ...DEFAULT_EVENT_STATS };
      }
      return character.playerEventStats;
    } catch (error) {
      logger.error('Failed to get player event stats:', { characterId, error });
      return { ...DEFAULT_EVENT_STATS };
    }
  }
}

export default PlayerEventService;
