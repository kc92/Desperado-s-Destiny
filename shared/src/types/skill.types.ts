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

// ============================================
// TOTAL LEVEL SYSTEM TYPES
// RuneScape-style Total Level (sum of all skills)
// ============================================

/**
 * Total Level display info for UI
 */
export interface TotalLevelInfo {
  /** Sum of all skill levels (30-2970) */
  totalLevel: number;
  /** Current milestone tier name */
  tier: string;
  /** Tier color for display */
  tierColor: string;
  /** Progress to next milestone (0-100) */
  progressToNextMilestone: number;
  /** Next milestone total level target */
  nextMilestoneLevel: number | null;
  /** Next milestone tier name */
  nextMilestoneTier: string | null;
  /** Unlocks at current milestone */
  currentUnlocks: string[];
}

/**
 * Breakdown of skills contributing to Total Level
 */
export interface TotalLevelBreakdown {
  /** Combat category total */
  combat: { count: number; levelSum: number; avgLevel: number };
  /** Cunning category total */
  cunning: { count: number; levelSum: number; avgLevel: number };
  /** Spirit category total */
  spirit: { count: number; levelSum: number; avgLevel: number };
  /** Craft category total */
  craft: { count: number; levelSum: number; avgLevel: number };
  /** Total across all categories */
  total: number;
}

// ============================================
// COMBAT LEVEL SYSTEM TYPES
// Derived from total combat XP earned (1-138)
// ============================================

/**
 * Combat Level display info for UI
 */
export interface CombatLevelInfo {
  /** Combat level (1-138) */
  level: number;
  /** Total combat XP earned */
  totalXp: number;
  /** XP needed for next level */
  xpToNextLevel: number;
  /** Progress to next level (0-100) */
  progressToNextLevel: number;
  /** Current title (e.g., "Gunslinger") */
  title: string | null;
  /** Next title to unlock */
  nextTitle: string | null;
  /** Level needed for next title */
  nextTitleLevel: number | null;
}

/**
 * Combat XP sources for tracking
 */
export interface CombatXpGain {
  /** XP amount gained */
  xp: number;
  /** Source of XP */
  source: 'pve' | 'pvp' | 'bounty' | 'gang_war' | 'training';
  /** Description for log */
  description: string;
  /** Timestamp */
  timestamp: Date;
}

// ============================================
// DERIVED STATS SYSTEM TYPES
// Stats calculated from skills + equipment + companions
// ============================================

/**
 * Primary power stats (sum of skill category levels)
 */
export interface PrimaryStats {
  /** Sum of Combat skill levels */
  combatPower: number;
  /** Sum of Cunning skill levels */
  cunningPower: number;
  /** Sum of Spirit skill levels */
  spiritPower: number;
  /** Sum of Craft skill levels */
  craftPower: number;
}

/**
 * Secondary stats derived from primaries + bonuses
 */
export interface SecondaryStats {
  /** Hit chance in combat: combat * 0.5 + cunning * 0.3 */
  accuracy: number;
  /** Damage dealt: combat * 0.8 + craft * 0.2 */
  damage: number;
  /** Damage mitigation: combat * 0.4 + craft * 0.3 + spirit * 0.3 */
  defense: number;
  /** Dodge chance: cunning * 0.6 + combat * 0.2 */
  evasion: number;
  /** Social success: spirit * 0.7 + cunning * 0.3 */
  persuasion: number;
  /** Crime success rate: cunning * 0.6 + combat * 0.2 + spirit * 0.2 */
  crimeSuccess: number;
  /** Crafting quality: craft * 0.8 + cunning * 0.2 */
  craftQuality: number;
}

/**
 * Complete derived stats with all bonuses
 */
export interface DerivedStats {
  /** Primary stats from skill totals */
  primary: PrimaryStats;
  /** Secondary stats calculated from primaries */
  secondary: SecondaryStats;
  /** Bonuses from equipment */
  equipmentBonuses: Partial<SecondaryStats>;
  /** Bonuses from companions */
  companionBonuses: Partial<SecondaryStats>;
  /** Location-specific bonuses */
  locationBonuses: Partial<SecondaryStats>;
  /** Final calculated stats (secondary + all bonuses) */
  final: SecondaryStats;
}

/**
 * Effective skill level with bonuses
 */
export interface EffectiveSkillLevel {
  skillId: string;
  baseLevel: number;
  equipmentBonus: number;
  companionBonus: number;
  locationBonus: number;
  effectiveLevel: number;
}

// ============================================
// PRESTIGE SYSTEM TYPES
// ============================================

/**
 * Prestige status and progress
 */
export interface PrestigeInfo {
  /** Current prestige rank (0-10) */
  rank: number;
  /** Current prestige title */
  title: string | null;
  /** XP bonus multiplier from prestige */
  xpMultiplier: number;
  /** Gold bonus multiplier from prestige */
  goldMultiplier: number;
  /** Special unlock at current prestige */
  special: string | null;
  /** Requirements to next prestige */
  nextPrestigeRequirements: PrestigeRequirementStatus | null;
}

/**
 * Status of prestige requirements
 */
export interface PrestigeRequirementStatus {
  /** Can prestige now? */
  canPrestige: boolean;
  /** Total Level requirement */
  totalLevel: { required: number; current: number; met: boolean };
  /** Combat Level requirement */
  combatLevel: { required: number; current: number; met: boolean };
  /** Skills at 50+ requirement */
  skillsAt50: { required: number; current: number; met: boolean };
  /** Reasons why can't prestige (if any) */
  reasons: string[];
}

/**
 * Result of prestiging
 */
export interface PrestigeResult {
  /** New prestige rank */
  newRank: number;
  /** New prestige title */
  newTitle: string;
  /** New XP multiplier */
  newXpMultiplier: number;
  /** New gold multiplier */
  newGoldMultiplier: number;
  /** Special reward unlocked */
  specialReward: string;
  /** Skills reset notification */
  skillsReset: boolean;
  /** Combat XP reset notification */
  combatXpReset: boolean;
}

// ============================================
// EXTENDED SKILL DATA
// ============================================

/**
 * Extended skill data for the new system
 */
export interface ExtendedSkillData extends SkillData {
  /** Total XP earned in this skill (lifetime, for prestige tracking) */
  totalXpEarned: number;
  /** When training started (if currently training) */
  trainingStarted?: Date;
  /** When training completes (if currently training) */
  trainingCompletes?: Date;
}

/**
 * Character progression summary for UI
 */
export interface ProgressionSummary {
  /** Total Level info */
  totalLevel: TotalLevelInfo;
  /** Combat Level info */
  combatLevel: CombatLevelInfo;
  /** Prestige info */
  prestige: PrestigeInfo;
  /** Derived stats */
  stats: DerivedStats;
  /** Individual skill breakdown */
  skills: ExtendedSkillData[];
  /** Count of skills at various milestones */
  skillMilestones: {
    at99: number;
    at80Plus: number;
    at50Plus: number;
    at20Plus: number;
  };
}
