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
    const character = await Character.findById(characterId);
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
    const character = await Character.findById(characterId);
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
          if (objective.type === objectiveType && objective.target === target) {
            objective.current = Math.min(objective.current + amount, objective.required);
            updated = true;
          }
        }

        if (updated) {
          await quest.save();
          updatedQuests.push(quest);

          // Check if all objectives complete
          const allComplete = quest.objectives.every(obj => obj.current >= obj.required);
          if (allComplete) {
            await this.completeQuest(characterId, quest.questId);
          }
        }
      }

      return updatedQuests;
    }, { ttl: 30, retries: 3 });
  }

  /**
   * Complete a quest and grant rewards
   */
  static async completeQuest(
    characterId: string,
    questId: string
  ): Promise<{ quest: ICharacterQuest; rewards: QuestReward[] }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const characterQuest = await CharacterQuest.findOne({
        characterId,
        questId,
        status: 'active'
      }).session(session);

      if (!characterQuest) {
        throw new AppError('Quest not found or not active', 404);
      }

      // Verify all objectives complete
      const allComplete = characterQuest.objectives.every(obj => obj.current >= obj.required);
      if (!allComplete) {
        throw new AppError('Not all objectives completed', 400);
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
              await character.addExperience(reward.amount);
            }
            break;
          case 'item':
            if (reward.itemId) {
              const existing = character.inventory.find(inv => inv.itemId === reward.itemId);
              if (existing) {
                existing.quantity += 1;
              } else {
                character.inventory.push({
                  itemId: reward.itemId,
                  quantity: 1,
                  acquiredAt: new Date()
                });
              }
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

      await character.save({ session });
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
