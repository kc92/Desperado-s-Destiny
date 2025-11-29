/**
 * Mood Service
 *
 * Manages NPC moods that react to weather, time, events, and player actions
 * Moods affect prices, dialogue, quest availability, and NPC behavior
 */

import {
  MoodType,
  MoodFactor,
  MoodFactorType,
  NPCMoodState,
  MoodEffects,
  PersonalityType,
  MoodAffectingEvent,
  PlayerMoodAction,
} from '@desperados/shared';
import { WeatherType } from '../models/WorldState.model';
import { WeatherService } from './weather.service';
import { TimeService } from './time.service';
import { getNPCPersonality, DEFAULT_NPC_PERSONALITY } from '../data/npcPersonalities';
import logger from '../utils/logger';

/**
 * Mood effects configuration for each mood type
 */
const MOOD_EFFECT_TABLE: Record<MoodType, MoodEffects> = {
  [MoodType.HAPPY]: {
    priceModifier: 0.9,
    dialogueTone: 'friendly',
    questAvailability: true,
    trustModifier: 0.5,
    combatAggression: 0.7,
    moodDescription: 'The NPC is in high spirits, smiling and welcoming.',
  },
  [MoodType.CONTENT]: {
    priceModifier: 0.95,
    dialogueTone: 'friendly',
    questAvailability: true,
    trustModifier: 0.2,
    combatAggression: 0.9,
    moodDescription: 'The NPC seems satisfied and at peace.',
  },
  [MoodType.NEUTRAL]: {
    priceModifier: 1.0,
    dialogueTone: 'neutral',
    questAvailability: true,
    trustModifier: 0.0,
    combatAggression: 1.0,
    moodDescription: 'The NPC maintains a professional demeanor.',
  },
  [MoodType.ANNOYED]: {
    priceModifier: 1.1,
    dialogueTone: 'curt',
    questAvailability: false,
    trustModifier: -0.2,
    combatAggression: 1.2,
    moodDescription: 'The NPC is clearly irritated and short-tempered.',
  },
  [MoodType.ANGRY]: {
    priceModifier: 1.2,
    dialogueTone: 'hostile',
    questAvailability: false,
    trustModifier: -0.5,
    combatAggression: 1.5,
    moodDescription: 'The NPC is visibly angry, speaking harshly.',
  },
  [MoodType.SAD]: {
    priceModifier: 1.0,
    dialogueTone: 'neutral',
    questAvailability: false,
    trustModifier: 0.1,
    combatAggression: 0.8,
    moodDescription: 'The NPC looks downcast and melancholic.',
  },
  [MoodType.FEARFUL]: {
    priceModifier: 0.95,
    dialogueTone: 'fearful',
    questAvailability: true,
    trustModifier: -0.3,
    combatAggression: 0.6,
    moodDescription: 'The NPC appears nervous, eyes darting around.',
  },
  [MoodType.EXCITED]: {
    priceModifier: 1.05,
    dialogueTone: 'excited',
    questAvailability: true,
    trustModifier: 0.3,
    combatAggression: 1.1,
    moodDescription: 'The NPC is energized and enthusiastic.',
  },
  [MoodType.SUSPICIOUS]: {
    priceModifier: 1.15,
    dialogueTone: 'curt',
    questAvailability: false,
    trustModifier: -0.4,
    combatAggression: 1.3,
    moodDescription: 'The NPC watches you with distrust and suspicion.',
  },
  [MoodType.GRATEFUL]: {
    priceModifier: 0.85,
    dialogueTone: 'friendly',
    questAvailability: true,
    trustModifier: 0.8,
    combatAggression: 0.5,
    moodDescription: 'The NPC looks at you with genuine gratitude.',
  },
  [MoodType.DRUNK]: {
    priceModifier: 0.8,
    dialogueTone: 'drunk',
    questAvailability: false,
    trustModifier: 0.0,
    combatAggression: 1.4,
    moodDescription: 'The NPC is clearly intoxicated, swaying and slurring.',
  },
};

/**
 * Weather mood effects - how weather affects NPC moods
 */
const WEATHER_MOOD_EFFECTS: Record<WeatherType, { mood: MoodType; intensity: number }> = {
  [WeatherType.CLEAR]: { mood: MoodType.HAPPY, intensity: 2 },
  [WeatherType.CLOUDY]: { mood: MoodType.NEUTRAL, intensity: 1 },
  [WeatherType.RAIN]: { mood: MoodType.SAD, intensity: 3 },
  [WeatherType.DUST_STORM]: { mood: MoodType.ANNOYED, intensity: 5 },
  [WeatherType.SANDSTORM]: { mood: MoodType.ANGRY, intensity: 6 },
  [WeatherType.HEAT_WAVE]: { mood: MoodType.ANNOYED, intensity: 4 },
  [WeatherType.COLD_SNAP]: { mood: MoodType.ANNOYED, intensity: 3 },
  [WeatherType.FOG]: { mood: MoodType.SUSPICIOUS, intensity: 3 },
  [WeatherType.THUNDERSTORM]: { mood: MoodType.FEARFUL, intensity: 5 },
  [WeatherType.SUPERNATURAL_MIST]: { mood: MoodType.FEARFUL, intensity: 7 },
  [WeatherType.THUNDERBIRD_STORM]: { mood: MoodType.FEARFUL, intensity: 6 },
  [WeatherType.REALITY_DISTORTION]: { mood: MoodType.FEARFUL, intensity: 9 },
};

/**
 * Time period mood effects - how time of day affects moods
 */
const TIME_MOOD_EFFECTS: Record<string, { mood: MoodType; intensity: number }> = {
  DAWN: { mood: MoodType.CONTENT, intensity: 2 },
  MORNING: { mood: MoodType.CONTENT, intensity: 2 },
  NOON: { mood: MoodType.NEUTRAL, intensity: 1 },
  AFTERNOON: { mood: MoodType.NEUTRAL, intensity: 1 },
  EVENING: { mood: MoodType.HAPPY, intensity: 2 },
  DUSK: { mood: MoodType.CONTENT, intensity: 2 },
  NIGHT: { mood: MoodType.NEUTRAL, intensity: 1 },
  MIDNIGHT: { mood: MoodType.SUSPICIOUS, intensity: 2 },
  WITCHING_HOUR: { mood: MoodType.FEARFUL, intensity: 3 },
};

export class MoodService {
  /**
   * In-memory mood state cache
   * In production, this should be stored in the database
   */
  private static moodStates: Map<string, NPCMoodState> = new Map();

  /**
   * Get current mood state for an NPC
   */
  static async getNPCMood(npcId: string): Promise<NPCMoodState> {
    // Check cache first
    if (this.moodStates.has(npcId)) {
      const cached = this.moodStates.get(npcId)!;
      // If cached mood is recent (< 5 minutes), return it
      if (Date.now() - cached.lastUpdated.getTime() < 5 * 60 * 1000) {
        return cached;
      }
    }

    // Calculate fresh mood
    return this.calculateMood(npcId);
  }

  /**
   * Calculate mood for an NPC based on all factors
   */
  static async calculateMood(npcId: string): Promise<NPCMoodState> {
    const personality = getNPCPersonality(npcId) || DEFAULT_NPC_PERSONALITY;
    const existingState = this.moodStates.get(npcId);

    // Get current factors
    const factors = existingState?.moodFactors || [];
    const now = new Date();

    // Remove expired factors
    const activeFactors = factors.filter(f => !f.expiresAt || f.expiresAt > now);

    // Add weather factor
    const weatherFactor = await this.getWeatherMoodFactor(npcId, personality);
    if (weatherFactor) {
      activeFactors.push(weatherFactor);
    }

    // Add time factor
    const timeFactor = this.getTimeMoodFactor();
    if (timeFactor) {
      activeFactors.push(timeFactor);
    }

    // Calculate dominant mood
    const { dominantMood, intensity } = this.determineDominantMood(
      personality,
      activeFactors
    );

    const moodState: NPCMoodState = {
      npcId,
      currentMood: dominantMood,
      moodIntensity: intensity,
      moodFactors: activeFactors,
      baseMood: personality.baseMood,
      lastUpdated: now,
    };

    // Cache the mood state
    this.moodStates.set(npcId, moodState);

    logger.debug(
      `Calculated mood for ${personality.name}: ${dominantMood} (intensity: ${intensity})`
    );

    return moodState;
  }

  /**
   * Get weather-based mood factor for NPC
   */
  private static async getWeatherMoodFactor(
    npcId: string,
    personality: any
  ): Promise<MoodFactor | null> {
    try {
      // For this implementation, we'll use global weather
      // In production, you'd get weather for NPC's specific location
      const allWeather = await WeatherService.getAllRegionalWeather();
      if (allWeather.length === 0) return null;

      // Use first region's weather (simplified)
      const weather = allWeather[0];
      const weatherEffect = WEATHER_MOOD_EFFECTS[weather.currentWeather];

      // Check if NPC has weather preferences
      let intensity = weatherEffect.intensity;
      let mood = weatherEffect.mood;

      if (personality.likesWeather?.includes(weather.currentWeather)) {
        mood = MoodType.HAPPY;
        intensity = 5;
      } else if (personality.dislikesWeather?.includes(weather.currentWeather)) {
        intensity = Math.min(10, intensity + 2);
      }

      return {
        type: 'weather',
        source: weather.currentWeather,
        effect: mood,
        intensity,
        expiresAt: weather.endsAt,
      };
    } catch (error) {
      logger.error('Failed to get weather mood factor:', error);
      return null;
    }
  }

  /**
   * Get time-based mood factor
   */
  private static getTimeMoodFactor(): MoodFactor | null {
    try {
      const timeState = TimeService.getCurrentTimeState();
      const timeEffect = TIME_MOOD_EFFECTS[timeState.currentPeriod];

      if (!timeEffect) return null;

      return {
        type: 'time',
        source: timeState.currentPeriod,
        effect: timeEffect.mood,
        intensity: timeEffect.intensity,
        // Time factors don't expire - they change when time changes
      };
    } catch (error) {
      logger.error('Failed to get time mood factor:', error);
      return null;
    }
  }

  /**
   * Determine dominant mood from personality and factors
   */
  private static determineDominantMood(
    personality: any,
    factors: MoodFactor[]
  ): { dominantMood: MoodType; intensity: number } {
    // Start with base mood
    const moodScores: Map<MoodType, number> = new Map();
    const baseWeight = 3.0 / personality.moodVolatility; // More volatile = less base influence

    moodScores.set(personality.baseMood, baseWeight);

    // Add factor influences
    for (const factor of factors) {
      const currentScore = moodScores.get(factor.effect) || 0;
      const factorWeight = factor.intensity * personality.moodVolatility;
      moodScores.set(factor.effect, currentScore + factorWeight);
    }

    // Find dominant mood
    let dominantMood = personality.baseMood;
    let highestScore = 0;
    let totalScore = 0;

    for (const [mood, score] of moodScores.entries()) {
      totalScore += score;
      if (score > highestScore) {
        highestScore = score;
        dominantMood = mood;
      }
    }

    // Calculate intensity (1-10) based on score ratio
    const intensity = Math.min(10, Math.max(1, Math.round((highestScore / totalScore) * 10)));

    return { dominantMood, intensity };
  }

  /**
   * Apply a mood factor to an NPC
   */
  static async applyMoodFactor(npcId: string, factor: MoodFactor): Promise<NPCMoodState> {
    const currentMood = await this.getNPCMood(npcId);

    // Add the new factor
    currentMood.moodFactors.push(factor);

    // Recalculate mood
    return this.calculateMood(npcId);
  }

  /**
   * Get gameplay effects of current mood
   */
  static getMoodEffects(mood: MoodType, intensity: number): MoodEffects {
    const baseEffects = MOOD_EFFECT_TABLE[mood];

    // Intensity affects price modifier magnitude
    const intensityFactor = intensity / 5; // 5 is baseline intensity
    const priceVariation = (baseEffects.priceModifier - 1.0) * intensityFactor;
    const adjustedPrice = 1.0 + priceVariation;

    return {
      ...baseEffects,
      priceModifier: Math.max(0.5, Math.min(2.0, adjustedPrice)),
    };
  }

  /**
   * Update all NPC moods (batch operation)
   */
  static async updateWorldMoods(): Promise<{ updated: number }> {
    let updated = 0;

    // Update all cached NPCs
    for (const npcId of this.moodStates.keys()) {
      try {
        await this.calculateMood(npcId);
        updated++;
      } catch (error) {
        logger.error(`Failed to update mood for NPC ${npcId}:`, error);
      }
    }

    logger.info(`Updated moods for ${updated} NPCs`);
    return { updated };
  }

  /**
   * React to a world event
   */
  static async reactToEvent(event: MoodAffectingEvent): Promise<{ affected: number }> {
    let affected = 0;

    // Apply event to all relevant NPCs
    // For now, affects all cached NPCs
    // In production, filter by location and role
    for (const npcId of this.moodStates.keys()) {
      const personality = getNPCPersonality(npcId);
      if (!personality) continue;

      // Check if role is affected
      if (event.affectedRoles && event.affectedRoles.length > 0) {
        if (!event.affectedRoles.includes(personality.role)) {
          continue;
        }
      }

      const expiresAt = new Date(Date.now() + event.durationMinutes * 60 * 1000);

      const factor: MoodFactor = {
        type: 'event',
        source: event.eventType,
        effect: event.triggeredMood,
        intensity: event.intensity,
        expiresAt,
      };

      await this.applyMoodFactor(npcId, factor);
      affected++;
    }

    logger.info(
      `Event "${event.eventName}" affected ${affected} NPCs with ${event.triggeredMood} mood`
    );

    return { affected };
  }

  /**
   * Apply player action mood effect
   */
  static async applyPlayerAction(action: PlayerMoodAction): Promise<NPCMoodState> {
    const expiresAt = new Date(Date.now() + action.durationMinutes * 60 * 1000);

    const factor: MoodFactor = {
      type: 'player_action',
      source: `${action.actionType}_${action.characterId}`,
      effect: action.resultingMood,
      intensity: action.intensity,
      expiresAt,
    };

    return this.applyMoodFactor(action.npcId, factor);
  }

  /**
   * Decay mood factors (remove expired ones)
   */
  static async decayMoodFactors(): Promise<{ decayed: number }> {
    let decayed = 0;
    const now = new Date();

    for (const [npcId, moodState] of this.moodStates.entries()) {
      const beforeCount = moodState.moodFactors.length;
      moodState.moodFactors = moodState.moodFactors.filter(
        f => !f.expiresAt || f.expiresAt > now
      );
      const afterCount = moodState.moodFactors.length;

      if (beforeCount !== afterCount) {
        decayed += beforeCount - afterCount;
        // Recalculate mood after removing factors
        await this.calculateMood(npcId);
      }
    }

    if (decayed > 0) {
      logger.info(`Decayed ${decayed} mood factors`);
    }

    return { decayed };
  }

  /**
   * Trigger crime event moods (NPCs react to nearby crime)
   */
  static async reactToCrime(locationId: string, crimeType: string, severity: number): Promise<void> {
    const event: MoodAffectingEvent = {
      eventType: 'crime',
      eventName: crimeType,
      locationId,
      triggeredMood: MoodType.FEARFUL,
      intensity: Math.min(10, severity * 2),
      durationMinutes: 60,
      affectedRoles: [], // Affects all roles
    };

    await this.reactToEvent(event);

    // Lawmen become suspicious instead of fearful
    const lawmenEvent: MoodAffectingEvent = {
      ...event,
      triggeredMood: MoodType.SUSPICIOUS,
      affectedRoles: ['sheriff', 'deputy', 'marshal'],
    };

    await this.reactToEvent(lawmenEvent);
  }

  /**
   * Get mood description for display
   */
  static getMoodDescription(mood: MoodType, intensity: number, npcName: string): string {
    const effects = this.getMoodEffects(mood, intensity);
    const intensityWord = intensity >= 8 ? 'very' : intensity >= 5 ? 'quite' : 'somewhat';

    const moodDescriptions: Record<MoodType, string> = {
      [MoodType.HAPPY]: `${npcName} is ${intensityWord} cheerful today.`,
      [MoodType.CONTENT]: `${npcName} seems ${intensityWord} at peace.`,
      [MoodType.NEUTRAL]: `${npcName} maintains a professional demeanor.`,
      [MoodType.ANNOYED]: `${npcName} appears ${intensityWord} irritated.`,
      [MoodType.ANGRY]: `${npcName} looks ${intensityWord} angry.`,
      [MoodType.SAD]: `${npcName} seems ${intensityWord} downcast.`,
      [MoodType.FEARFUL]: `${npcName} appears ${intensityWord} nervous.`,
      [MoodType.EXCITED]: `${npcName} is ${intensityWord} energized.`,
      [MoodType.SUSPICIOUS]: `${npcName} watches you ${intensityWord} suspiciously.`,
      [MoodType.GRATEFUL]: `${npcName} looks at you with ${intensityWord} gratitude.`,
      [MoodType.DRUNK]: `${npcName} is clearly intoxicated.`,
    };

    return moodDescriptions[mood] || effects.moodDescription;
  }

  /**
   * Clear all mood states (for testing)
   */
  static clearAllMoods(): void {
    this.moodStates.clear();
    logger.info('Cleared all NPC mood states');
  }
}
