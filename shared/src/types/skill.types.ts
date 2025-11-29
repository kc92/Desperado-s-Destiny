/**
 * Skill System Types
 * Types for the skill training and progression system
 */

/**
 * Skill categories aligned with Destiny Deck suits
 */
export enum SkillCategory {
  COMBAT = 'COMBAT',     // Spades - Physical combat skills
  CUNNING = 'CUNNING',   // Clubs - Deception, stealth, manipulation
  SPIRIT = 'SPIRIT',     // Hearts - Social, charisma, leadership
  CRAFT = 'CRAFT',       // Diamonds - Crafting, trade, technical skills
}

/**
 * Destiny Deck suits that skills provide bonuses to
 */
export enum DestinySuit {
  SPADES = 'SPADES',     // Combat challenges
  HEARTS = 'HEARTS',     // Social/Spirit challenges
  CLUBS = 'CLUBS',       // Cunning/Deception challenges
  DIAMONDS = 'DIAMONDS', // Craft/Trade challenges
}

/**
 * Base skill definition
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  suit: DestinySuit;
  icon: string; // Emoji icon
  maxLevel: number;
  baseTrainingTime: number; // Base training time in seconds
}

/**
 * Character's skill data (level, XP, etc.)
 */
export interface SkillData {
  skillId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

/**
 * Training status for a skill
 */
export interface TrainingStatus {
  skillId: string;
  startedAt: Date;
  completesAt: Date;
  xpToGain: number;
}

/**
 * Skill level up result (matches server response from SkillService.completeTraining)
 */
export interface SkillLevelUpResult {
  skillId: string;
  oldLevel: number;
  newLevel: number;
  xpAwarded: number;
  leveledUp: boolean;
  newXP: number;
  xpToNextLevel: number;
}

/**
 * Suit bonuses from skills
 */
export interface SuitBonuses {
  SPADES: number;
  HEARTS: number;
  CLUBS: number;
  DIAMONDS: number;
}

/**
 * Detailed suit bonus breakdown
 */
export interface SuitBonusDetail {
  suit: DestinySuit;
  total: number;
  skills: Array<{
    skillName: string;
    bonus: number;
  }>;
}

/**
 * Response from GET /api/skills
 */
export interface SkillsResponse {
  skills: Skill[];
  characterSkills: SkillData[];
  currentTraining: TrainingStatus | null;
  bonuses: SuitBonuses;
}

/**
 * Response from POST /api/skills/:skillId/train
 */
export interface StartTrainingResponse {
  training: TrainingStatus;
  timeRemaining: number;
  message: string;
}

/**
 * Response from POST /api/skills/complete-training
 */
export interface CompleteTrainingResponse {
  result: SkillLevelUpResult;
  bonuses: SuitBonuses;
  message: string;
}

/**
 * Combined skill info for UI display
 */
export interface SkillDisplayInfo {
  skill: Skill;
  data: SkillData;
  isTraining: boolean;
  canTrain: boolean;
  isMaxLevel: boolean;
  trainingTimeForNextLevel: number; // in seconds
  bonusPerLevel: number; // +1 per level
  tier: string;
  nextUnlock?: SkillUnlockInfo;
}

/**
 * Skill unlock information for UI display
 */
export interface SkillUnlockInfo {
  level: number;
  name: string;
  description: string;
  type: 'action' | 'ability' | 'bonus' | 'recipe';
}

/**
 * Tier progression info
 */
export interface TierProgressInfo {
  currentTier: string;
  nextTier: string | null;
  levelToNextTier: number | null;
  progressToNextTier: number; // percentage
}
