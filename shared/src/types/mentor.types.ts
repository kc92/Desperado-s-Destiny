/**
 * Mentor Types
 *
 * Type definitions for the mentor system where high-level NPCs can mentor players
 */

/**
 * Mentor specialties - different types of mentors available
 */
export enum MentorSpecialty {
  GUNSLINGER = 'gunslinger',      // Combat abilities
  OUTLAW = 'outlaw',              // Crime abilities
  LAWMAN = 'lawman',              // Law/bounty abilities
  SHAMAN = 'shaman',              // Supernatural abilities
  TRADER = 'trader',              // Economy abilities
  WARRIOR = 'warrior',            // Combat (Coalition style)
  CRAFTSMAN = 'craftsman',        // Crafting abilities
  DIPLOMAT = 'diplomat',          // Social abilities
  HEALER = 'healer',              // Medical abilities
  GAMBLER = 'gambler'             // Gambling abilities
}

/**
 * Trust levels for mentor relationships
 */
export enum MentorTrustLevel {
  ACQUAINTANCE = 1,   // First meeting, basic ability
  STUDENT = 2,        // Regular training, second ability
  APPRENTICE = 3,     // Serious study, third ability
  DISCIPLE = 4,       // Deep bond, fourth ability
  HEIR = 5            // Full mastery, legendary ability
}

/**
 * Ability types
 */
export type AbilityType = 'passive' | 'active' | 'unlock';

/**
 * Effect that an ability has on character stats
 */
export interface AbilityEffect {
  stat: string;
  modifier: number;
  description: string;
}

/**
 * Mentor ability unlocked at different trust levels
 */
export interface MentorAbility {
  id: string;
  name: string;
  description: string;
  trustRequired: MentorTrustLevel;
  type: AbilityType;
  effects: AbilityEffect[];
  cooldown?: number;            // For active abilities (in minutes)
  energyCost?: number;          // Energy required to use (for active abilities)
}

/**
 * Requirements to become a mentee
 */
export interface MentorRequirements {
  minLevel: number;
  minFactionRep?: number;
  minNpcTrust: number;
  completedQuests?: string[];
  skills?: { [skillId: string]: number };
  noActiveBounty?: boolean;     // For lawman mentors
  minCriminalRep?: number;      // For outlaw mentors
}

/**
 * Quest in the mentor's storyline
 */
export interface MentorStorylineQuest {
  questId: string;
  trustLevelUnlock: MentorTrustLevel;
  title: string;
  description: string;
}

/**
 * Mentor's personal storyline
 */
export interface MentorStoryline {
  introduction: string;
  background: string;
  quests: MentorStorylineQuest[];
  finalChallenge: string;
  legacy: string;
}

/**
 * Mentor dialogue for different situations
 */
export interface MentorDialogue {
  greeting: string;
  introduction: string;
  training: string[];
  success: string[];
  failure: string[];
  farewell: string;
}

/**
 * Full mentor definition
 */
export interface Mentor {
  mentorId: string;
  npcId: string;
  npcName: string;
  specialty: MentorSpecialty;
  faction: string;
  location: string;
  requirements: MentorRequirements;
  abilities: MentorAbility[];
  storyline: MentorStoryline;
  dialogue: MentorDialogue;
  conflictsWith?: MentorSpecialty[];  // Mentors that conflict with this one
}

/**
 * Active mentorship relationship
 */
export interface Mentorship {
  characterId: string;
  mentorId: string;
  currentTrustLevel: MentorTrustLevel;
  trustProgress: number;          // 0-100, progress to next level
  unlockedAbilities: string[];    // Ability IDs
  activeAbilityCooldowns: Map<string, Date>;
  tasksCompleted: number;
  storylineProgress: string[];    // Quest IDs completed
  startedAt: Date;
  lastInteraction: Date;
}

/**
 * Response when requesting mentorship
 */
export interface MentorshipRequestResponse {
  success: boolean;
  message: string;
  mentorship?: Mentorship;
  mentor?: Mentor;
}

/**
 * Response when using an ability
 */
export interface AbilityUseResponse {
  success: boolean;
  message: string;
  ability?: MentorAbility;
  cooldownUntil?: Date;
  effects?: AbilityEffect[];
}

/**
 * Progress update for mentor relationship
 */
export interface MentorProgressUpdate {
  characterId: string;
  mentorId: string;
  previousTrustLevel: MentorTrustLevel;
  newTrustLevel: MentorTrustLevel;
  newAbilitiesUnlocked: MentorAbility[];
  message: string;
}
