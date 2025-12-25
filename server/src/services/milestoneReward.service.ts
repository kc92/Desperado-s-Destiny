/**
 * Milestone Reward Service
 * Handles awarding gameplay rewards when players reach milestone levels
 *
 * Distinct from unlockTrigger.service which handles cosmetic unlocks.
 * This service grants items, gold, XP, and permanent stat modifiers.
 *
 * Sprint 7: Mid-Game Content System
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { GoldService } from './gold.service';
import { InventoryService } from './inventory.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { getMilestone, isMilestoneLevel, LevelMilestone } from '../data/milestones/levelMilestones';
import logger from '../utils/logger';

export interface MilestoneRewardResult {
  level: number;
  title: string;
  goldAwarded: number;
  xpAwarded: number;
  itemAwarded?: { itemId: string; quantity: number };
  featureUnlocked?: string;
  modifierApplied?: { type: string; value: number };
  alreadyClaimed: boolean;
}

export class MilestoneRewardService {
  /**
   * Check and award milestone rewards for a newly reached level
   * Called from characterProgression.service when a character levels up
   */
  static async checkAndAwardRewards(
    characterId: string,
    newLevel: number
  ): Promise<MilestoneRewardResult | null> {
    // Only process milestone levels
    if (!isMilestoneLevel(newLevel)) {
      return null;
    }

    const milestone = getMilestone(newLevel);
    if (!milestone) {
      return null;
    }

    try {
      const milestoneKey = `level-${newLevel}`;

      // PHASE 4 FIX: Atomically claim the milestone to prevent race condition
      // Use findOneAndUpdate with $addToSet and check that milestoneKey wasn't already in the array
      const claimResult = await Character.findOneAndUpdate(
        {
          _id: characterId,
          claimedMilestones: { $ne: milestoneKey }  // Only match if NOT already claimed
        },
        {
          $addToSet: { claimedMilestones: milestoneKey }
        },
        {
          new: false  // Return old document to verify match succeeded
        }
      );

      if (!claimResult) {
        // Either character not found or milestone already claimed
        const existing = await Character.findById(characterId);
        if (!existing) {
          logger.error('Character not found for milestone reward', { characterId, level: newLevel });
          return null;
        }

        // Milestone was already claimed (race condition prevented)
        logger.debug('Milestone already claimed', { characterId, level: newLevel });
        return {
          level: newLevel,
          title: milestone.title,
          goldAwarded: 0,
          xpAwarded: 0,
          alreadyClaimed: true,
        };
      }

      // Award the rewards - milestone is atomically claimed
      const result = await this.awardMilestoneRewards(characterId, milestone);

      logger.info('Milestone rewards awarded', {
        characterId,
        characterName: claimResult.name,
        level: newLevel,
        title: milestone.title,
        goldAwarded: result.goldAwarded,
        xpAwarded: result.xpAwarded,
        item: result.itemAwarded?.itemId,
        feature: result.featureUnlocked,
      });

      return result;
    } catch (error) {
      logger.error('Error awarding milestone rewards', {
        characterId,
        level: newLevel,
        error: error instanceof Error ? error.message : error,
      });
      return null;
    }
  }

  /**
   * Award all rewards for a milestone
   */
  private static async awardMilestoneRewards(
    characterId: string,
    milestone: LevelMilestone
  ): Promise<MilestoneRewardResult> {
    const result: MilestoneRewardResult = {
      level: milestone.level,
      title: milestone.title,
      goldAwarded: 0,
      xpAwarded: 0,
      alreadyClaimed: false,
    };

    // Award gold bonus
    if (milestone.goldBonus && milestone.goldBonus > 0) {
      await GoldService.addGold(
        characterId,
        milestone.goldBonus,
        TransactionSource.MILESTONE_REWARD,
        { milestoneLevel: milestone.level, title: milestone.title }
      );
      result.goldAwarded = milestone.goldBonus;
    }

    // Award XP bonus (add directly to experience, don't process level-up to avoid recursion)
    if (milestone.xpBonus && milestone.xpBonus > 0) {
      await Character.findByIdAndUpdate(characterId, {
        $inc: { experience: milestone.xpBonus },
      });
      result.xpAwarded = milestone.xpBonus;
    }

    // Award item
    if (milestone.item) {
      await InventoryService.addItems(characterId, [{
        itemId: milestone.item.itemId,
        quantity: milestone.item.quantity
      }], { type: 'other', name: `Level ${milestone.level} Milestone` });
      result.itemAwarded = milestone.item;
    }

    // Record feature unlock
    if (milestone.feature) {
      await Character.findByIdAndUpdate(characterId, {
        $addToSet: { unlockedFeatures: milestone.feature },
      });
      result.featureUnlocked = milestone.feature;
    }

    // Apply stat modifier
    if (milestone.modifier) {
      await this.applyMilestoneModifier(characterId, milestone.modifier);
      result.modifierApplied = milestone.modifier;
    }

    return result;
  }

  /**
   * Apply a permanent stat modifier from a milestone
   */
  private static async applyMilestoneModifier(
    characterId: string,
    modifier: { type: string; value: number }
  ): Promise<void> {
    const updatePath = `milestoneModifiers.${modifier.type}`;

    await Character.findByIdAndUpdate(characterId, {
      $inc: { [updatePath]: modifier.value },
    });
  }

  /**
   * Check if a character has unlocked a specific feature
   */
  static async hasFeature(characterId: string, feature: string): Promise<boolean> {
    const character = await Character.findById(characterId);
    if (!character) return false;

    const unlockedFeatures = character.get('unlockedFeatures') as string[] || [];
    return unlockedFeatures.includes(feature);
  }

  /**
   * Get all milestone modifiers for a character
   */
  static async getMilestoneModifiers(characterId: string): Promise<Record<string, number>> {
    const character = await Character.findById(characterId);
    if (!character) return {};

    return (character.get('milestoneModifiers') as Record<string, number>) || {};
  }

  /**
   * Retroactively award any missed milestones
   * Useful for players who leveled before the system was implemented
   */
  static async syncMilestones(characterId: string): Promise<MilestoneRewardResult[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const results: MilestoneRewardResult[] = [];
    const milestoneLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

    for (const level of milestoneLevels) {
      if (character.level >= level) {
        const result = await this.checkAndAwardRewards(characterId, level);
        if (result && !result.alreadyClaimed) {
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Get claimed milestones for a character
   */
  static async getClaimedMilestones(characterId: string): Promise<string[]> {
    const character = await Character.findById(characterId);
    if (!character) return [];

    return (character.get('claimedMilestones') as string[]) || [];
  }

  /**
   * Get unlocked features for a character
   */
  static async getUnlockedFeatures(characterId: string): Promise<string[]> {
    const character = await Character.findById(characterId);
    if (!character) return [];

    return (character.get('unlockedFeatures') as string[]) || [];
  }
}
