/**
 * Tavern Service
 *
 * Handles tavern social activities that boost energy regeneration rates.
 * Part of the Tavern Rest & Social System.
 */

import { ICharacter } from '../models/Character.model';
import { ILocation } from '../models/Location.model';
import { Location } from '../models/Location.model';
import { SkillService } from './skill.service';
import {
  TAVERN_ACTIVITIES,
  TAVERN_CONFIG,
  getTavernActivityById,
  getSaloonBonus,
  TavernActivityDefinition,
  isTavernLocationType
} from '@desperados/shared';
import { AppError, HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * Result of performing a tavern activity
 */
export interface TavernActivityResult {
  success: boolean;
  activity: TavernActivityDefinition;
  buffApplied: {
    effectId: string;
    magnitude: number;
    durationMinutes: number;
    expiresAt: Date;
  };
  xpAwarded: {
    skill: string;
    amount: number;
  };
  locationBonus: number;
  cooldownEndsAt: Date;
  message: string;
}

/**
 * Cooldown status for an activity
 */
export interface ActivityCooldownStatus {
  activityId: string;
  onCooldown: boolean;
  remainingMs: number;
  cooldownEndsAt: Date | null;
}

/**
 * Active buff information
 */
export interface ActiveBuffInfo {
  effectId: string;
  name: string;
  magnitude: number;
  remainingMs: number;
  expiresAt: Date;
  sourceName?: string;
}

export class TavernService {
  /**
   * Location types that support tavern activities
   */
  private static readonly TAVERN_TYPES = ['saloon', 'hotel', 'cantina', 'tavern'];

  /**
   * Check if a location supports tavern activities
   */
  static async isLocationTavern(locationId: string): Promise<boolean> {
    const location = await Location.findOne({ _id: locationId }).lean();
    if (!location) return false;
    return this.TAVERN_TYPES.includes(location.type);
  }

  /**
   * Check if character is currently in a tavern
   */
  static async isCharacterInTavern(character: ICharacter): Promise<boolean> {
    return this.isLocationTavern(character.currentLocation);
  }

  /**
   * Perform a tavern activity
   */
  static async performActivity(
    character: ICharacter,
    activityId: string
  ): Promise<TavernActivityResult> {
    // Get activity definition
    const activity = getTavernActivityById(activityId);
    if (!activity) {
      throw new AppError(`Unknown activity: ${activityId}`, HttpStatus.BAD_REQUEST);
    }

    // Verify character is in a tavern
    const isInTavern = await this.isCharacterInTavern(character);
    if (!isInTavern) {
      throw new AppError(
        'You must be in a saloon or tavern to perform this activity',
        HttpStatus.BAD_REQUEST
      );
    }

    // Check cooldown
    const cooldownStatus = this.getActivityCooldown(character, activityId);
    if (cooldownStatus.onCooldown) {
      const remainingMinutes = Math.ceil(cooldownStatus.remainingMs / 60000);
      throw new AppError(
        `${activity.name} is on cooldown. Available in ${remainingMinutes} minutes.`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check energy cost
    if (activity.energyCost > 0 && character.energy < activity.energyCost) {
      throw new AppError(
        `Not enough energy. Need ${activity.energyCost}, have ${Math.floor(character.energy)}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Check money cost
    if (activity.baseCost > 0 && character.dollars < activity.baseCost) {
      throw new AppError(
        `Not enough money. Need $${activity.baseCost}, have $${character.dollars}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Deduct costs
    if (activity.energyCost > 0) {
      character.energy -= activity.energyCost;
    }
    if (activity.baseCost > 0) {
      character.dollars -= activity.baseCost;
    }

    // Calculate location bonus
    const locationBonus = getSaloonBonus(character.currentLocation, activityId);
    const totalMagnitude = activity.regenBonus + locationBonus;

    // Apply or refresh buff
    const now = new Date();
    const expiresAt = new Date(now.getTime() + activity.durationMinutes * 60 * 1000);

    // Remove existing buff of same type (refresh, don't stack same activity)
    this.removeEffect(character, activityId);

    // Add new buff
    const location = await Location.findOne({ _id: character.currentLocation }).lean();
    character.activeEffects.push({
      effectId: activityId,
      effectType: 'regen_buff',
      magnitude: totalMagnitude,
      appliedAt: now,
      expiresAt,
      sourceLocation: character.currentLocation,
      sourceName: location?.name
    });

    // Set cooldown
    const cooldownEndsAt = new Date(now.getTime() + activity.cooldownMinutes * 60 * 1000);
    character.activityCooldowns.set(activityId, cooldownEndsAt);

    // Award XP
    const skill = character.skills.find(s => s.skillId === activity.xpReward.skill);
    if (skill) {
      skill.experience += activity.xpReward.amount;
      skill.totalXpEarned = (skill.totalXpEarned || 0) + activity.xpReward.amount;

      // Check for level up
      const xpForNextLevel = SkillService.calculateXPForNextLevel(skill.level);
      if (skill.experience >= xpForNextLevel && xpForNextLevel > 0) {
        skill.level += 1;
        skill.experience -= xpForNextLevel;
        SkillService.updateTotalLevel(character);
        logger.info(`Character ${character.name} leveled up ${activity.xpReward.skill} to ${skill.level}`);
      }
    }

    // Mark as modified
    character.markModified('activeEffects');
    character.markModified('activityCooldowns');
    character.markModified('skills');

    logger.info(`Character ${character.name} performed ${activity.name} at ${location?.name || character.currentLocation}`);

    return {
      success: true,
      activity,
      buffApplied: {
        effectId: activityId,
        magnitude: totalMagnitude,
        durationMinutes: activity.durationMinutes,
        expiresAt
      },
      xpAwarded: activity.xpReward,
      locationBonus,
      cooldownEndsAt,
      message: locationBonus > 0
        ? `${activity.name} completed! You gained a ${Math.round(totalMagnitude * 100)}% energy regen buff (includes +${Math.round(locationBonus * 100)}% location bonus).`
        : `${activity.name} completed! You gained a ${Math.round(totalMagnitude * 100)}% energy regen buff.`
    };
  }

  /**
   * Get cooldown status for an activity
   */
  static getActivityCooldown(character: ICharacter, activityId: string): ActivityCooldownStatus {
    const cooldownEnds = character.activityCooldowns?.get(activityId);
    const now = Date.now();

    if (!cooldownEnds || cooldownEnds.getTime() <= now) {
      return {
        activityId,
        onCooldown: false,
        remainingMs: 0,
        cooldownEndsAt: null
      };
    }

    return {
      activityId,
      onCooldown: true,
      remainingMs: cooldownEnds.getTime() - now,
      cooldownEndsAt: cooldownEnds
    };
  }

  /**
   * Get all activity cooldowns for a character
   */
  static getAllCooldowns(character: ICharacter): ActivityCooldownStatus[] {
    return Object.values(TAVERN_ACTIVITIES).map(activity =>
      this.getActivityCooldown(character, activity.id)
    );
  }

  /**
   * Calculate total regen buff multiplier from active effects
   * @param character The character
   * @param isInTavern Whether the character is currently in a tavern
   * @returns Multiplier (1.0 = no buff, 1.5 = +50% faster regen)
   */
  static getRegenBuffMultiplier(character: ICharacter, isInTavern: boolean = false): number {
    // First, prune expired effects
    this.pruneExpiredEffects(character);

    // Sum all regen_buff magnitudes
    let totalBuff = 0;
    for (const effect of character.activeEffects || []) {
      if (effect.effectType === 'regen_buff') {
        totalBuff += effect.magnitude;
      }
    }

    // Cap at maximum
    totalBuff = Math.min(totalBuff, TAVERN_CONFIG.MAX_REGEN_BUFF);

    // Apply in-tavern bonus if applicable
    if (isInTavern && totalBuff > 0) {
      totalBuff *= TAVERN_CONFIG.IN_TAVERN_MULTIPLIER;
      // Re-cap after multiplier (can exceed 50% when in tavern)
      totalBuff = Math.min(totalBuff, TAVERN_CONFIG.MAX_REGEN_BUFF * TAVERN_CONFIG.IN_TAVERN_MULTIPLIER);
    }

    // Return as multiplier (1.0 + buff)
    return 1.0 + totalBuff;
  }

  /**
   * Get all active buff information for display
   */
  static getActiveBuffs(character: ICharacter): ActiveBuffInfo[] {
    this.pruneExpiredEffects(character);

    const now = Date.now();
    const buffs: ActiveBuffInfo[] = [];

    for (const effect of character.activeEffects || []) {
      if (effect.effectType !== 'regen_buff') continue;

      const activity = getTavernActivityById(effect.effectId);
      buffs.push({
        effectId: effect.effectId,
        name: activity?.name || effect.effectId,
        magnitude: effect.magnitude,
        remainingMs: effect.expiresAt.getTime() - now,
        expiresAt: effect.expiresAt,
        sourceName: effect.sourceName
      });
    }

    return buffs;
  }

  /**
   * Remove expired effects from character
   * @returns true if any effects were removed
   */
  static pruneExpiredEffects(character: ICharacter): boolean {
    if (!character.activeEffects || character.activeEffects.length === 0) {
      return false;
    }

    const now = Date.now();
    const originalLength = character.activeEffects.length;

    character.activeEffects = character.activeEffects.filter(
      effect => effect.expiresAt.getTime() > now
    );

    if (character.activeEffects.length < originalLength) {
      character.markModified('activeEffects');
      return true;
    }

    return false;
  }

  /**
   * Remove a specific effect by ID
   */
  static removeEffect(character: ICharacter, effectId: string): boolean {
    if (!character.activeEffects) return false;

    const originalLength = character.activeEffects.length;
    character.activeEffects = character.activeEffects.filter(e => e.effectId !== effectId);

    if (character.activeEffects.length < originalLength) {
      character.markModified('activeEffects');
      return true;
    }

    return false;
  }

  /**
   * Get available activities at a location
   */
  static async getAvailableActivities(
    character: ICharacter
  ): Promise<Array<TavernActivityDefinition & {
    cooldownStatus: ActivityCooldownStatus;
    locationBonus: number;
    canAfford: boolean;
    hasEnergy: boolean;
  }>> {
    const isInTavern = await this.isCharacterInTavern(character);
    if (!isInTavern) {
      return [];
    }

    return Object.values(TAVERN_ACTIVITIES).map(activity => ({
      ...activity,
      cooldownStatus: this.getActivityCooldown(character, activity.id),
      locationBonus: getSaloonBonus(character.currentLocation, activity.id),
      canAfford: character.dollars >= activity.baseCost,
      hasEnergy: character.energy >= activity.energyCost
    }));
  }
}
