/**
 * Quest Service
 * Handles quest management and progress tracking
 */

import mongoose from 'mongoose';
import {
  QuestDefinition,
  CharacterQuest,
  IQuestDefinition,
  ICharacterQuest,
  QuestStatus,
  QuestReward
} from '../models/Quest.model';
import { Character } from '../models/Character.model';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import { CharacterProgressionService } from './characterProgression.service';
import { InventoryService } from './inventory.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { withLock } from '../utils/distributedLock';

export class QuestService {
  // ===========================================
  // QUEST TRIGGER METHODS
  // Called from other services to update quest progress
  // ===========================================

  /**
   * Trigger when a crime is completed successfully
   */
  static async onCrimeCompleted(
    characterId: string,
    crimeType: string
  ): Promise<void> {
    try {
      // Update quests with 'crime' objectives matching this crime type
      await this.updateProgress(characterId, 'crime', crimeType, 1);
      // Also update generic 'any' crime objectives
      await this.updateProgress(characterId, 'crime', 'any', 1);
    } catch (error) {
      // Don't fail the crime action if quest update fails
    }
  }

  /**
   * Trigger when a location is visited
   */
  static async onLocationVisited(
    characterId: string,
    locationId: string
  ): Promise<void> {
    try {
      await this.updateProgress(characterId, 'visit', locationId, 1);
      await this.updateProgress(characterId, 'visit', 'any', 1);
    } catch (error) {
      // Silently fail - don't block location visit
    }
  }

  /**
   * Trigger when interacting with an NPC
   */
  static async onNPCInteraction(
    characterId: string,
    npcId: string
  ): Promise<void> {
    try {
      await this.updateProgress(characterId, 'visit', `npc:${npcId}`, 1);
    } catch (error) {
      // Silently fail - don't block NPC interaction
    }
  }

  /**
   * Trigger when an item is collected
   */
  static async onItemCollected(
    characterId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<void> {
    try {
      await this.updateProgress(characterId, 'collect', itemId, quantity);
    } catch (error) {
      // Silently fail - don't block item collection
    }
  }

  /**
   * Trigger when an enemy is defeated
   */
  static async onEnemyDefeated(
    characterId: string,
    enemyType: string
  ): Promise<void> {
    try {
      // Update specific enemy type objectives
      await this.updateProgress(characterId, 'kill', enemyType, 1);
      // Also update generic 'any' kill objectives
      await this.updateProgress(characterId, 'kill', 'any', 1);
    } catch (error) {
      // Silently fail - don't block enemy defeat
    }
  }

  /**
   * Trigger when dollars are earned
   */
  static async onDollarsEarned(
    characterId: string,
    amount: number
  ): Promise<void> {
    try {
      await this.updateProgress(characterId, 'dollars', 'any', amount);
    } catch (error) {
      // Silently fail - don't block dollars earning
    }
  }

  /**
   * Trigger when character levels up
   */
  static async onLevelUp(
    characterId: string,
    newLevel: number
  ): Promise<void> {
    try {
      await this.updateProgress(characterId, 'level', 'any', newLevel);
    } catch (error) {
      // Silently fail - don't block level up
    }
  }

  /**
   * Trigger when a skill level increases
   */
  static async onSkillLevelUp(
    characterId: string,
    skillId: string,
    newLevel: number
  ): Promise<void> {
    try {
      await this.updateProgress(characterId, 'skill', skillId, newLevel);
    } catch (error) {
      // Silently fail - don't block skill level up
    }
  }

  // ===========================================
  // QUEST MANAGEMENT METHODS
  // ===========================================

  /**
   * Get all available quests for a character
   */
  static async getAvailableQuests(characterId: string): Promise<IQuestDefinition[]> {
    // Read-only query - use lean for performance
    const character = await Character.findById(characterId).lean();
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get completed quest IDs
    const completedQuests = await CharacterQuest.find({
      characterId,
      status: 'completed'
    }).select('questId');
    const completedIds = completedQuests.map(q => q.questId);

    // Get active quest IDs
    const activeQuests = await CharacterQuest.find({
      characterId,
      status: 'active'
    }).select('questId');
    const activeIds = activeQuests.map(q => q.questId);

    // Find available quests
    const quests = await QuestDefinition.find({
      isActive: true,
      levelRequired: { $lte: character.level },
      $or: [
        { questId: { $nin: [...completedIds, ...activeIds] } },
        { repeatable: true, questId: { $nin: activeIds } }
      ]
    });

    // Filter by prerequisites
    return quests.filter(quest => {
      if (quest.prerequisites.length === 0) return true;
      return quest.prerequisites.every(prereq => completedIds.includes(prereq));
    });
  }

  /**
   * Get character's active quests
   */
  static async getActiveQuests(characterId: string): Promise<ICharacterQuest[]> {
    return CharacterQuest.find({
      characterId,
      status: 'active'
    }).sort({ startedAt: -1 });
  }

  /**
   * Get character's completed quests
   */
  static async getCompletedQuests(characterId: string): Promise<ICharacterQuest[]> {
    return CharacterQuest.find({
      characterId,
      status: 'completed'
    }).sort({ completedAt: -1 });
  }

  /**
   * Accept a quest
   */
  static async acceptQuest(
    characterId: string,
    questId: string
  ): Promise<ICharacterQuest> {
    // Read-only query for level check - use lean for performance
    const character = await Character.findById(characterId).lean();
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Check if already active
    const existing = await CharacterQuest.findOne({
      characterId,
      questId,
      status: 'active'
    });
    if (existing) {
      throw new AppError('Quest already active', 400);
    }

    // Get quest definition
    const questDef = await QuestDefinition.findOne({ questId, isActive: true });
    if (!questDef) {
      throw new AppError('Quest not found', 404);
    }

    // Check level
    if (character.level < questDef.levelRequired) {
      throw new AppError(`Level ${questDef.levelRequired} required`, 400);
    }

    // Check prerequisites
    if (questDef.prerequisites.length > 0) {
      const completed = await CharacterQuest.find({
        characterId,
        questId: { $in: questDef.prerequisites },
        status: 'completed'
      });
      if (completed.length !== questDef.prerequisites.length) {
        throw new AppError('Prerequisites not met', 400);
      }
    }

    // Create character quest with objectives
    const objectives = questDef.objectives.map(obj => ({
      ...obj,
      current: 0
    }));

    const characterQuest = await CharacterQuest.create({
      characterId,
      questId,
      status: 'active',
      objectives,
      startedAt: new Date(),
      expiresAt: questDef.timeLimit
        ? new Date(Date.now() + questDef.timeLimit * 60 * 1000)
        : undefined
    });

    return characterQuest;
  }

  /**
   * Update quest progress
   */
  /**
   * Normalize target strings for flexible matching
   * Handles formats like: saloon, building:saloon, location:saloon
   */
  private static normalizeTarget(target: string): string {
    return target
      .toLowerCase()
      .replace(/^location:/, '')
      .replace(/^building:/, '')
      .replace(/^npc:/, '')
      .replace(/[-_]/g, '')  // Remove both hyphens and underscores for flexible matching
      .replace(/\s+/g, '')   // Also remove spaces
      .trim();
  }

  /**
   * Check if a given locationId matches an objective's target
   * Handles various formats: ObjectId, building:type, location:slug
   */
  private static targetsMatch(objectiveTarget: string, visitedLocation: string): boolean {
    // Exact match
    if (objectiveTarget === visitedLocation) return true;

    // Normalize both for fuzzy matching
    const normalizedObjective = this.normalizeTarget(objectiveTarget);
    const normalizedVisited = this.normalizeTarget(visitedLocation);

    // Direct normalized match
    if (normalizedObjective === normalizedVisited) return true;

    // Check if one contains the other (for partial matches like "saloon" matching "red-gulch-saloon")
    if (normalizedObjective.includes(normalizedVisited) || normalizedVisited.includes(normalizedObjective)) {
      return true;
    }

    return false;
  }

  static async updateProgress(
    characterId: string,
    objectiveType: string,
    target: string,
    amount: number = 1
  ): Promise<ICharacterQuest[]> {
    // Use distributed lock to prevent race conditions when updating quest progress
    const lockKey = `lock:quest:${characterId}:${objectiveType}:${target}`;

    return withLock(lockKey, async () => {
      const activeQuests = await CharacterQuest.find({
        characterId,
        status: 'active'
      });

      const updatedQuests: ICharacterQuest[] = [];

      for (const quest of activeQuests) {
        let updated = false;

        for (const objective of quest.objectives) {
          // Handle both exact and flexible matching for visit objectives
          const typeMatches = objective.type === objectiveType ||
            (objectiveType === 'visit' && objective.type === 'visit_location');

          const targetMatches = objective.target === target ||
            (objectiveType === 'visit' && this.targetsMatch(objective.target, target));

          if (typeMatches && targetMatches) {
            objective.current = Math.min(objective.current + amount, objective.required);
            updated = true;
          }
        }

        if (updated) {
          await quest.save();
          updatedQuests.push(quest);

          // Check if all REQUIRED objectives are complete (optional objectives don't block completion)
          const allRequiredComplete = quest.objectives
            .filter(obj => !obj.optional)
            .every(obj => obj.current >= obj.required);
          if (allRequiredComplete) {
            await this.completeQuest(characterId, quest.questId);
          }
        }
      }

      return updatedQuests;
    }, { ttl: 30, retries: 3 });
  }

  /**
   * Complete a quest and grant rewards
   * PHASE 4 FIX: Use atomic status update to prevent race condition double-completion
   */
  static async completeQuest(
    characterId: string,
    questId: string
  ): Promise<{ quest: ICharacterQuest; rewards: QuestReward[] }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // PHASE 4 FIX: Atomically update status from 'active' to 'completing' to prevent race condition
      // Two parallel requests cannot both find status='active' after one has claimed it
      const characterQuest = await CharacterQuest.findOneAndUpdate(
        {
          characterId,
          questId,
          status: 'active'  // Only match if still active
        },
        {
          $set: { status: 'completing' }  // Intermediate state prevents double-completion
        },
        {
          new: true,
          session
        }
      );

      if (!characterQuest) {
        // Check if already completed or doesn't exist
        const existing = await CharacterQuest.findOne({ characterId, questId }).session(session);
        if (!existing) {
          throw new AppError('Quest not found', 404);
        }
        if (existing.status === 'completed' || existing.status === 'completing') {
          throw new AppError('Quest already completed', 400);
        }
        throw new AppError('Quest not active', 400);
      }

      // Verify all REQUIRED objectives are complete (optional objectives don't block)
      const allRequiredComplete = characterQuest.objectives
        .filter(obj => !obj.optional)
        .every(obj => obj.current >= obj.required);
      if (!allRequiredComplete) {
        // Revert status back to active if objectives not complete
        characterQuest.status = 'active';
        await characterQuest.save({ session });
        throw new AppError('Not all required objectives completed', 400);
      }

      // Get quest definition for rewards
      const questDef = await QuestDefinition.findOne({ questId });
      if (!questDef) {
        throw new AppError('Quest definition not found', 404);
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Grant rewards
      for (const reward of questDef.rewards) {
        switch (reward.type) {
          case 'dollars':
            if (reward.amount) {
              await DollarService.addDollars(
                characterId,
                reward.amount,
                TransactionSource.QUEST_REWARD,
                { questId, currencyType: CurrencyType.DOLLAR },
                session
              );
            }
            break;
          case 'xp':
            if (reward.amount) {
              // Use CharacterProgressionService for atomic XP handling with session
              await CharacterProgressionService.addExperience(
                characterId,
                reward.amount,
                'QUEST_REWARD',
                session
              );
            }
            break;
          case 'item':
            if (reward.itemId) {
              // Use InventoryService for atomic item handling with session
              await InventoryService.addItems(
                characterId,
                [{ itemId: reward.itemId, quantity: 1 }],
                { type: 'quest', id: questId, name: questDef.name },
                session
              );
            }
            break;
          case 'reputation':
            // Handle reputation rewards
            if (reward.faction && reward.amount) {
              try {
                const { ReputationService } = await import('./reputation.service');
                const faction = reward.faction as any;
                await ReputationService.modifyReputation(
                  characterId,
                  faction,
                  reward.amount,
                  `Quest: ${questDef.name}`
                );
              } catch (repError) {
                // Don't fail quest completion if reputation update fails
                logger.error('Failed to update reputation from quest', { error: repError instanceof Error ? repError.message : repError, stack: repError instanceof Error ? repError.stack : undefined });
              }
            }
            break;
        }
      }

      // Update quest status
      characterQuest.status = 'completed';
      characterQuest.completedAt = new Date();

      // Note: character.save() removed - all reward modifications (dollars, XP, items)
      // are now handled atomically by their respective services with the session
      await characterQuest.save({ session });
      await session.commitTransaction();

      // Create reputation spreading event for quest completion (async, after commit)
      try {
        const { ReputationSpreadingService } = await import('./reputationSpreading.service');
        const { ReputationEventType } = await import('@desperados/shared');

        // Determine sentiment based on quest faction/type
        let sentiment = 50; // Default positive
        let faction = undefined;

        // Check if quest has faction-specific rewards
        const repReward = questDef.rewards.find(r => r.type === 'reputation');
        if (repReward && repReward.faction) {
          faction = repReward.faction;
          sentiment = (repReward.amount || 50) > 0 ? 60 : -60;
        }

        await ReputationSpreadingService.createReputationEvent(
          characterId,
          ReputationEventType.QUEST_COMPLETED,
          character.currentLocation,
          {
            magnitude: 50,
            sentiment,
            faction,
            description: `${character.name} completed quest: ${questDef.name}`
          }
        );
      } catch (spreadError) {
        // Don't fail quest completion if reputation spreading fails
        logger.error('Failed to create reputation spreading event for quest', { error: spreadError instanceof Error ? spreadError.message : spreadError, stack: spreadError instanceof Error ? spreadError.stack : undefined });
      }

      return { quest: characterQuest, rewards: questDef.rewards };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Abandon a quest
   */
  static async abandonQuest(characterId: string, questId: string): Promise<void> {
    const result = await CharacterQuest.deleteOne({
      characterId,
      questId,
      status: 'active'
    });

    if (result.deletedCount === 0) {
      throw new AppError('Quest not found or not active', 404);
    }
  }

  /**
   * Get quest details with definition
   */
  static async getQuestDetails(
    characterId: string,
    questId: string
  ): Promise<{ quest: ICharacterQuest; definition: IQuestDefinition }> {
    const quest = await CharacterQuest.findOne({ characterId, questId });
    if (!quest) {
      throw new AppError('Quest not found', 404);
    }

    const definition = await QuestDefinition.findOne({ questId });
    if (!definition) {
      throw new AppError('Quest definition not found', 404);
    }

    return { quest, definition };
  }
}
