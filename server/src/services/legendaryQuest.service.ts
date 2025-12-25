/**
 * Legendary Quest Service
 * Manages legendary quest chains and player progress
 */

import mongoose from 'mongoose';
import { LegendaryProgress, ILegendaryProgress } from '../models/LegendaryProgress.model';
import { Character, ICharacter } from '../models/Character.model';
import { CharacterQuest, QuestDefinition } from '../models/Quest.model';
import { CharacterProgressionService } from './characterProgression.service';
import { InventoryService } from './inventory.service';
import { DollarService } from './dollar.service';
import { ReputationService } from './reputation.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import type {
  LegendaryQuestChain,
  LegendaryQuest,
  ChainProgress,
  QuestProgress,
  Objective,
  MoralChoice,
  LegendaryQuestReward,
  LegendaryQuestWorldEffect,
  GetChainResponse,
  GetQuestResponse,
  StartChainResponse,
  CompleteObjectiveResponse,
  MakeChoiceResponse,
  CompleteQuestResponse,
} from '@desperados/shared';
import {
  LEGENDARY_CHAINS,
  getLegendaryChain,
  getQuestFromChain,
  meetsPrerequisites,
  getChainsForLevel,
} from '../data/legendaryQuests';

export class LegendaryQuestService {
  /**
   * Get or create legendary progress for a character
   */
  static async getOrCreateProgress(
    characterId: mongoose.Types.ObjectId
  ): Promise<ILegendaryProgress> {
    let progress = await LegendaryProgress.findOne({ characterId });

    if (!progress) {
      progress = await LegendaryProgress.create({
        characterId,
        chainProgresses: [],
        unlockedChains: [],
        completedChains: [],
        uniqueItemsObtained: [],
        titlesUnlocked: [],
        loreEntriesUnlocked: [],
        totalQuestsCompleted: 0,
        totalPlayTime: 0,
        legendaryAchievements: [],
      });
    }

    return progress;
  }

  /**
   * Get all available legendary chains for a character
   */
  static async getAvailableChains(characterId: mongoose.Types.ObjectId): Promise<GetChainResponse[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const progress = await this.getOrCreateProgress(characterId);

    // Build player data for prerequisite checking
    // Query completed quests from CharacterQuest model
    const completedQuestDocs = await CharacterQuest.find({
      characterId,
      status: 'completed',
    }).select('questId').lean();
    const completedQuests = completedQuestDocs.map((q: any) => q.questId);

    // Transform inventory array to map
    const inventory = (character.inventory || []).reduce((map: Record<string, number>, item: any) => {
      map[item.itemId] = item.quantity;
      return map;
    }, {} as Record<string, number>);

    const playerData = {
      level: character.level,
      completedQuests,
      factionRep: {
        outlaws: character.reputation?.outlaws || 0,
        nahi_coalition: character.reputation?.coalition || 0,
        settlers: character.reputation?.settlers || 0,
      },
      inventory,
    };

    const responses: GetChainResponse[] = [];

    for (const chain of LEGENDARY_CHAINS) {
      const prereqCheck = meetsPrerequisites(chain, playerData);
      const chainProgress = progress.getChainProgress(chain.id);
      const isUnlocked = progress.isChainUnlocked(chain.id);

      responses.push({
        chain,
        progress: chainProgress,
        isUnlocked,
        canStart: prereqCheck.meets && !progress.isChainCompleted(chain.id),
        missingPrerequisites: prereqCheck.meets ? undefined : prereqCheck.missing,
      });
    }

    return responses;
  }

  /**
   * Get chains suitable for character's level
   */
  static async getChainsForCharacterLevel(
    characterId: mongoose.Types.ObjectId
  ): Promise<LegendaryQuestChain[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    return getChainsForLevel(character.level);
  }

  /**
   * Get specific chain with progress
   */
  static async getChain(
    characterId: mongoose.Types.ObjectId,
    chainId: string
  ): Promise<GetChainResponse> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const chain = getLegendaryChain(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }

    const progress = await this.getOrCreateProgress(characterId);

    // Build player data for prerequisite checking
    const playerData = {
      level: character.level,
      completedQuests: [],
      factionRep: {
        outlaws: character.reputation?.outlaws || 0,
        nahi_coalition: character.reputation?.coalition || 0,
        settlers: character.reputation?.settlers || 0,
      },
      inventory: {},
    };

    const prereqCheck = meetsPrerequisites(chain, playerData);
    const chainProgress = progress.getChainProgress(chain.id);
    const isUnlocked = progress.isChainUnlocked(chain.id);

    return {
      chain,
      progress: chainProgress,
      isUnlocked,
      canStart: prereqCheck.meets && !progress.isChainCompleted(chain.id),
      missingPrerequisites: prereqCheck.meets ? undefined : prereqCheck.missing,
    };
  }

  /**
   * Get specific quest with progress
   */
  static async getQuest(
    characterId: mongoose.Types.ObjectId,
    chainId: string,
    questId: string
  ): Promise<GetQuestResponse> {
    const chain = getLegendaryChain(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }

    const quest = getQuestFromChain(chainId, questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found in chain ${chainId}`);
    }

    const progress = await this.getOrCreateProgress(characterId);
    const chainProgress = progress.getChainProgress(chainId);
    const questProgress =
      chainProgress?.questProgresses.find((qp) => qp.questId === questId) ||
      ({
        questId,
        status: 'locked',
        completedObjectives: [],
        choicesMade: {},
        encountersCompleted: [],
      } as QuestProgress);

    return {
      quest,
      progress: questProgress,
      chain: {
        id: chain.id,
        name: chain.name,
        questNumber: quest.questNumber,
        totalQuests: chain.totalQuests,
      },
    };
  }

  /**
   * Start a legendary quest chain
   */
  static async startChain(
    characterId: mongoose.Types.ObjectId,
    chainId: string
  ): Promise<StartChainResponse> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const chain = getLegendaryChain(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }

    // Check prerequisites
    const playerData = {
      level: character.level,
      completedQuests: [],
      factionRep: {
        outlaws: character.reputation?.outlaws || 0,
        nahi_coalition: character.reputation?.coalition || 0,
        settlers: character.reputation?.settlers || 0,
      },
      inventory: {},
    };

    const prereqCheck = meetsPrerequisites(chain, playerData);
    if (!prereqCheck.meets) {
      return {
        success: false,
        chainProgress: {} as ChainProgress,
        firstQuest: {} as LegendaryQuest,
        message: `Missing prerequisites: ${prereqCheck.missing.join(', ')}`,
      };
    }

    const progress = await this.getOrCreateProgress(characterId);

    // Check if already completed
    if (progress.isChainCompleted(chainId)) {
      return {
        success: false,
        chainProgress: progress.getChainProgress(chainId)!,
        firstQuest: chain.quests[0],
        message: 'Chain already completed',
      };
    }

    // Start the chain
    progress.startChain(chainId);

    // Start the first quest
    const firstQuest = chain.quests[0];
    if (firstQuest) {
      progress.startQuest(chainId, firstQuest.id);
    }

    await progress.save();

    return {
      success: true,
      chainProgress: progress.getChainProgress(chainId)!,
      firstQuest: firstQuest,
      message: `Started legendary chain: ${chain.name}`,
    };
  }

  /**
   * Complete an objective in a quest
   */
  static async completeObjective(
    characterId: mongoose.Types.ObjectId,
    chainId: string,
    questId: string,
    objectiveId: string
  ): Promise<CompleteObjectiveResponse> {
    const progress = await this.getOrCreateProgress(characterId);
    const chainProgress = progress.getChainProgress(chainId);

    if (!chainProgress) {
      throw new Error(`Chain ${chainId} not started`);
    }

    const questProgress = chainProgress.questProgresses.find((qp) => qp.questId === questId);
    if (!questProgress) {
      throw new Error(`Quest ${questId} not started`);
    }

    const quest = getQuestFromChain(chainId, questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    // Find the objective
    const allObjectives = [
      ...quest.primaryObjectives,
      ...quest.optionalObjectives,
      ...(quest.hiddenObjectives || []),
    ];

    const objective = allObjectives.find((obj, index) => {
      const id = `${obj.type}_${index}`;
      return id === objectiveId;
    });

    if (!objective) {
      throw new Error(`Objective ${objectiveId} not found`);
    }

    // Mark as completed
    if (!questProgress.completedObjectives.includes(objectiveId)) {
      questProgress.completedObjectives.push(objectiveId);
    }

    // Check if all primary objectives are completed
    const primaryObjectiveIds = quest.primaryObjectives.map(
      (obj, index) => `${obj.type}_${index}`
    );
    const allPrimaryCompleted = primaryObjectiveIds.every((id) =>
      questProgress.completedObjectives.includes(id)
    );

    // Find next objective
    const nextObjective = allObjectives.find((obj, index) => {
      const id = `${obj.type}_${index}`;
      return !questProgress.completedObjectives.includes(id);
    });

    await progress.save();

    return {
      success: true,
      objective,
      questProgress,
      questCompleted: allPrimaryCompleted,
      nextObjective,
    };
  }

  /**
   * Make a moral choice in a quest
   */
  static async makeChoice(
    characterId: mongoose.Types.ObjectId,
    chainId: string,
    questId: string,
    choiceId: string,
    optionId: string
  ): Promise<MakeChoiceResponse> {
    const progress = await this.getOrCreateProgress(characterId);
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const chainProgress = progress.getChainProgress(chainId);
    if (!chainProgress) {
      throw new Error(`Chain ${chainId} not started`);
    }

    const questProgress = chainProgress.questProgresses.find((qp) => qp.questId === questId);
    if (!questProgress) {
      throw new Error(`Quest ${questId} not started`);
    }

    const quest = getQuestFromChain(chainId, questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    // Find the choice
    const choice = quest.moralChoices?.find((mc) => mc.id === choiceId);
    if (!choice) {
      throw new Error(`Choice ${choiceId} not found`);
    }

    // Find the selected option
    const selectedOption = choice.options.find((opt) => opt.id === optionId);
    if (!selectedOption) {
      throw new Error(`Option ${optionId} not found`);
    }

    // Record the choice
    ((questProgress.choicesMade as unknown) as Map<string, string>).set(choiceId, optionId);
    ((chainProgress.choicesMade as unknown) as Map<string, string>).set(choiceId, optionId);

    // Apply consequences
    await this.applyWorldEffects(character, selectedOption.consequences);

    // Award rewards
    const rewards = selectedOption.rewards || [];
    await this.awardRewards(character, progress, rewards);

    await progress.save();
    await character.save();

    return {
      success: true,
      choice,
      selectedOption,
      consequences: selectedOption.consequences,
      rewards,
      narrativeOutcome: `You chose: ${selectedOption.description}`,
    };
  }

  /**
   * Complete a quest
   */
  static async completeQuest(
    characterId: mongoose.Types.ObjectId,
    chainId: string,
    questId: string
  ): Promise<CompleteQuestResponse> {
    const progress = await this.getOrCreateProgress(characterId);
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const chain = getLegendaryChain(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }

    const quest = getQuestFromChain(chainId, questId);
    if (!quest) {
      throw new Error(`Quest ${questId} not found`);
    }

    // Complete the quest
    progress.completeQuest(chainId, questId);

    // Award rewards
    await this.awardRewards(character, progress, quest.questRewards);

    // Apply world effects
    await this.applyWorldEffects(character, quest.worldEffects);

    // Check for milestone rewards
    const chainProgress = progress.getChainProgress(chainId);
    if (chainProgress) {
      const milestone = chain.chainRewards.find(
        (cr) => cr.milestone === quest.questNumber
      );
      if (milestone && !chainProgress.milestonesReached.includes(quest.questNumber)) {
        chainProgress.milestonesReached.push(quest.questNumber);
        await this.awardRewards(character, progress, milestone.rewards);
      }
    }

    // Check if this was the last quest
    const chainCompleted = quest.questNumber >= chain.totalQuests;
    if (chainCompleted) {
      progress.completeChain(chainId);

      // Award chain completion rewards
      const finalReward = chain.chainRewards.find((cr) => cr.milestone === chain.totalQuests);
      if (finalReward) {
        await this.awardRewards(character, progress, finalReward.rewards);
      }

      // Unlock title
      if (!progress.titlesUnlocked.includes(chain.titleUnlocked)) {
        progress.titlesUnlocked.push(chain.titleUnlocked);
      }

      // Unlock achievement
      if (!progress.legendaryAchievements.includes(chain.achievementId)) {
        progress.legendaryAchievements.push(chain.achievementId);
      }
    }

    // Get next quest
    const nextQuest = chainCompleted
      ? undefined
      : chain.quests.find((q) => q.questNumber === quest.questNumber + 1);

    // Auto-start next quest if available
    if (nextQuest) {
      progress.startQuest(chainId, nextQuest.id);
    }

    await progress.save();
    await character.save();

    return {
      success: true,
      questProgress: progress.getQuestProgress(chainId, questId)!,
      chainProgress: progress.getChainProgress(chainId)!,
      rewards: quest.questRewards,
      nextQuest,
      chainCompleted,
      unlocks: chainCompleted
        ? {
            items: chain.uniqueItems,
            title: chain.titleUnlocked,
            achievement: chain.achievementId,
          }
        : undefined,
    };
  }

  /**
   * Award rewards to character
   * Uses proper services for transaction safety
   */
  private static async awardRewards(
    character: ICharacter,
    progress: ILegendaryProgress,
    rewards: LegendaryQuestReward[]
  ): Promise<void> {
    for (const reward of rewards) {
      try {
        switch (reward.type) {
          case 'experience':
            // Award XP using CharacterProgressionService for proper level-up handling
            await CharacterProgressionService.addExperience(
              character._id.toString(),
              reward.amount,
              'LEGENDARY_QUEST'
            );
            logger.debug(`Awarded ${reward.amount} XP from legendary quest to character ${character._id}`);
            break;

          case 'dollars':
            // Use DollarService for transaction-safe dollars operations
            await DollarService.addDollars(
              character._id as mongoose.Types.ObjectId,
              reward.amount,
              TransactionSource.QUEST_REWARD,
              { source: 'legendary_quest', currencyType: CurrencyType.DOLLAR }
            );
            logger.debug(`Awarded ${reward.amount} dollars from legendary quest to character ${character._id}`);
            break;

          case 'item':
            // Track unique items in legendary progress
            if (reward.unique && !progress.uniqueItemsObtained.includes(reward.itemId)) {
              progress.uniqueItemsObtained.push(reward.itemId);
            }
            // Add items to inventory using InventoryService
            await InventoryService.addItems(
              character._id.toString(),
              [{ itemId: reward.itemId, quantity: reward.quantity || 1 }],
              { type: 'quest', id: 'legendary_quest', name: 'Legendary Quest Reward' }
            );
            logger.debug(`Awarded item ${reward.itemId} x${reward.quantity || 1} from legendary quest to character ${character._id}`);
            break;

          case 'title':
            if (!progress.titlesUnlocked.includes(reward.titleId)) {
              progress.titlesUnlocked.push(reward.titleId);
              logger.debug(`Unlocked title ${reward.titleId} for character ${character._id}`);
            }
            break;

          case 'skill_points':
            // Add unspent skill points to character
            // These can be used to level up individual skills
            const currentSkillPoints = (character as any).unspentSkillPoints || 0;
            (character as any).unspentSkillPoints = currentSkillPoints + reward.amount;
            logger.debug(`Awarded ${reward.amount} skill points to character ${character._id}`);
            break;

          case 'property':
            // Grant property ownership to character
            // Add to character's owned properties list
            const ownedProperties: string[] = (character as any).ownedProperties || [];
            if (!ownedProperties.includes(reward.propertyId)) {
              ownedProperties.push(reward.propertyId);
              (character as any).ownedProperties = ownedProperties;
              logger.debug(`Granted property ${reward.propertyId} to character ${character._id}`);
            }
            break;
        }
      } catch (error) {
        // Log error but continue processing other rewards
        logger.error(`Failed to award ${reward.type} reward to character ${character._id}:`, error);
      }
    }
  }

  /**
   * Apply world effects from legendary quest completion
   */
  private static async applyWorldEffects(
    character: any,
    effects: LegendaryQuestWorldEffect[]
  ): Promise<void> {
    const characterId = character._id.toString();

    for (const effect of effects) {
      try {
        switch (effect.type) {
          case 'faction_reputation':
            // Apply faction reputation change
            if (effect.faction && effect.change !== undefined) {
              await ReputationService.modifyReputation(
                characterId,
                effect.faction as any,
                effect.change,
                `Legendary quest effect: ${effect.reason || 'Quest reward'}`
              );
              logger.info(
                `[LegendaryQuest] Applied faction reputation: ${effect.faction} ${effect.change > 0 ? '+' : ''}${effect.change}`
              );
            }
            break;

          case 'npc_relationship':
            // Store NPC relationship in character's npcRelationships map
            if (effect.npcId && effect.change !== undefined) {
              if (!character.npcRelationships) {
                character.npcRelationships = new Map();
              }
              const currentRel = character.npcRelationships.get(effect.npcId) || 0;
              character.npcRelationships.set(effect.npcId, currentRel + effect.change);
              await character.save();
              logger.info(
                `[LegendaryQuest] Applied NPC relationship: ${effect.npcId} ${effect.change > 0 ? '+' : ''}${effect.change}`
              );
            }
            break;

          case 'location_unlock':
            // Add location to character's unlocked locations
            if (effect.locationId) {
              if (!character.unlockedLocations) {
                character.unlockedLocations = [];
              }
              if (!character.unlockedLocations.includes(effect.locationId)) {
                character.unlockedLocations.push(effect.locationId);
                await character.save();
                logger.info(
                  `[LegendaryQuest] Unlocked location: ${effect.locationId}`
                );
              }
            }
            break;

          case 'world_state':
            // World state changes are typically handled by WorldEventService
            // Log the effect for now - specific implementations depend on the game state system
            logger.info(
              `[LegendaryQuest] World state effect: ${effect.stateKey} = ${effect.newValue} (${effect.description})`
            );
            break;

          case 'quest_unlock':
            // Make a quest available
            if (effect.questId) {
              await QuestDefinition.updateOne(
                { questId: effect.questId },
                { isActive: true }
              );
              logger.info(
                `[LegendaryQuest] Unlocked quest: ${effect.questId}`
              );
            }
            break;

          case 'quest_lock':
            // Make a quest unavailable
            if (effect.questId) {
              await QuestDefinition.updateOne(
                { questId: effect.questId },
                { isActive: false }
              );
              logger.info(
                `[LegendaryQuest] Locked quest: ${effect.questId}`
              );
            }
            break;

          default:
            logger.warn(
              `[LegendaryQuest] Unknown world effect type: ${(effect as any).type}`
            );
        }
      } catch (error) {
        // Don't fail the entire quest completion if one effect fails
        logger.error(
          `[LegendaryQuest] Failed to apply world effect:`,
          { effect, error }
        );
      }
    }
  }

  /**
   * Get player statistics
   */
  static async getPlayerStats(characterId: mongoose.Types.ObjectId) {
    const progress = await this.getOrCreateProgress(characterId);

    return {
      totalChainsStarted: progress.chainProgresses.length,
      totalChainsCompleted: progress.completedChains.length,
      totalQuestsCompleted: progress.totalQuestsCompleted,
      totalPlayTime: progress.totalPlayTime,
      uniqueItemsObtained: progress.uniqueItemsObtained.length,
      titlesUnlocked: progress.titlesUnlocked,
      legendaryAchievements: progress.legendaryAchievements,
      completionPercentage: progress.getTotalCompletionPercentage(),
      chainStats: progress.chainProgresses.map((cp) => ({
        chainId: cp.chainId,
        status: cp.status,
        questsCompleted: cp.questProgresses.filter((qp) => qp.status === 'completed').length,
        totalQuests: cp.questProgresses.length,
        playTime: cp.totalPlayTime,
        completionPercentage: progress.getCompletionPercentage(cp.chainId),
      })),
    };
  }

  /**
   * Unlock a lore entry
   */
  static async unlockLore(
    characterId: mongoose.Types.ObjectId,
    loreId: string
  ): Promise<void> {
    const progress = await this.getOrCreateProgress(characterId);

    if (!progress.loreEntriesUnlocked.includes(loreId)) {
      progress.loreEntriesUnlocked.push(loreId);
      await progress.save();
    }
  }

  /**
   * Get all unlocked lore
   */
  static async getUnlockedLore(characterId: mongoose.Types.ObjectId): Promise<string[]> {
    const progress = await this.getOrCreateProgress(characterId);
    return progress.loreEntriesUnlocked;
  }

  /**
   * Record a combat encounter completion
   */
  static async completeEncounter(
    characterId: mongoose.Types.ObjectId,
    chainId: string,
    questId: string,
    encounterId: string
  ): Promise<void> {
    const progress = await this.getOrCreateProgress(characterId);
    const questProgress = progress.getQuestProgress(chainId, questId);

    if (questProgress && !questProgress.encountersCompleted.includes(encounterId)) {
      questProgress.encountersCompleted.push(encounterId);
      await progress.save();
    }
  }

  /**
   * Update puzzle progress
   */
  static async updatePuzzleProgress(
    characterId: mongoose.Types.ObjectId,
    chainId: string,
    questId: string,
    puzzleId: string,
    progressData: any
  ): Promise<void> {
    const progress = await this.getOrCreateProgress(characterId);
    const questProgress = progress.getQuestProgress(chainId, questId);

    if (questProgress) {
      questProgress.puzzleProgress = questProgress.puzzleProgress || new Map();
      questProgress.puzzleProgress.set(puzzleId, progressData);
      await progress.save();
    }
  }
}

export default LegendaryQuestService;
