/**
 * Skill Service
 *
 * Handles skill training, progression, and bonus calculations
 */

import mongoose from 'mongoose';
import { Character, ICharacter, CharacterSkill } from '../models/Character.model';
import {
  SKILLS,
  SKILL_PROGRESSION,
  calculateXPForLevel,
  calculateTrainingTime,
  DestinySuit,
  NotificationType
} from '@desperados/shared';
import logger from '../utils/logger';
import { QuestService } from './quest.service';
import { NotificationService } from './notification.service';

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
}
