/**
 * NPC Mood Types
 *
 * Types for the dynamic NPC mood system where NPCs react to weather, time, events, and player actions
 */

/**
 * Available mood types for NPCs
 */
export enum MoodType {
  HAPPY = 'happy',
  CONTENT = 'content',
  NEUTRAL = 'neutral',
  ANNOYED = 'annoyed',
  ANGRY = 'angry',
  SAD = 'sad',
  FEARFUL = 'fearful',
  EXCITED = 'excited',
  SUSPICIOUS = 'suspicious',
  GRATEFUL = 'grateful',
  DRUNK = 'drunk',
}

/**
 * Factor types that affect NPC moods
 */
export type MoodFactorType = 'weather' | 'event' | 'player_action' | 'time' | 'random' | 'relationship';

/**
 * Individual factor affecting an NPC's mood
 */
export interface MoodFactor {
  /** Type of factor affecting mood */
  type: MoodFactorType;
  /** Source identifier (e.g., "rain", "bank_robbery", "player_helped") */
  source: string;
  /** The mood this factor pushes toward */
  effect: MoodType;
  /** How strongly this affects mood (1-10) */
  intensity: number;
  /** When this factor expires (temporary factors only) */
  expiresAt?: Date;
}

/**
 * Complete mood state for an NPC
 */
export interface NPCMoodState {
  /** NPC identifier */
  npcId: string;
  /** Current active mood */
  currentMood: MoodType;
  /** Intensity of current mood (1-10) */
  moodIntensity: number;
  /** All factors currently affecting mood */
  moodFactors: MoodFactor[];
  /** Baseline mood from NPC personality */
  baseMood: MoodType;
  /** Last time mood was updated */
  lastUpdated: Date;
}

/**
 * Gameplay effects of an NPC's mood
 */
export interface MoodEffects {
  /** Price modifier (0.8 = 20% discount, 1.2 = 20% markup) */
  priceModifier: number;
  /** Dialogue tone identifier */
  dialogueTone: 'friendly' | 'neutral' | 'curt' | 'hostile' | 'fearful' | 'excited' | 'drunk';
  /** Whether NPC will offer quests */
  questAvailability: boolean;
  /** Modifier to trust gain/loss (-1.0 to 1.0) */
  trustModifier: number;
  /** Combat aggression modifier for hostile NPCs (0.5 to 2.0) */
  combatAggression: number;
  /** Description of current mood for display */
  moodDescription: string;
}

/**
 * NPC personality type (determines base mood and mood volatility)
 */
export enum PersonalityType {
  CHEERFUL = 'cheerful',      // Base: happy, resists negative moods
  GRUMPY = 'grumpy',          // Base: annoyed, hard to make happy
  NERVOUS = 'nervous',        // Base: fearful, reacts strongly to danger
  STOIC = 'stoic',            // Base: neutral, slow to change mood
  VOLATILE = 'volatile',      // Mood swings rapidly based on events
  MELANCHOLIC = 'melancholic', // Base: sad, brief happy moments
  SUSPICIOUS = 'suspicious',  // Base: suspicious, distrustful
}

/**
 * NPC personality definition
 */
export interface NPCPersonality {
  /** NPC identifier */
  npcId: string;
  /** Display name of the NPC */
  name: string;
  /** NPC role/occupation */
  role: string;
  /** Personality type */
  personality: PersonalityType;
  /** Base/default mood */
  baseMood: MoodType;
  /** How quickly mood changes (0.5 = slow, 2.0 = fast) */
  moodVolatility: number;
  /** Weather types that affect this NPC positively */
  likesWeather?: string[];
  /** Weather types that affect this NPC negatively */
  dislikesWeather?: string[];
  /** Special behavior notes */
  notes?: string;
}

/**
 * Mood calculation weights
 */
export interface MoodCalculationWeights {
  /** Weight of base personality mood */
  baseMoodWeight: number;
  /** Weight of time-based factors */
  timeWeight: number;
  /** Weight of weather factors */
  weatherWeight: number;
  /** Weight of event factors */
  eventWeight: number;
  /** Weight of player relationship factors */
  relationshipWeight: number;
}

/**
 * World event that affects NPC moods
 */
export interface MoodAffectingEvent {
  /** Event type identifier */
  eventType: string;
  /** Event name */
  eventName: string;
  /** Location or region affected */
  locationId: string;
  /** Mood this event triggers */
  triggeredMood: MoodType;
  /** Intensity of mood effect */
  intensity: number;
  /** How long this event affects moods (minutes) */
  durationMinutes: number;
  /** NPC roles particularly affected (empty = all NPCs) */
  affectedRoles?: string[];
}

/**
 * Player action that affects NPC mood
 */
export interface PlayerMoodAction {
  /** Character performing the action */
  characterId: string;
  /** NPC being affected */
  npcId: string;
  /** Type of action */
  actionType: 'helped' | 'harmed' | 'stole_from' | 'gift' | 'completed_quest' | 'attacked';
  /** Resulting mood */
  resultingMood: MoodType;
  /** Intensity of effect */
  intensity: number;
  /** How long this lasts (minutes) */
  durationMinutes: number;
}

/**
 * API response for getting NPC mood
 */
export interface GetNPCMoodResponse {
  success: boolean;
  data: {
    moodState: NPCMoodState;
    effects: MoodEffects;
  };
}

/**
 * API response for getting all NPC moods in a location
 */
export interface GetLocationMoodsResponse {
  success: boolean;
  data: {
    locationId: string;
    npcs: Array<{
      npcId: string;
      name: string;
      role: string;
      mood: MoodType;
      intensity: number;
      effects: MoodEffects;
    }>;
  };
}

/**
 * API request to apply mood factor
 */
export interface ApplyMoodFactorRequest {
  npcId: string;
  factor: MoodFactor;
}

/**
 * API request to trigger event-based mood changes
 */
export interface TriggerEventMoodRequest {
  eventType: string;
  locationId: string;
  intensity?: number;
  durationMinutes?: number;
}
