/**
 * Skill Training Service
 *
 * Handles skill training activities that award Skill XP + Character XP + Gold
 * Each of the 26 skills has at least one dedicated training activity
 *
 * PHASE 19: Part of the Core Loop Overhaul
 * - 26 training activities (one per skill)
 * - 20 available at Level 1 (sandbox freedom)
 * - Uses skill check for resolution
 * - Awards skill XP, character XP, and gold
 */

import { Character, ICharacter } from '../models/Character.model';
import { EnergyService, calculateScaledEnergyCost } from './energy.service';
import { SkillService } from './skill.service';
import { CharacterProgressionService } from './characterProgression.service';
import {
  ALL_SKILL_TRAINING_ACTIVITIES,
  SkillTrainingActivity,
  getActivitiesForLocation,
  getActivitiesForSkill,
  getLevel1Activities,
  ACTIVITY_COUNTS
} from '@desperados/shared';
import { SKILLS, MoralAction } from '@desperados/shared';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';
import { getRedisClient } from '../config/redis';
import { MoralReputationService } from './moralReputation.service';
import { QuestService } from './quest.service';

// ============================================================================
// TYPES
// ============================================================================

export type TrainingResultCategory = 'great_success' | 'success' | 'partial' | 'failure';

export interface TrainingResult {
  success: boolean;
  message: string;
  activityId: string;
  activityName: string;
  skillId: string;
  skillName: string;

  // Resolution result
  resultCategory: TrainingResultCategory;
  skillRoll: number;
  difficultyClass: number;
  isCritical: boolean;

  // XP and gold rewards (0 on failure)
  skillXpGained: number;
  characterXpGained: number;
  goldGained: number;

  // Level up info
  skillLevelUp?: {
    skillId: string;
    oldLevel: number;
    newLevel: number;
  };
  characterLevelUp?: boolean;

  // Cooldown and energy
  cooldownEndsAt: Date;
  energySpent: number;

  // Failure consequences (if any)
  consequences?: {
    injuryTaken?: number;
    goldLost?: number;
  };

  // Moral reputation change (for lawman activities)
  moralReputationChange?: {
    action: string;
    change: number;
    newReputation: number;
  };
}

export interface TrainingRequirements {
  canTrain: boolean;
  errors: string[];
  missingRequirements: {
    skillLevel?: { required: number; current: number };
    energy?: { required: number; current: number };
    horse?: boolean;
    gang?: boolean;
    item?: string;
  };
  cooldownRemaining?: number;
}

export interface ActivityCooldown {
  activityId: string;
  endsAt: Date;
  remainingSeconds: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COOLDOWN_KEY_PREFIX = 'skilltraining:cooldown';

// Difficulty class by risk level
const RISK_DIFFICULTY: Record<string, number> = {
  safe: 5,
  low: 8,
  medium: 12,
  high: 15
};

// XP and gold modifiers based on result
const RESULT_MODIFIERS: Record<TrainingResultCategory, { xpMult: number; goldMult: number }> = {
  great_success: { xpMult: 1.5, goldMult: 2.0 },
  success: { xpMult: 1.0, goldMult: 1.0 },
  partial: { xpMult: 0.5, goldMult: 0.5 },
  failure: { xpMult: 0.0, goldMult: 0.0 }
};

// Academy location ID
const ACADEMY_LOCATION_ID = '6601a0000000000000000001';

// Academy training target mapping - maps skill to training object for quest "kill" objectives
const ACADEMY_TRAINING_TARGETS: Record<string, string | undefined> = {
  // Combat skills - use training dummy
  melee_combat: 'training-dummy',
  ranged_combat: 'hidden-training-target',
  defensive_tactics: 'training-dummy',
  mounted_combat: 'training-dummy',
  explosives: undefined, // No training target
  // Cunning skills
  lockpicking: 'practice-lock',
  stealth: 'hidden-training-target',
  pickpocket: 'practice-mark',
  tracking: 'hidden-training-target',
  deception: 'practice-skeptic',
  gambling: undefined, // No training target
  duel_instinct: 'training-dummy',
  sleight_of_hand: 'practice-mark',
  // Spirit skills
  medicine: undefined, // No training target
  persuasion: 'practice-skeptic',
  animal_handling: 'training-animal',
  leadership: 'training-group',
  ritual_knowledge: undefined, // No training target
  performance: 'training-audience',
  // Craft skills - generally no targets
  blacksmithing: undefined,
  leatherworking: undefined,
  cooking: undefined,
  alchemy: undefined,
  engineering: undefined,
  mining: undefined,
  carpentry: undefined,
  gunsmithing: undefined,
};

// ============================================================================
// SKILL TRAINING SERVICE CLASS
// ============================================================================

export class SkillTrainingService {
  /**
   * Get Redis key for a character's activity cooldown
   */
  private static getCooldownKey(characterId: string, activityId: string): string {
    return `${COOLDOWN_KEY_PREFIX}:${characterId}:${activityId}`;
  }

  /**
   * Get Redis key pattern for all training cooldowns of a character
   */
  private static getCooldownPattern(characterId: string): string {
    return `${COOLDOWN_KEY_PREFIX}:${characterId}:*`;
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get all training activities available to a character
   * Filters by level requirements and special requirements
   */
  static async getAvailableActivities(
    characterId: string,
    locationType?: string
  ): Promise<{
    activities: SkillTrainingActivity[];
    available: SkillTrainingActivity[];
    cooldowns: ActivityCooldown[];
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get all activities or filter by location
    const allActivities = locationType
      ? getActivitiesForLocation(locationType)
      : ALL_SKILL_TRAINING_ACTIVITIES;

    // Filter by requirements
    const available = allActivities.filter(activity => {
      // Check skill level requirement
      const charSkill = character.skills.find(s => s.skillId === activity.skillId);
      const currentLevel = charSkill?.level ?? 1;
      if (currentLevel < activity.minLevel) {
        return false;
      }

      // Check special requirements
      if (activity.requirements) {
        if (activity.requirements.requiresHorse && !character.activeMountId) {
          return false;
        }
        if (activity.requirements.requiresGang && !character.gangId) {
          return false;
        }
      }

      return true;
    });

    // Get cooldowns
    const cooldowns = await this.getCharacterCooldowns(characterId);

    return { activities: allActivities, available, cooldowns };
  }

  /**
   * Get activities for a specific skill
   */
  static getActivitiesForSkill(skillId: string): SkillTrainingActivity[] {
    return getActivitiesForSkill(skillId);
  }

  /**
   * Get all activities available at Level 1 (no requirements)
   */
  static getLevel1Activities(): SkillTrainingActivity[] {
    return getLevel1Activities();
  }

  /**
   * Get activity by ID
   */
  static getActivityById(activityId: string): SkillTrainingActivity | undefined {
    return ALL_SKILL_TRAINING_ACTIVITIES.find(a => a.id === activityId);
  }

  /**
   * Get all cooldowns for a character
   */
  static async getCharacterCooldowns(characterId: string): Promise<ActivityCooldown[]> {
    const redis = getRedisClient();
    if (!redis) {
      return [];
    }

    const pattern = this.getCooldownPattern(characterId);
    const keys = await redis.keys(pattern);
    const cooldowns: ActivityCooldown[] = [];

    for (const key of keys) {
      const endTime = await redis.get(key);
      if (endTime) {
        const endsAt = new Date(parseInt(endTime));
        const remainingMs = endsAt.getTime() - Date.now();
        if (remainingMs > 0) {
          // Extract activity ID from key
          const activityId = key.split(':').pop() || '';
          cooldowns.push({
            activityId,
            endsAt,
            remainingSeconds: Math.ceil(remainingMs / 1000)
          });
        }
      }
    }

    return cooldowns;
  }

  /**
   * Check if character can perform a training activity
   */
  static async checkRequirements(
    characterId: string,
    activityId: string
  ): Promise<TrainingRequirements> {
    const character = await Character.findById(characterId);
    if (!character) {
      return {
        canTrain: false,
        errors: ['Character not found'],
        missingRequirements: {}
      };
    }

    const activity = this.getActivityById(activityId);
    if (!activity) {
      return {
        canTrain: false,
        errors: ['Activity not found'],
        missingRequirements: {}
      };
    }

    const errors: string[] = [];
    const missingRequirements: TrainingRequirements['missingRequirements'] = {};

    // Check skill level
    const charSkill = character.skills.find(s => s.skillId === activity.skillId);
    const currentLevel = charSkill?.level ?? 1;
    if (currentLevel < activity.minLevel) {
      errors.push(`Requires ${activity.skillId} level ${activity.minLevel}`);
      missingRequirements.skillLevel = {
        required: activity.minLevel,
        current: currentLevel
      };
    }

    // Check energy
    const scaledEnergyCost = calculateScaledEnergyCost(
      activity.energyCost,
      character.totalLevel || 26 // Default to minimum total level
    );
    const energyStatus = await EnergyService.getStatus(characterId);
    if (energyStatus.currentEnergy < scaledEnergyCost) {
      errors.push(`Not enough energy (need ${scaledEnergyCost}, have ${Math.floor(energyStatus.currentEnergy)})`);
      missingRequirements.energy = {
        required: scaledEnergyCost,
        current: Math.floor(energyStatus.currentEnergy)
      };
    }

    // Check special requirements
    if (activity.requirements) {
      if (activity.requirements.requiresHorse && !character.activeMountId) {
        errors.push('Requires a horse');
        missingRequirements.horse = true;
      }
      if (activity.requirements.requiresGang && !character.gangId) {
        errors.push('Requires gang membership');
        missingRequirements.gang = true;
      }
      if (activity.requirements.requiresItem) {
        missingRequirements.item = activity.requirements.requiresItem;
      }
    }

    // Check cooldown
    const cooldownRemaining = await this.getCooldownRemaining(characterId, activityId);
    if (cooldownRemaining > 0) {
      errors.push(`On cooldown for ${cooldownRemaining} seconds`);
    }

    return {
      canTrain: errors.length === 0,
      errors,
      missingRequirements,
      cooldownRemaining: cooldownRemaining > 0 ? cooldownRemaining : undefined
    };
  }

  /**
   * Get remaining cooldown for an activity
   */
  static async getCooldownRemaining(characterId: string, activityId: string): Promise<number> {
    const redis = getRedisClient();
    if (!redis) {
      return 0;
    }

    const key = this.getCooldownKey(characterId, activityId);
    const endTime = await redis.get(key);

    if (!endTime) {
      return 0;
    }

    const remainingMs = parseInt(endTime) - Date.now();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  // ==========================================================================
  // MAIN TRAINING METHOD
  // ==========================================================================

  /**
   * Perform a skill training activity
   * Uses D20 skill check for resolution
   * Awards skill XP, character XP, and gold on success
   *
   * Note: Does not use transactions to avoid WriteConflict with background jobs.
   * Training is single-character operations so ACID is not required.
   */
  static async performTraining(
    characterId: string,
    activityId: string
  ): Promise<TrainingResult> {
    // Get character (no session/transaction to avoid WriteConflict with background jobs)
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get activity
    const activity = this.getActivityById(activityId);
    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    // Get skill definition
    const skillDef = SKILLS[activity.skillId.toUpperCase()];
    if (!skillDef) {
      throw new AppError(`Invalid skill: ${activity.skillId}`, 400);
    }

    // Check requirements
    const requirements = await this.checkRequirements(characterId, activityId);
    if (!requirements.canTrain) {
      throw new AppError(requirements.errors.join(', '), 400);
    }

    // Calculate scaled energy cost
    const scaledEnergyCost = calculateScaledEnergyCost(
      activity.energyCost,
      character.totalLevel || 26
    );

    // Spend energy (no transaction)
    const energyResult = await EnergyService.spendEnergy(
      characterId,
      scaledEnergyCost,
      `Training: ${activity.name}`
    );
    if (!energyResult) {
      throw new AppError('Failed to spend energy', 400);
    }

    // Get character's skill level for bonus
    const charSkill = character.skills.find(s => s.skillId === activity.skillId);
    const skillLevel = charSkill?.level ?? 1;

    // Calculate modifier from skill level (roughly +1 per 5 levels)
    const skillModifier = Math.floor(skillLevel / 5);

    // Get difficulty class based on risk level
    const difficultyClass = RISK_DIFFICULTY[activity.riskLevel] || 10;

    // Roll skill check
    const rollResult = SecureRNG.skillCheck(difficultyClass, skillModifier);

    // Determine result category
    let resultCategory: TrainingResultCategory;
    if (rollResult.criticalSuccess || rollResult.total >= difficultyClass + 5) {
      resultCategory = 'great_success';
    } else if (rollResult.success) {
      resultCategory = 'success';
    } else if (rollResult.total >= difficultyClass - 3) {
      resultCategory = 'partial';
    } else {
      resultCategory = 'failure';
    }

    // Calculate modifiers based on result
    const modifiers = RESULT_MODIFIERS[resultCategory];

    // Calculate base rewards
    const baseSkillXP = activity.baseSkillXP;
    const baseCharXP = activity.baseCharacterXP;
    const baseGold = SecureRNG.range(
      activity.baseGoldReward.min,
      activity.baseGoldReward.max
    );

    // Apply modifiers
    let skillXpGained = Math.floor(baseSkillXP * modifiers.xpMult);
    let characterXpGained = Math.floor(baseCharXP * modifiers.xpMult);
    let goldGained = Math.floor(baseGold * modifiers.goldMult);

    // Critical success bonus
    if (rollResult.criticalSuccess && resultCategory === 'great_success') {
      skillXpGained = Math.floor(skillXpGained * 1.5);
      characterXpGained = Math.floor(characterXpGained * 1.5);
      goldGained = Math.floor(goldGained * 1.5);
    }

    let skillLevelUp: TrainingResult['skillLevelUp'] | undefined;
    let characterLevelUp = false;
    let consequences: TrainingResult['consequences'] | undefined;
    let moralReputationChange: TrainingResult['moralReputationChange'] | undefined;

    // Re-fetch character for updates (ensures we have latest state)
    const charToUpdate = await Character.findById(characterId);
    if (!charToUpdate) {
      throw new AppError('Character not found', 404);
    }

    // Award rewards on success/partial
    if (resultCategory !== 'failure') {
      // Award skill XP (no transaction)
      if (skillXpGained > 0) {
        const skillResult = await SkillService.awardSkillXP(
          characterId,
          activity.skillId,
          skillXpGained
        );
        if (skillResult.success && skillResult.result?.leveledUp) {
          skillLevelUp = {
            skillId: activity.skillId,
            oldLevel: skillResult.result.oldLevel,
            newLevel: skillResult.result.newLevel
          };
        }
      }

      // Award character XP (no transaction)
      if (characterXpGained > 0) {
        const charXpResult = await CharacterProgressionService.addExperience(
          characterId,
          characterXpGained,
          'skill_training'
        );
        characterLevelUp = charXpResult.leveledUp || false;
      }

      // Award gold
      if (goldGained > 0) {
        charToUpdate.gold = (charToUpdate.gold || 0) + goldGained;
      }

      // Award moral reputation for lawman activities (Phase 19)
      if (activity.moralReputationAction) {
        try {
          const repResult = await MoralReputationService.modifyReputation(
            characterId,
            activity.moralReputationAction as MoralAction
          );
          moralReputationChange = {
            action: activity.moralReputationAction,
            change: repResult.change,
            newReputation: repResult.newValue
          };
          logger.info(
            `Character ${charToUpdate.name} earned moral reputation from ${activity.name}`,
            {
              characterId,
              action: activity.moralReputationAction,
              change: repResult.change,
              newReputation: repResult.newValue
            }
          );
        } catch (repError) {
          // Log but don't fail the training - reputation is a bonus
          logger.error('Failed to award moral reputation:', repError);
        }
      }
    }

    // Handle failure consequences for high-risk activities
    if (resultCategory === 'failure' && activity.riskLevel === 'high') {
      consequences = {};

      // Chance of injury (30%)
      if (SecureRNG.chance(0.3)) {
        const injuryAmount = SecureRNG.range(5, 15);
        charToUpdate.energy = Math.max(1, (charToUpdate.energy || 100) - injuryAmount);
        consequences.injuryTaken = injuryAmount;
      }

      // Chance of gold loss (20%)
      if (SecureRNG.chance(0.2)) {
        const goldLost = SecureRNG.range(10, 30);
        charToUpdate.gold = Math.max(0, (charToUpdate.gold || 0) - goldLost);
        consequences.goldLost = goldLost;
      }
    }

    // Save character (no transaction)
    await charToUpdate.save();

    // Set cooldown
    const cooldownEndsAt = await this.setCooldown(
      characterId,
      activityId,
      activity.cooldownSeconds
    );

    // Update quest progress
    // Only update quest progress on success/partial success
    const isSuccess = resultCategory === 'success' || resultCategory === 'great_success';
    if (resultCategory !== 'failure') {
      try {
        // Trigger skill practice objective for quest progress
        await QuestService.updateProgress(
          characterId,
          'skill',
          `skill:${activity.skillId}`,
          1
        );
        logger.debug('Quest progress updated for skill training', {
          characterId,
          skillId: activity.skillId
        });

        // If training at the Academy, also trigger "kill" objectives for training targets
        const isAtAcademy = charToUpdate.currentLocation?.toString() === ACADEMY_LOCATION_ID;
        const trainingTarget = ACADEMY_TRAINING_TARGETS[activity.skillId];
        if (isAtAcademy && trainingTarget) {
          try {
            await QuestService.onEnemyDefeated(
              characterId,
              `npc:${trainingTarget}`
            );
            logger.debug('Quest kill objective updated for training target', {
              characterId,
              trainingTarget
            });
          } catch (killError) {
            // Log but don't fail - this is secondary
            logger.warn('Quest kill objective update failed', {
              characterId,
              trainingTarget,
              error: killError instanceof Error ? killError.message : killError
            });
          }
        }
      } catch (questError) {
        // Log but don't fail the training - quest progress is secondary
        logger.warn('Quest progress update failed during training', {
          characterId,
          activityId,
          skillId: activity.skillId,
          error: questError instanceof Error ? questError.message : questError
        });
      }
    }

    // Select message based on result
    const messages = isSuccess ? activity.successMessages : activity.failureMessages;
    const message = SecureRNG.select(messages);

    logger.info(
      `Character ${charToUpdate.name} performed ${activity.name} training: ${resultCategory}`,
      {
        characterId,
        activityId,
        skillId: activity.skillId,
        result: resultCategory,
        roll: rollResult.roll,
        total: rollResult.total,
        dc: difficultyClass,
        skillXpGained,
        characterXpGained,
        goldGained
      }
    );

    return {
      success: isSuccess,
      message,
      activityId,
      activityName: activity.name,
      skillId: activity.skillId,
      skillName: skillDef.name,
      resultCategory,
      skillRoll: rollResult.roll,
      difficultyClass,
      isCritical: rollResult.criticalSuccess || rollResult.criticalFailure,
      skillXpGained,
      characterXpGained,
      goldGained,
      skillLevelUp,
      characterLevelUp,
      cooldownEndsAt,
      energySpent: scaledEnergyCost,
      consequences,
      moralReputationChange
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Set cooldown for an activity
   */
  private static async setCooldown(
    characterId: string,
    activityId: string,
    cooldownSeconds: number
  ): Promise<Date> {
    const redis = getRedisClient();
    const cooldownEndsAt = new Date(Date.now() + cooldownSeconds * 1000);

    if (redis) {
      const key = this.getCooldownKey(characterId, activityId);
      await redis.set(key, cooldownEndsAt.getTime().toString(), {
        EX: cooldownSeconds
      });
    }

    return cooldownEndsAt;
  }

  /**
   * Clear cooldown for an activity (admin/debug use)
   */
  static async clearCooldown(characterId: string, activityId: string): Promise<void> {
    const redis = getRedisClient();
    if (redis) {
      const key = this.getCooldownKey(characterId, activityId);
      await redis.del(key);
    }
  }

  /**
   * Clear all training cooldowns for a character (admin/debug use)
   */
  static async clearAllCooldowns(characterId: string): Promise<void> {
    const redis = getRedisClient();
    if (redis) {
      const pattern = this.getCooldownPattern(characterId);
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    }
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get training activity statistics
   */
  static getActivityStats(): {
    totalActivities: number;
    level1Available: number;
    byCategory: Record<string, number>;
    byRiskLevel: Record<string, number>;
    moralReputationActivities: number;
  } {
    const byRiskLevel: Record<string, number> = {
      safe: 0,
      low: 0,
      medium: 0,
      high: 0
    };

    for (const activity of ALL_SKILL_TRAINING_ACTIVITIES) {
      byRiskLevel[activity.riskLevel]++;
    }

    return {
      totalActivities: ACTIVITY_COUNTS.total,
      level1Available: ACTIVITY_COUNTS.level1Available,
      byCategory: {
        combat: ACTIVITY_COUNTS.combat,
        cunning: ACTIVITY_COUNTS.cunning,
        spirit: ACTIVITY_COUNTS.spirit,
        craft: ACTIVITY_COUNTS.craft,
        lawman: ACTIVITY_COUNTS.lawman || 0
      },
      byRiskLevel,
      moralReputationActivities: ACTIVITY_COUNTS.moralReputationActivities || 0
    };
  }
}
