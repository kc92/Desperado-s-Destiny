/**
 * Skill Service
 *
 * Handles skill training, progression, and bonus calculations
 *
 * PHASE 19: Added Specialization System
 * - Category mastery bonuses (+5% per tier up to +25%)
 * - Four specialization paths: Combat, Cunning, Spirit, Craft
 * - Encourages specialization over generalization
 */

import mongoose from 'mongoose';
import { Character, ICharacter, CharacterSkill } from '../models/Character.model';
import {
  SKILLS,
  SKILL_PROGRESSION,
  calculateXPForLevel,
  calculateTrainingTime,
  calculateTotalLevel,
  calculateCombatLevel,
  DestinySuit,
  SkillCategory
} from '@desperados/shared';
import { NotificationType } from '../models/Notification.model';
import logger from '../utils/logger';
import { QuestService } from './quest.service';
import { NotificationService } from './notification.service';
import { CharacterProgressionService } from './characterProgression.service';
import { PremiumUtils } from '../utils/premium.utils';
import { GangService } from './gang.service';

/**
 * PHASE 19: Specialization System Configuration
 *
 * LEVELING SYSTEM REFACTOR: Updated thresholds for level 99 cap
 *
 * Players gain bonuses for mastering skill categories.
 * Each category has thresholds at levels 25, 40, 60, 80, 99.
 * Reaching each threshold with your LOWEST skill in the category grants +5%.
 * Maximum bonus: +25% for having all skills in a category at 99.
 *
 * This encourages deep specialization rather than spreading thin.
 */
export const SPECIALIZATION_CONFIG = {
  /** Skill level thresholds that unlock bonuses (updated for level 99 cap) */
  categoryMasteryThresholds: [25, 40, 60, 80, 99] as const,

  /** Bonus multiplier per threshold reached (5% = 0.05) */
  bonusPerTier: 0.05,

  /** Maximum total bonus for a category (25% = 0.25) */
  maxCategoryBonus: 0.25,

  /**
   * Skill categories for specialization
   * Maps category name to skill IDs that belong to it
   */
  categories: {
    combat: [
      'melee_combat',
      'ranged_combat',
      'defensive_tactics',
      'mounted_combat',
      'explosives'
    ],
    cunning: [
      'lockpicking',
      'stealth',
      'pickpocket',
      'tracking',
      'deception',
      'gambling',
      'duel_instinct',
      'sleight_of_hand'
    ],
    spirit: [
      'medicine',
      'persuasion',
      'animal_handling',
      'leadership',
      'ritual_knowledge',
      'performance'
    ],
    craft: [
      'blacksmithing',
      'leatherworking',
      'cooking',
      'alchemy',
      'engineering',
      'mining',
      'carpentry',
      'gunsmithing'
    ]
  } as const
} as const;

export type SpecializationCategory = keyof typeof SPECIALIZATION_CONFIG.categories;

export class SkillService {
  /**
   * Normalize skill ID to lowercase
   */
  private static normalizeSkillId(skillId: string): string {
    return skillId.toLowerCase();
  }

  /**
   * Get skill definition by ID (handles case sensitivity)
   * Tries uppercase key first, then searches by lowercase id
   */
  private static getSkillDefinition(skillId: string): typeof SKILLS[keyof typeof SKILLS] | undefined {
    const normalized = this.normalizeSkillId(skillId);
    return SKILLS[normalized.toUpperCase()] || Object.values(SKILLS).find(s => s.id === normalized);
  }

  /**
   * Initialize all skills for a new character at level 1
   */
  static initializeSkills(): CharacterSkill[] {
    const skills: CharacterSkill[] = [];

    for (const skillKey of Object.keys(SKILLS)) {
      const skill = SKILLS[skillKey];
      if (skill) {
        skills.push({
          skillId: skill.id,
          level: SKILL_PROGRESSION.STARTING_LEVEL,
          experience: 0,
          totalXpEarned: 0,
          trainingStarted: undefined,
          trainingCompletes: undefined
        });
      }
    }

    return skills;
  }

  /**
   * Add any missing skills to an existing character's skill array
   * This handles characters created before new skills were added
   * Returns the updated skills array (does not save to DB)
   */
  static addMissingSkills(existingSkills: CharacterSkill[]): CharacterSkill[] {
    const existingIds = new Set(existingSkills.map(s => s.skillId.toLowerCase()));
    const updatedSkills = [...existingSkills];

    for (const skillKey of Object.keys(SKILLS)) {
      const skill = SKILLS[skillKey];
      if (skill && !existingIds.has(skill.id.toLowerCase())) {
        updatedSkills.push({
          skillId: skill.id,
          level: SKILL_PROGRESSION.STARTING_LEVEL,
          experience: 0,
          totalXpEarned: 0,
          trainingStarted: undefined,
          trainingCompletes: undefined
        });
      }
    }

    return updatedSkills;
  }

  /**
   * Calculate XP needed to reach next level
   * Formula: level * BASE_XP_PER_LEVEL
   */
  static calculateXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= SKILL_PROGRESSION.MAX_LEVEL) {
      return 0; // Max level reached
    }
    return calculateXPForLevel(currentLevel + 1);
  }

  /**
   * Calculate training time for a skill at current level
   * Formula: baseTime * (1 + level * TRAINING_TIME_SCALE)
   */
  static calculateSkillTrainingTime(skillId: string, currentLevel: number): number {
    return calculateTrainingTime(skillId, currentLevel);
  }

  /**
   * Calculate skill training time with premium and gang bonuses applied
   * Uses character ID to look up premium status and gang membership
   *
   * Bonus stacking (multiplicative):
   * - Premium: 25% reduction (multiplier 0.75)
   * - Gang Training Grounds L1/L2/L3: 5%/10%/15% reduction
   * - Combined max: Premium + Gang L3 = 36.25% reduction
   *
   * @param skillId - Skill being trained
   * @param currentLevel - Current skill level
   * @param characterId - Character ID for bonus lookup
   * @returns Training time in milliseconds with all bonuses applied
   */
  static async calculateSkillTrainingTimeWithBonuses(
    skillId: string,
    currentLevel: number,
    characterId: string
  ): Promise<number> {
    // Get base training time
    const baseTime = this.calculateSkillTrainingTime(skillId, currentLevel);

    // Get character for premium and gang lookup
    const character = await Character.findById(characterId);
    if (!character) {
      return baseTime; // No bonuses for unknown character
    }

    let multiplier = 1.0;

    // Apply premium time reduction (25% = 0.75 multiplier)
    try {
      const premiumMultiplier = await PremiumUtils.getTrainingTimeMultiplierByCharacter(characterId);
      multiplier *= premiumMultiplier;
    } catch (error) {
      logger.warn('Failed to get premium training multiplier:', error);
    }

    // Apply gang Training Grounds reduction (5%/10%/15%)
    if (character.gangId) {
      try {
        const gangReduction = await GangService.getTrainingFacilityBonus(character.gangId.toString());
        if (gangReduction > 0) {
          multiplier *= (1 - gangReduction);
        }
      } catch (error) {
        logger.warn('Failed to get gang training bonus:', error);
      }
    }

    // Apply multiplier and return (minimum 1 minute to prevent exploits)
    const finalTime = Math.max(60000, Math.floor(baseTime * multiplier));

    logger.debug(`Training time for ${skillId} L${currentLevel}: base=${baseTime}ms, multiplier=${multiplier.toFixed(3)}, final=${finalTime}ms`);

    return finalTime;
  }

  /**
   * Calculate total skill bonuses for each Destiny Deck suit
   */
  static calculateSuitBonuses(character: ICharacter): Record<string, number> {
    const bonuses: Record<string, number> = {
      [DestinySuit.SPADES]: 0,
      [DestinySuit.HEARTS]: 0,
      [DestinySuit.CLUBS]: 0,
      [DestinySuit.DIAMONDS]: 0
    };

    for (const characterSkill of character.skills) {
      const skillDef = this.getSkillDefinition(characterSkill.skillId);
      if (skillDef && skillDef.suit) {
        bonuses[skillDef.suit] += characterSkill.level;
      }
    }

    return bonuses;
  }

  /**
   * Start training a skill
   * Note: Removed transaction wrapper - standalone MongoDB doesn't support transactions
   * This is acceptable for single-player skill training operations
   */
  static async startTraining(
    characterId: string,
    skillId: string
  ): Promise<{
    success: boolean;
    error?: string;
    training?: {
      skillId: string;
      startedAt: Date;
      completesAt: Date;
      xpReward: number;
    };
  }> {
    try {
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Count currently training skills
      const currentlyTraining = character.skills.filter(
        s => s.trainingStarted && s.trainingCompletes && new Date(s.trainingCompletes) > new Date()
      ).length;

      // Check concurrent training limit (Premium: 2, Free: 1)
      const maxSlots = await PremiumUtils.getMaxConcurrentTrainingByCharacter(characterId);
      if (currentlyTraining >= maxSlots) {
        const upgradeHint = maxSlots === 1 ? ' Upgrade to Premium for 2 training slots!' : '';
        return { success: false, error: `Already training maximum skills (${maxSlots}).${upgradeHint}` };
      }

      // Validate skill exists
      const skillDef = this.getSkillDefinition(skillId);
      if (!skillDef) {
        return { success: false, error: 'Invalid skill' };
      }

      // Find or create skill record
      let characterSkill = character.skills.find(s => s.skillId === skillDef.id);
      if (!characterSkill) {
        // Initialize skill if not found
        characterSkill = {
          skillId: skillDef.id,
          level: SKILL_PROGRESSION.STARTING_LEVEL,
          experience: 0,
          totalXpEarned: 0,
          trainingStarted: undefined,
          trainingCompletes: undefined
        };
        character.skills.push(characterSkill);
      }

      // Check if skill is at max level
      if (characterSkill.level >= skillDef.maxLevel) {
        return { success: false, error: 'Skill already at maximum level' };
      }

      // Calculate training time with premium + gang bonuses
      const trainingTime = await this.calculateSkillTrainingTimeWithBonuses(
        skillDef.id,
        characterSkill.level,
        characterId
      );
      const now = new Date();
      const completesAt = new Date(now.getTime() + trainingTime);

      // Set training timestamps
      characterSkill.trainingStarted = now;
      characterSkill.trainingCompletes = completesAt;

      await character.save();

      const xpReward = this.calculateXPForNextLevel(characterSkill.level);

      logger.info(
        `Character ${characterId} started training ${skillDef.name} (level ${characterSkill.level})`
      );

      return {
        success: true,
        training: {
          skillId: skillDef.id,
          startedAt: now,
          completesAt,
          xpReward
        }
      };
    } catch (error) {
      logger.error('Error starting skill training:', error);
      throw error;
    }
  }

  /**
   * Cancel current training
   * No penalty - just clears the training state
   * Note: Removed transaction wrapper - standalone MongoDB doesn't support transactions
   */
  static async cancelTraining(characterId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      const training = character.getCurrentTraining();
      if (!training) {
        return { success: false, error: 'Not currently training' };
      }

      // Clear training timestamps
      training.trainingStarted = undefined;
      training.trainingCompletes = undefined;

      await character.save();

      logger.info(`Character ${characterId} cancelled skill training`);

      return { success: true };
    } catch (error) {
      logger.error('Error cancelling skill training:', error);
      throw error;
    }
  }

  /**
   * Complete skill training and award XP
   * Note: Removed transaction wrapper - standalone MongoDB doesn't support transactions
   */
  static async completeTraining(characterId: string): Promise<{
    success: boolean;
    error?: string;
    result?: {
      skillId: string;
      oldLevel: number;
      newLevel: number;
      xpAwarded: number;
      leveledUp: boolean;
      newXP: number;
      xpToNextLevel: number;
    };
  }> {
    try {
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      const training = character.getCurrentTraining();
      if (!training) {
        return { success: false, error: 'Not currently training' };
      }

      // Check if training is complete
      if (!character.isTrainingComplete()) {
        const timeRemaining = training.trainingCompletes!.getTime() - Date.now();
        return {
          success: false,
          error: `Training not complete. ${Math.ceil(timeRemaining / 1000)} seconds remaining.`
        };
      }

      const skillDef = this.getSkillDefinition(training.skillId);
      if (!skillDef) {
        return { success: false, error: 'Invalid skill' };
      }

      const oldLevel = training.level;
      const xpAwarded = this.calculateXPForNextLevel(oldLevel);
      training.experience += xpAwarded;

      let leveledUp = false;
      const xpNeeded = this.calculateXPForNextLevel(oldLevel);

      // Check for level up
      if (training.experience >= xpNeeded && oldLevel < skillDef.maxLevel) {
        training.level += 1;
        training.experience -= xpNeeded;
        leveledUp = true;
      }

      // Clear training timestamps
      training.trainingStarted = undefined;
      training.trainingCompletes = undefined;

      // Update Total Level if skill leveled up
      if (leveledUp) {
        this.updateTotalLevel(character);
      }

      await character.save();

      // Check Total Level milestones after skill level-up
      if (leveledUp) {
        try {
          await CharacterProgressionService.checkTotalLevelMilestones(
            characterId,
            character.totalLevel
          );
        } catch (milestoneError) {
          logger.error('Failed to check Total Level milestones:', milestoneError);
          // Don't fail training completion for milestone check failures
        }
      }

      // Trigger quest progress for skill level up
      if (leveledUp) {
        try {
          await QuestService.onSkillLevelUp(characterId, training.skillId, training.level);
        } catch (questError) {
          // Don't fail skill completion if quest update fails
          logger.error('Failed to update quest progress for skill level up:', questError);
        }
      }

      logger.info(
        `Character ${characterId} completed training ${skillDef.name}. ` +
        `Level: ${oldLevel} -> ${training.level}, XP: +${xpAwarded}`
      );

      // Create notification for skill training completion
      if (leveledUp) {
        try {
          const suitNames: Record<string, string> = {
            [DestinySuit.SPADES]: 'Spades',
            [DestinySuit.HEARTS]: 'Hearts',
            [DestinySuit.CLUBS]: 'Clubs',
            [DestinySuit.DIAMONDS]: 'Diamonds'
          };
          const suitName = skillDef.suit ? suitNames[skillDef.suit] || skillDef.suit : 'cards';

          await NotificationService.createNotification(
            characterId,
            NotificationType.SKILL_TRAINED,
            `${skillDef.name} Leveled Up!`,
            `${skillDef.name} is now level ${training.level}! +${training.level} to ${suitName}`,
            '/skills'
          );
        } catch (notifError) {
          // Log with detailed context but don't fail the training completion
          logger.error('Failed to create skill level-up notification:', {
            error: notifError,
            characterId,
            skillId: training.skillId,
            newLevel: training.level
          });
        }
      }

      return {
        success: true,
        result: {
          skillId: training.skillId,
          oldLevel,
          newLevel: training.level,
          xpAwarded,
          leveledUp,
          newXP: training.experience,
          xpToNextLevel: this.calculateXPForNextLevel(training.level)
        }
      };
    } catch (error) {
      logger.error('Error completing skill training:', error);
      throw error;
    }
  }

  /**
   * Batch complete all training levels that finished while offline
   * Awards multiple levels if player was offline long enough
   * Auto-continues training with remaining time
   *
   * @param characterId - Character ID
   * @returns Results including all levels gained and remaining training time
   */
  static async batchOfflineComplete(characterId: string): Promise<{
    completed: boolean;
    levelsGained: number;
    results: Array<{
      skillId: string;
      skillName: string;
      oldLevel: number;
      newLevel: number;
      xpAwarded: number;
    }>;
    continuedTraining?: {
      skillId: string;
      completesAt: Date;
      remainingMs: number;
    };
  }> {
    // Note: Removed transaction wrapper - standalone MongoDB doesn't support transactions
    // This is acceptable for single-player skill auto-completion on page load
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        return { completed: false, levelsGained: 0, results: [] };
      }

      const training = character.getCurrentTraining();
      if (!training || !training.trainingStarted || !training.trainingCompletes) {
        return { completed: false, levelsGained: 0, results: [] };
      }

      // Check if training has completed
      const now = new Date();
      if (new Date(training.trainingCompletes) > now) {
        return { completed: false, levelsGained: 0, results: [] };
      }

      const skillDef = this.getSkillDefinition(training.skillId);
      if (!skillDef) {
        return { completed: false, levelsGained: 0, results: [] };
      }

      // Calculate total elapsed time since training started
      let elapsedMs = now.getTime() - new Date(training.trainingStarted).getTime();
      let currentLevel = training.level;
      const results: Array<{
        skillId: string;
        skillName: string;
        oldLevel: number;
        newLevel: number;
        xpAwarded: number;
      }> = [];

      // Loop: Award levels while time remains and under max level
      while (elapsedMs > 0 && currentLevel < skillDef.maxLevel) {
        // Get training time for this level (with bonuses)
        const trainingTime = await this.calculateSkillTrainingTimeWithBonuses(
          training.skillId,
          currentLevel,
          characterId
        );

        if (elapsedMs >= trainingTime) {
          // Level completes
          const xpAwarded = this.calculateXPForNextLevel(currentLevel);
          results.push({
            skillId: training.skillId,
            skillName: skillDef.name,
            oldLevel: currentLevel,
            newLevel: currentLevel + 1,
            xpAwarded
          });

          elapsedMs -= trainingTime;
          currentLevel++;
        } else {
          // Partial progress - not enough time for next level
          break;
        }
      }

      if (results.length === 0) {
        return { completed: false, levelsGained: 0, results: [] };
      }

      // Apply all level-ups
      training.level = currentLevel;
      training.experience = 0; // Reset XP after level-ups
      training.totalXpEarned = (training.totalXpEarned || 0) + results.reduce((sum, r) => sum + r.xpAwarded, 0);

      // Update Total Level
      this.updateTotalLevel(character);

      let continuedTraining: { skillId: string; completesAt: Date; remainingMs: number } | undefined;

      // If there's remaining time and not at max, continue training
      if (elapsedMs > 0 && currentLevel < skillDef.maxLevel) {
        const nextTrainingTime = await this.calculateSkillTrainingTimeWithBonuses(
          training.skillId,
          currentLevel,
          characterId
        );
        const remainingForNextLevel = nextTrainingTime - elapsedMs;
        const completesAt = new Date(now.getTime() + remainingForNextLevel);

        training.trainingStarted = new Date(now.getTime() - elapsedMs);
        training.trainingCompletes = completesAt;

        continuedTraining = {
          skillId: training.skillId,
          completesAt,
          remainingMs: remainingForNextLevel
        };
      } else {
        // Clear training (completed or at max)
        training.trainingStarted = undefined;
        training.trainingCompletes = undefined;
      }

      await character.save();

      // Log and notify
      logger.info(`Batch offline complete for ${characterId}: ${results.length} levels gained`, {
        skillId: training.skillId,
        oldLevel: results[0]?.oldLevel,
        newLevel: currentLevel,
        levelsGained: results.length
      });

      // Send notification summarizing gains
      if (results.length > 0) {
        try {
          const totalXp = results.reduce((sum, r) => sum + r.xpAwarded, 0);
          await NotificationService.createNotification(
            characterId,
            NotificationType.SKILL_TRAINED,
            results.length > 1 ? `${skillDef.name} Training: +${results.length} Levels!` : `${skillDef.name} Training Complete!`,
            results.length > 1
              ? `You gained ${results.length} levels in ${skillDef.name} while you were away! Now at level ${currentLevel}.`
              : `${skillDef.name} reached level ${currentLevel}!`,
            '/skills'
          );
        } catch (notifError) {
          logger.error('Failed to create batch training notification:', notifError);
        }
      }

      return {
        completed: true,
        levelsGained: results.length,
        results,
        continuedTraining
      };
    } catch (error) {
      logger.error('Error in batch offline complete:', error);
      throw error;
    }
  }

  /**
   * Check and auto-complete any training that finished while offline
   * Now supports batch completion for multiple levels
   * Called on login/page load
   */
  static async checkAndAutoComplete(characterId: string): Promise<{
    completed: boolean;
    result?: {
      skillId: string;
      oldLevel: number;
      newLevel: number;
      xpAwarded: number;
      leveledUp: boolean;
      newXP: number;
      xpToNextLevel: number;
    };
    batchResults?: {
      levelsGained: number;
      results: Array<{
        skillId: string;
        skillName: string;
        oldLevel: number;
        newLevel: number;
        xpAwarded: number;
      }>;
    };
  }> {
    // Use batch completion for multi-level support
    const batchResult = await this.batchOfflineComplete(characterId);

    if (!batchResult.completed || batchResult.results.length === 0) {
      return { completed: false };
    }

    // Return both the legacy single-result format and the new batch format
    const lastResult = batchResult.results[batchResult.results.length - 1];
    const firstResult = batchResult.results[0];
    const totalXp = batchResult.results.reduce((sum, r) => sum + r.xpAwarded, 0);

    return {
      completed: true,
      result: {
        skillId: lastResult.skillId,
        oldLevel: firstResult.oldLevel,
        newLevel: lastResult.newLevel,
        xpAwarded: totalXp,
        leveledUp: true,
        newXP: 0, // Reset after batch level-ups
        xpToNextLevel: this.calculateXPForNextLevel(lastResult.newLevel)
      },
      batchResults: {
        levelsGained: batchResult.levelsGained,
        results: batchResult.results
      }
    };
  }

  /**
   * Get time remaining for current training
   */
  static getTrainingTimeRemaining(character: ICharacter): number {
    const training = character.getCurrentTraining();
    if (!training || !training.trainingCompletes) {
      return 0;
    }

    const remaining = training.trainingCompletes.getTime() - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Award XP directly to a skill (from contracts, quests, activities)
   * This bypasses training time and grants XP immediately
   * Handles level-ups automatically
   * Note: Removed transaction wrapper - standalone MongoDB doesn't support transactions
   * Session parameter kept for API compatibility but is not used
   */
  static async awardSkillXP(
    characterId: string,
    skillId: string,
    xpAmount: number,
    _session?: mongoose.ClientSession // Unused - kept for API compatibility
  ): Promise<{
    success: boolean;
    error?: string;
    result?: {
      skillId: string;
      xpAwarded: number;
      oldLevel: number;
      newLevel: number;
      currentXP: number;
      xpToNextLevel: number;
      leveledUp: boolean;
      levelsGained: number;
    };
  }> {
    try {
      const character = await Character.findById(characterId);

      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Validate skill exists
      const skillDef = this.getSkillDefinition(skillId);
      if (!skillDef) {
        return { success: false, error: `Invalid skill: ${skillId}` };
      }

      // Find or create skill record
      let characterSkill = character.skills.find(s => s.skillId === skillDef.id);
      if (!characterSkill) {
        characterSkill = {
          skillId: skillDef.id,
          level: SKILL_PROGRESSION.STARTING_LEVEL,
          experience: 0,
          totalXpEarned: 0,
          trainingStarted: undefined,
          trainingCompletes: undefined
        };
        character.skills.push(characterSkill);
      }

      const oldLevel = characterSkill.level;

      // Check if skill is already at max level
      if (characterSkill.level >= skillDef.maxLevel) {
        return {
          success: true,
          result: {
            skillId: skillDef.id,
            xpAwarded: 0,
            oldLevel,
            newLevel: oldLevel,
            currentXP: characterSkill.experience,
            xpToNextLevel: 0,
            leveledUp: false,
            levelsGained: 0
          }
        };
      }

      // Add XP and handle level-ups
      characterSkill.experience += xpAmount;
      let levelsGained = 0;

      // Keep leveling up while we have enough XP
      while (characterSkill.level < skillDef.maxLevel) {
        const xpNeeded = this.calculateXPForNextLevel(characterSkill.level);
        if (characterSkill.experience >= xpNeeded) {
          characterSkill.experience -= xpNeeded;
          characterSkill.level += 1;
          levelsGained += 1;
        } else {
          break;
        }
      }

      // Cap experience at current level threshold if at max
      if (characterSkill.level >= skillDef.maxLevel) {
        characterSkill.experience = 0;
      }

      // Update Total Level if any levels were gained
      if (levelsGained > 0) {
        this.updateTotalLevel(character);
      }

      await character.save();

      // Check Total Level milestones after skill level-up
      if (levelsGained > 0) {
        try {
          await CharacterProgressionService.checkTotalLevelMilestones(
            characterId,
            character.totalLevel
          );
        } catch (milestoneError) {
          logger.error('Failed to check Total Level milestones:', milestoneError);
          // Don't fail XP award for milestone check failures
        }
      }

      // Trigger quest progress and notifications for level ups
      if (levelsGained > 0) {
        try {
          await QuestService.onSkillLevelUp(characterId, characterSkill.skillId, characterSkill.level);
        } catch (questError) {
          logger.error('Failed to update quest progress for skill XP award:', questError);
        }

        try {
          const suitNames: Record<string, string> = {
            [DestinySuit.SPADES]: 'Spades',
            [DestinySuit.HEARTS]: 'Hearts',
            [DestinySuit.CLUBS]: 'Clubs',
            [DestinySuit.DIAMONDS]: 'Diamonds'
          };
          const suitName = skillDef.suit ? suitNames[skillDef.suit] || skillDef.suit : 'cards';

          await NotificationService.createNotification(
            characterId,
            NotificationType.SKILL_TRAINED,
            `${skillDef.name} Leveled Up!`,
            levelsGained > 1
              ? `${skillDef.name} gained ${levelsGained} levels! Now level ${characterSkill.level}. +${characterSkill.level} to ${suitName}`
              : `${skillDef.name} is now level ${characterSkill.level}! +${characterSkill.level} to ${suitName}`,
            '/skills'
          );
        } catch (notifError) {
          logger.error('Failed to create skill XP award notification:', {
            error: notifError,
            characterId,
            skillId: characterSkill.skillId,
            newLevel: characterSkill.level
          });
        }
      }

      logger.info(
        `Character ${characterId} awarded ${xpAmount} XP to ${skillDef.name}. ` +
        `Level: ${oldLevel} -> ${characterSkill.level}, XP: ${characterSkill.experience}`
      );

      return {
        success: true,
        result: {
          skillId: characterSkill.skillId,
          xpAwarded: xpAmount,
          oldLevel,
          newLevel: characterSkill.level,
          currentXP: characterSkill.experience,
          xpToNextLevel: this.calculateXPForNextLevel(characterSkill.level),
          leveledUp: levelsGained > 0,
          levelsGained
        }
      };
    } catch (error) {
      logger.error('Error awarding skill XP:', error);
      throw error;
    }
  }

  /**
   * Award XP to multiple skills at once (batch operation)
   * Used by contracts, jobs, and activities that grant multiple skill XP
   * Note: Session parameter kept for API compatibility but is not used
   */
  static async awardMultipleSkillXP(
    characterId: string,
    skillXpRewards: Array<{ skillId: string; amount: number }>,
    _session?: mongoose.ClientSession // Unused - kept for API compatibility
  ): Promise<{
    success: boolean;
    results: Array<{
      skillId: string;
      xpAwarded: number;
      leveledUp: boolean;
      newLevel: number;
    }>;
  }> {
    const results: Array<{
      skillId: string;
      xpAwarded: number;
      leveledUp: boolean;
      newLevel: number;
    }> = [];

    for (const reward of skillXpRewards) {
      const result = await this.awardSkillXP(characterId, reward.skillId, reward.amount);
      if (result.success && result.result) {
        results.push({
          skillId: result.result.skillId,
          xpAwarded: result.result.xpAwarded,
          leveledUp: result.result.leveledUp,
          newLevel: result.result.newLevel
        });
      }
    }

    return { success: true, results };
  }

  // ============================================
  // PHASE 19: Specialization System Methods
  // ============================================

  /**
   * Get the minimum skill level in a specialization category
   * Used to determine category mastery (you're only as strong as your weakest skill)
   */
  static getCategoryMinLevel(
    character: ICharacter,
    category: SpecializationCategory
  ): number {
    const skillIds = SPECIALIZATION_CONFIG.categories[category];
    let minLevel: number = SKILL_PROGRESSION.MAX_LEVEL;

    for (const skillId of skillIds) {
      const characterSkill = character.skills.find(s => s.skillId === skillId);
      const level = characterSkill?.level ?? SKILL_PROGRESSION.STARTING_LEVEL;
      if (level < minLevel) {
        minLevel = level;
      }
    }

    return minLevel;
  }

  /**
   * Calculate specialization bonus for a category
   * Returns multiplier (1.0 = no bonus, 1.25 = 25% bonus)
   *
   * Bonus is based on the MINIMUM skill level in the category.
   * This encourages leveling all skills in a category, not just one.
   *
   * Example: If you have Combat skills at levels [45, 40, 35, 30, 25],
   * your min is 25, so you get 1 threshold (25) = 5% bonus.
   */
  static calculateCategoryBonus(
    character: ICharacter,
    category: SpecializationCategory
  ): number {
    const minLevel = this.getCategoryMinLevel(character, category);
    const thresholds = SPECIALIZATION_CONFIG.categoryMasteryThresholds;

    let tiersUnlocked = 0;
    for (const threshold of thresholds) {
      if (minLevel >= threshold) {
        tiersUnlocked++;
      }
    }

    const bonus = tiersUnlocked * SPECIALIZATION_CONFIG.bonusPerTier;
    return 1.0 + Math.min(bonus, SPECIALIZATION_CONFIG.maxCategoryBonus);
  }

  /**
   * Get all specialization bonuses for a character
   * Returns object with bonus multiplier for each category
   */
  static getAllSpecializationBonuses(character: ICharacter): Record<SpecializationCategory, number> {
    return {
      combat: this.calculateCategoryBonus(character, 'combat'),
      cunning: this.calculateCategoryBonus(character, 'cunning'),
      spirit: this.calculateCategoryBonus(character, 'spirit'),
      craft: this.calculateCategoryBonus(character, 'craft')
    };
  }

  /**
   * Get detailed specialization progress for UI display
   */
  static getSpecializationProgress(character: ICharacter): Array<{
    category: SpecializationCategory;
    displayName: string;
    minLevel: number;
    currentBonus: number;
    nextThreshold: number | null;
    thresholdsUnlocked: number;
    totalThresholds: number;
    skillLevels: Array<{ skillId: string; level: number }>;
  }> {
    const thresholds = SPECIALIZATION_CONFIG.categoryMasteryThresholds;
    const categoryDisplayNames: Record<SpecializationCategory, string> = {
      combat: 'Combat Mastery',
      cunning: 'Cunning Mastery',
      spirit: 'Spirit Mastery',
      craft: 'Craft Mastery'
    };

    const result: Array<{
      category: SpecializationCategory;
      displayName: string;
      minLevel: number;
      currentBonus: number;
      nextThreshold: number | null;
      thresholdsUnlocked: number;
      totalThresholds: number;
      skillLevels: Array<{ skillId: string; level: number }>;
    }> = [];

    for (const category of Object.keys(SPECIALIZATION_CONFIG.categories) as SpecializationCategory[]) {
      const minLevel = this.getCategoryMinLevel(character, category);
      const bonus = this.calculateCategoryBonus(character, category);

      // Count unlocked thresholds
      let thresholdsUnlocked = 0;
      for (const threshold of thresholds) {
        if (minLevel >= threshold) {
          thresholdsUnlocked++;
        }
      }

      // Find next threshold
      let nextThreshold: number | null = null;
      for (const threshold of thresholds) {
        if (minLevel < threshold) {
          nextThreshold = threshold;
          break;
        }
      }

      // Get skill levels for this category
      const skillIds = SPECIALIZATION_CONFIG.categories[category];
      const skillLevels = skillIds.map(skillId => {
        const characterSkill = character.skills.find(s => s.skillId === skillId);
        return {
          skillId,
          level: characterSkill?.level ?? SKILL_PROGRESSION.STARTING_LEVEL
        };
      });

      result.push({
        category,
        displayName: categoryDisplayNames[category],
        minLevel,
        currentBonus: bonus,
        nextThreshold,
        thresholdsUnlocked,
        totalThresholds: thresholds.length,
        skillLevels
      });
    }

    return result;
  }

  /**
   * Get the primary specialization for a character
   * Returns the category with the highest min level (deepest specialization)
   */
  static getPrimarySpecialization(character: ICharacter): {
    category: SpecializationCategory;
    minLevel: number;
    bonus: number;
  } | null {
    let best: { category: SpecializationCategory; minLevel: number; bonus: number } | null = null;

    for (const category of Object.keys(SPECIALIZATION_CONFIG.categories) as SpecializationCategory[]) {
      const minLevel = this.getCategoryMinLevel(character, category);
      const bonus = this.calculateCategoryBonus(character, category);

      if (!best || minLevel > best.minLevel) {
        best = { category, minLevel, bonus };
      }
    }

    return best;
  }

  // ============================================
  // EFFECTIVE STATS CALCULATION
  // ============================================

  /**
   * Calculate effective stats from skill levels
   *
   * Each skill contributes its level to its category's stat.
   * This replaces the unused character.stats object with real values.
   *
   * Categories:
   * - cunning: lockpicking, stealth, pickpocket, tracking, deception, gambling, duel_instinct, sleight_of_hand
   * - spirit: medicine, persuasion, animal_handling, leadership, ritual_knowledge, performance
   * - combat: melee_combat, ranged_combat, defensive_tactics, mounted_combat, explosives
   * - craft: blacksmithing, leatherworking, cooking, alchemy, engineering, mining, carpentry, gunsmithing
   *
   * @param character - The character to calculate stats for
   * @returns Object with cunning, spirit, combat, craft values
   */
  static getEffectiveStats(character: ICharacter): {
    cunning: number;
    spirit: number;
    combat: number;
    craft: number;
  } {
    const stats = { cunning: 0, spirit: 0, combat: 0, craft: 0 };

    for (const category of Object.keys(SPECIALIZATION_CONFIG.categories) as SpecializationCategory[]) {
      const skillIds = SPECIALIZATION_CONFIG.categories[category];

      for (const skillId of skillIds) {
        const characterSkill = character.skills.find(s => s.skillId === skillId);
        if (characterSkill) {
          stats[category] += characterSkill.level;
        }
      }
    }

    return stats;
  }

  /**
   * Get a single effective stat value
   * Convenience method for services that only need one stat
   */
  static getEffectiveStat(character: ICharacter, stat: SpecializationCategory): number {
    const skillIds = SPECIALIZATION_CONFIG.categories[stat];
    let total = 0;

    for (const skillId of skillIds) {
      const characterSkill = character.skills.find(s => s.skillId === skillId);
      if (characterSkill) {
        total += characterSkill.level;
      }
    }

    return total;
  }

  // ============================================
  // TOTAL LEVEL SYSTEM
  // Sum of all skill levels (replaces character level)
  // ============================================

  /**
   * Calculate and update a character's Total Level
   * Should be called after any skill level change
   *
   * @param character - Character to update
   * @returns The new Total Level
   */
  static updateTotalLevel(character: ICharacter): number {
    const skills = character.skills.map(s => ({ level: s.level || 1 }));
    const newTotalLevel = calculateTotalLevel(skills);

    // Update cached value
    character.totalLevel = newTotalLevel;

    logger.debug(`Updated Total Level for ${character.name}: ${newTotalLevel}`);
    return newTotalLevel;
  }

  /**
   * Get Total Level for a character (calculated, not cached)
   */
  static getTotalLevel(character: ICharacter): number {
    const skills = character.skills.map(s => ({ level: s.level || 1 }));
    return calculateTotalLevel(skills);
  }

  /**
   * Check if character meets Total Level requirement
   */
  static meetsTotalLevelRequirement(character: ICharacter, requiredLevel: number): boolean {
    return this.getTotalLevel(character) >= requiredLevel;
  }

  // ============================================
  // COMBAT LEVEL SYSTEM
  // Derived from total combat XP earned (1-138)
  // ============================================

  /**
   * Award Combat XP and update Combat Level
   * Called after PvE victories, PvP wins, bounty captures, gang wars
   * Note: Removed transaction wrapper - standalone MongoDB doesn't support transactions
   *
   * @param characterId - Character to award XP to
   * @param xpAmount - Amount of combat XP to award
   * @param source - Source of the XP for logging
   * @param _session - Unused - kept for API compatibility
   */
  static async awardCombatXP(
    characterId: string,
    xpAmount: number,
    source: 'pve' | 'pvp' | 'bounty' | 'gang_war' | 'training',
    _session?: mongoose.ClientSession // Unused - kept for API compatibility
  ): Promise<{
    success: boolean;
    oldCombatLevel: number;
    newCombatLevel: number;
    combatXpGained: number;
    totalCombatXp: number;
    leveledUp: boolean;
  }> {
    try {
      const character = await Character.findById(characterId);

      if (!character) {
        throw new Error('Character not found');
      }

      const oldCombatXp = character.combatXp || 0;
      const oldCombatLevel = character.combatLevel || 1;

      // Add combat XP
      character.combatXp = oldCombatXp + xpAmount;

      // Calculate new combat level
      const newCombatLevel = calculateCombatLevel(character.combatXp);
      character.combatLevel = newCombatLevel;

      const leveledUp = newCombatLevel > oldCombatLevel;

      await character.save();

      logger.info(
        `Character ${character.name} gained ${xpAmount} combat XP from ${source}. ` +
        `Combat Level: ${oldCombatLevel} -> ${newCombatLevel}, Total XP: ${character.combatXp}`
      );

      // Notify on level up
      if (leveledUp) {
        try {
          await NotificationService.createNotification(
            characterId,
            NotificationType.SKILL_TRAINED,
            'Combat Level Up!',
            `Your Combat Level increased to ${newCombatLevel}!`,
            '/character'
          );
        } catch (notifError) {
          logger.error('Failed to create combat level notification:', notifError);
        }
      }

      return {
        success: true,
        oldCombatLevel,
        newCombatLevel,
        combatXpGained: xpAmount,
        totalCombatXp: character.combatXp,
        leveledUp
      };
    } catch (error) {
      logger.error('Error awarding combat XP:', error);
      throw error;
    }
  }

  /**
   * Calculate combat XP for a PvE victory
   * Formula: enemyLevel * 50 XP
   */
  static calculatePvECombatXP(enemyLevel: number): number {
    return enemyLevel * 50;
  }

  /**
   * Calculate combat XP for a PvP victory
   * Formula: 500 + (opponentCombatLevel - yourCombatLevel) * 25 XP
   * Bonus for defeating higher level opponents, reduced for lower
   */
  static calculatePvPCombatXP(yourCombatLevel: number, opponentCombatLevel: number): number {
    const base = 500;
    const levelDiff = opponentCombatLevel - yourCombatLevel;
    const bonus = levelDiff * 25;
    return Math.max(100, base + bonus); // Minimum 100 XP
  }

  /**
   * Calculate combat XP for capturing a bounty
   * Formula: bountyAmount / 10 XP
   */
  static calculateBountyCombatXP(bountyAmount: number): number {
    return Math.floor(bountyAmount / 10);
  }

  /**
   * Calculate combat XP for gang war contribution
   * Formula: damage * 2 XP
   */
  static calculateGangWarCombatXP(damageDealt: number): number {
    return Math.floor(damageDealt * 2);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get count of skills at or above a certain level
   * Used for prestige requirements
   */
  static getSkillsAtLevel(character: ICharacter, minLevel: number): number {
    return character.skills.filter(s => s.level >= minLevel).length;
  }

  /**
   * Get the character's highest individual skill level
   */
  static getHighestSkillLevel(character: ICharacter): { skillId: string; level: number } | null {
    if (!character.skills || character.skills.length === 0) {
      return null;
    }

    let highest = character.skills[0];
    for (const skill of character.skills) {
      if (skill.level > highest.level) {
        highest = skill;
      }
    }

    return { skillId: highest.skillId, level: highest.level };
  }

  /**
   * Get comprehensive progression summary for UI
   */
  static getProgressionSummary(character: ICharacter): {
    totalLevel: number;
    combatLevel: number;
    combatXp: number;
    skillsAt99: number;
    skillsAt80Plus: number;
    skillsAt50Plus: number;
    averageSkillLevel: number;
    primarySpecialization: SpecializationCategory | null;
  } {
    const totalLevel = this.getTotalLevel(character);
    const avgLevel = character.skills.length > 0
      ? totalLevel / character.skills.length
      : 1;

    const primary = this.getPrimarySpecialization(character);

    return {
      totalLevel,
      combatLevel: character.combatLevel || 1,
      combatXp: character.combatXp || 0,
      skillsAt99: this.getSkillsAtLevel(character, 99),
      skillsAt80Plus: this.getSkillsAtLevel(character, 80),
      skillsAt50Plus: this.getSkillsAtLevel(character, 50),
      averageSkillLevel: Math.round(avgLevel * 10) / 10,
      primarySpecialization: primary?.category || null
    };
  }
}
