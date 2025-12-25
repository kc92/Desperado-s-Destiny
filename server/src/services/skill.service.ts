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
  DestinySuit,
  NotificationType,
  SkillCategory
} from '@desperados/shared';
import logger from '../utils/logger';
import { QuestService } from './quest.service';
import { NotificationService } from './notification.service';

/**
 * PHASE 19: Specialization System Configuration
 *
 * Players gain bonuses for mastering skill categories.
 * Each category has thresholds at levels 25, 35, 45, 50.
 * Reaching each threshold with your LOWEST skill in the category grants +5%.
 * Maximum bonus: +25% for having all skills in a category at 50.
 *
 * This encourages deep specialization rather than spreading thin.
 */
export const SPECIALIZATION_CONFIG = {
  /** Skill level thresholds that unlock bonuses */
  categoryMasteryThresholds: [25, 35, 45, 50] as const,

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
      'perception',
      'sleight_of_hand',
      'poker_face'
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
      'prospecting',
      'herbalism',
      'carpentry'
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
          trainingStarted: undefined,
          trainingCompletes: undefined
        });
      }
    }

    return skills;
  }

  /**
   * Calculate XP needed to reach next level
   * Formula: level * BASE_XP_PER_LEVEL
   */
  static calculateXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= SKILL_PROGRESSION.MAX_LEVEL) {
      return 0; // Max level reached
    }
    return calculateXPForLevel(currentLevel);
  }

  /**
   * Calculate training time for a skill at current level
   * Formula: baseTime * (1 + level * TRAINING_TIME_SCALE)
   */
  static calculateSkillTrainingTime(skillId: string, currentLevel: number): number {
    return calculateTrainingTime(skillId, currentLevel);
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
   * Transaction-safe to prevent race conditions
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find character within transaction
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      // Check if already training
      if (!character.canStartTraining()) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Already training a skill' };
      }

      // Validate skill exists
      const skillDef = this.getSkillDefinition(skillId);
      if (!skillDef) {
        await session.abortTransaction();
        session.endSession();
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
          trainingStarted: undefined,
          trainingCompletes: undefined
        };
        character.skills.push(characterSkill);
      }

      // Check if skill is at max level
      if (characterSkill.level >= skillDef.maxLevel) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Skill already at maximum level' };
      }

      // Calculate training time
      const trainingTime = this.calculateSkillTrainingTime(skillDef.id, characterSkill.level);
      const now = new Date();
      const completesAt = new Date(now.getTime() + trainingTime);

      // Set training timestamps
      characterSkill.trainingStarted = now;
      characterSkill.trainingCompletes = completesAt;

      // Save within transaction
      await character.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

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
      await session.abortTransaction();
      session.endSession();
      logger.error('Error starting skill training:', error);
      throw error;
    }
  }

  /**
   * Cancel current training
   * No penalty - just clears the training state
   */
  static async cancelTraining(characterId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      const training = character.getCurrentTraining();
      if (!training) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Not currently training' };
      }

      // Clear training timestamps
      training.trainingStarted = undefined;
      training.trainingCompletes = undefined;

      await character.save({ session });
      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} cancelled skill training`);

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error cancelling skill training:', error);
      throw error;
    }
  }

  /**
   * Complete skill training and award XP
   * Transaction-safe
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      const training = character.getCurrentTraining();
      if (!training) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Not currently training' };
      }

      // Check if training is complete
      if (!character.isTrainingComplete()) {
        const timeRemaining = training.trainingCompletes!.getTime() - Date.now();
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: `Training not complete. ${Math.ceil(timeRemaining / 1000)} seconds remaining.`
        };
      }

      const skillDef = this.getSkillDefinition(training.skillId);
      if (!skillDef) {
        await session.abortTransaction();
        session.endSession();
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

      await character.save({ session });
      await session.commitTransaction();
      session.endSession();

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
      await session.abortTransaction();
      session.endSession();
      logger.error('Error completing skill training:', error);
      throw error;
    }
  }

  /**
   * Check and auto-complete any training that finished while offline
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
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { completed: false };
    }

    const training = character.getCurrentTraining();
    if (!training || !training.trainingCompletes) {
      return { completed: false };
    }

    // Check if training should have completed (even if it was hours ago)
    if (new Date(training.trainingCompletes) <= new Date()) {
      const result = await this.completeTraining(characterId);
      if (result.success && result.result) {
        logger.info(`Auto-completed offline training for character ${characterId}`, {
          skillId: result.result.skillId,
          newLevel: result.result.newLevel,
          completedAt: training.trainingCompletes
        });
        return { completed: true, result: result.result };
      }
    }

    return { completed: false };
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
   */
  static async awardSkillXP(
    characterId: string,
    skillId: string,
    xpAmount: number,
    session?: mongoose.ClientSession
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
    const useExternalSession = !!session;
    if (!session) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    try {
      const character = await Character.findById(characterId).session(session);

      if (!character) {
        if (!useExternalSession) {
          await session.abortTransaction();
          session.endSession();
        }
        return { success: false, error: 'Character not found' };
      }

      // Validate skill exists
      const skillDef = this.getSkillDefinition(skillId);
      if (!skillDef) {
        if (!useExternalSession) {
          await session.abortTransaction();
          session.endSession();
        }
        return { success: false, error: `Invalid skill: ${skillId}` };
      }

      // Find or create skill record
      let characterSkill = character.skills.find(s => s.skillId === skillDef.id);
      if (!characterSkill) {
        characterSkill = {
          skillId: skillDef.id,
          level: SKILL_PROGRESSION.STARTING_LEVEL,
          experience: 0,
          trainingStarted: undefined,
          trainingCompletes: undefined
        };
        character.skills.push(characterSkill);
      }

      const oldLevel = characterSkill.level;

      // Check if skill is already at max level
      if (characterSkill.level >= skillDef.maxLevel) {
        if (!useExternalSession) {
          await session.abortTransaction();
          session.endSession();
        }
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

      await character.save({ session });

      if (!useExternalSession) {
        await session.commitTransaction();
        session.endSession();
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
      if (!useExternalSession) {
        await session.abortTransaction();
        session.endSession();
      }
      logger.error('Error awarding skill XP:', error);
      throw error;
    }
  }

  /**
   * Award XP to multiple skills at once (batch operation)
   * Used by contracts, jobs, and activities that grant multiple skill XP
   */
  static async awardMultipleSkillXP(
    characterId: string,
    skillXpRewards: Array<{ skillId: string; amount: number }>,
    session?: mongoose.ClientSession
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
      const result = await this.awardSkillXP(characterId, reward.skillId, reward.amount, session);
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
}
