/**
 * Cosmic Quest Service
 *
 * Manages the What-Waits-Below cosmic horror questline
 */

import mongoose from 'mongoose';
import {
  CosmicProgress as CosmicProgressType,
  CosmicQuest,
  CosmicObjective,
  CosmicAct,
  CorruptionState,
  CorruptionEffect,
  Vision,
  LoreEntry,
  JournalEntry,
  SanityEvent,
  CosmicReward,
  WorldEffect
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { CosmicProgress as CosmicProgressModel, ICosmicProgress } from '../models/CosmicProgress.model';
import { AppError } from '../utils/errors';
import { COSMIC_QUESTS, getCosmicQuest, getNextQuest } from '../data/cosmicQuests';
import { COSMIC_ARTIFACTS, COSMIC_POWERS } from '../data/cosmicLore';

export class CosmicQuestService {
  /**
   * Start the cosmic questline for a character
   */
  static async startCosmicStoryline(characterId: string): Promise<{
    progress: ICosmicProgress;
    firstQuest: CosmicQuest;
  }> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      // Total Level 250 required (old level 25 × 10)
      const totalLevel = character.totalLevel || 30;
      if (totalLevel < 250) {
        throw new AppError(`Requires Total Level 250 to start this questline (current: ${totalLevel})`, 400);
      }

      // Check if already started
      const existing = await CosmicProgressModel.findByCharacter(characterId);
      if (existing) {
        throw new AppError('Cosmic questline already started', 400);
      }

      // Create initial progress
      const progress = await CosmicProgressModel.create({
        characterId: new mongoose.Types.ObjectId(characterId),
        currentQuest: 'cosmic_01_strange_happenings',
        completedQuests: [],
        currentAct: CosmicAct.WHISPERS,
        corruption: {
          level: 0,
          threshold: 100,
          effects: [],
          gainedAt: new Date(),
          lastUpdate: new Date()
        },
        discoveredLore: [],
        experiencedVisions: [],
        journalEntries: [],
        majorChoices: [],
        npcRelationships: [],
        startedAt: new Date(),
        lastProgressAt: new Date()
      });

      const firstQuest = getCosmicQuest('cosmic_01_strange_happenings')!;

      return { progress, firstQuest };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to start cosmic storyline', 500);
    }
  }

  /**
   * Get character's cosmic progress
   */
  static async getCosmicProgress(characterId: string): Promise<ICosmicProgress | null> {
    try {
      return await CosmicProgressModel.findByCharacter(characterId);
    } catch (error) {
      throw new AppError('Failed to retrieve cosmic progress', 500);
    }
  }

  /**
   * Add corruption to character
   */
  static async addCorruption(
    characterId: string,
    amount: number,
    source: string
  ): Promise<CorruptionState> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      progress.corruption.level = Math.min(100, progress.corruption.level + amount);
      progress.corruption.lastUpdate = new Date();

      // Check for new corruption effects
      const newEffects = this.checkCorruptionEffects(progress.corruption.level);
      for (const effect of newEffects) {
        if (!progress.corruption.effects.find(e => e.id === effect.id)) {
          progress.corruption.effects.push(effect);
        }
      }

      await progress.save();

      return progress.corruption;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add corruption', 500);
    }
  }

  /**
   * Determine corruption effects based on level
   */
  private static checkCorruptionEffects(corruptionLevel: number): CorruptionEffect[] {
    const effects: CorruptionEffect[] = [];

    if (corruptionLevel >= 20 && corruptionLevel < 40) {
      effects.push({
        id: 'corruption_minor_sight',
        name: 'Cosmic Awareness',
        description: 'You occasionally see things that aren\'t there - or are they?',
        severity: 'minor',
        isPermanent: false,
        gainedAt: new Date()
      });
    }

    if (corruptionLevel >= 40 && corruptionLevel < 60) {
      effects.push({
        id: 'corruption_moderate_change',
        name: 'Physical Alteration',
        description: 'Your eyes occasionally glow faintly in darkness',
        severity: 'moderate',
        visualEffect: 'Bioluminescent eyes',
        isPermanent: false,
        gainedAt: new Date()
      });
    }

    if (corruptionLevel >= 60 && corruptionLevel < 80) {
      effects.push({
        id: 'corruption_severe_transformation',
        name: 'Partial Transformation',
        description: 'Your body shows clear signs of otherworldly change',
        severity: 'severe',
        statModifiers: {
          cunning: 5,
          spirit: -3
        },
        visualEffect: 'Visible anatomical changes',
        isPermanent: true,
        gainedAt: new Date()
      });
    }

    if (corruptionLevel >= 80) {
      effects.push({
        id: 'corruption_catastrophic_merge',
        name: 'Threshold of Transcendence',
        description: 'You are on the verge of losing your individual identity',
        severity: 'catastrophic',
        statModifiers: {
          cunning: 10,
          spirit: -10,
          combat: 5
        },
        visualEffect: 'Clearly inhuman appearance',
        isPermanent: true,
        gainedAt: new Date()
      });
    }

    return effects;
  }

  /**
   * Add a vision to character's experience
   */
  static async addVision(characterId: string, vision: Vision): Promise<void> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      // Store vision ID (model stores IDs, not full objects)
      if (!progress.experiencedVisions.includes(vision.id)) {
        progress.experiencedVisions.push(vision.id);
      }

      // Unlock related lore
      if (vision.revealsLore) {
        for (const loreId of vision.revealsLore) {
          if (!progress.discoveredLore.includes(loreId)) {
            progress.discoveredLore.push(loreId);
          }
        }
      }

      await progress.save();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add vision', 500);
    }
  }

  /**
   * Add journal entry
   */
  static async addJournalEntry(characterId: string, entry: JournalEntry): Promise<void> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      // Convert from shared JournalEntry to model IJournalEntry format
      const modelEntry = {
        entryId: entry.id,
        title: entry.title,
        content: entry.content,
        category: entry.category as 'lore' | 'vision' | 'discovery' | 'choice',
        unlockedAt: entry.timestamp || new Date()
      };

      // Check if entry already exists
      const exists = progress.journalEntries.some(e => e.entryId === modelEntry.entryId);
      if (!exists) {
        progress.journalEntries.push(modelEntry);
        await progress.save();
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add journal entry', 500);
    }
  }

  /**
   * Complete a cosmic objective
   */
  static async completeObjective(
    characterId: string,
    questId: string,
    objectiveId: string
  ): Promise<{
    objective: CosmicObjective;
    questCompleted: boolean;
    visionTriggered?: Vision;
    corruptionGained: number;
  }> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      const quest = getCosmicQuest(questId);
      if (!quest) {
        throw new AppError('Quest not found', 404);
      }

      const objective = quest.objectives.find(obj => obj.id === objectiveId);
      if (!objective) {
        throw new AppError('Objective not found', 404);
      }

      // Mark objective as complete
      objective.current = objective.required;

      // Add corruption if applicable
      let corruptionGained = 0;
      if (objective.corruptionOnComplete) {
        await this.addCorruption(characterId, objective.corruptionOnComplete, `Objective: ${objectiveId}`);
        corruptionGained = objective.corruptionOnComplete;
      }

      // Check if all objectives complete
      const allComplete = quest.objectives.every(obj => obj.current >= obj.required);

      let visionTriggered: Vision | undefined;

      // If quest complete, handle completion
      if (allComplete) {
        const result = await this.completeQuest(characterId, questId);
        visionTriggered = result.visionTriggered;
      }

      return {
        objective,
        questCompleted: allComplete,
        visionTriggered,
        corruptionGained
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to complete objective', 500);
    }
  }

  /**
   * Complete a cosmic quest
   */
  static async completeQuest(
    characterId: string,
    questId: string
  ): Promise<{
    rewards: CosmicReward[];
    nextQuest?: CosmicQuest;
    visionTriggered?: Vision;
    corruptionGained: number;
  }> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      const quest = getCosmicQuest(questId);
      if (!quest) {
        throw new AppError('Quest not found', 404);
      }

      // Add to completed quests
      if (!progress.completedQuests.includes(questId)) {
        progress.completedQuests.push(questId);
      }

      // Add base corruption
      await this.addCorruption(characterId, quest.corruptionGain, `Quest: ${questId}`);

      // Add lore (store IDs only)
      for (const lore of quest.lore) {
        if (!progress.discoveredLore.includes(lore.id)) {
          progress.discoveredLore.push(lore.id);
        }
      }

      // Add journal entries
      for (const journal of quest.journals) {
        await this.addJournalEntry(characterId, journal);
      }

      // Get next quest
      const nextQuest = getNextQuest(questId);
      if (nextQuest) {
        progress.currentQuest = nextQuest.id;
        progress.currentAct = nextQuest.act;
      } else {
        progress.currentQuest = '';
      }

      progress.lastProgressAt = new Date();
      await progress.save();

      // Grant rewards (simplified - in production would update character model)
      const rewards = quest.baseRewards;

      // Check for triggered visions
      let visionTriggered: Vision | undefined;
      if (quest.visions.length > 0) {
        // Find first vision character is eligible for
        visionTriggered = quest.visions.find(v =>
          !v.corruptionRequired || progress.corruption.level >= v.corruptionRequired
        );

        if (visionTriggered) {
          await this.addVision(characterId, visionTriggered);
        }
      }

      return {
        rewards,
        nextQuest,
        visionTriggered,
        corruptionGained: quest.corruptionGain
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to complete quest', 500);
    }
  }

  /**
   * Make a major choice in the questline
   */
  static async makeChoice(
    characterId: string,
    questId: string,
    choiceId: string
  ): Promise<{
    corruptionChange: number;
    endingPath?: string;
  }> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      const quest = getCosmicQuest(questId);
      if (!quest) {
        throw new AppError('Quest not found', 404);
      }

      // Record the choice
      progress.majorChoices.push({
        questId,
        choiceId,
        chosenAt: new Date()
      });

      // Find choice reward
      const choiceReward = quest.choiceRewards?.find(cr => cr.choiceId === choiceId);

      let corruptionChange = 0;

      if (choiceReward) {
        // Update ending path
        if (choiceReward.endingPath) {
          progress.ending = choiceReward.endingPath;
        }

        // Apply corruption changes (if any)
        // This is simplified - would need to look at choice details
      }

      await progress.save();

      return {
        corruptionChange,
        endingPath: progress.ending
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to make choice', 500);
    }
  }

  /**
   * Get available cosmic quests for character
   */
  static async getAvailableQuests(characterId: string): Promise<CosmicQuest[]> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        return [];
      }

      const character = await Character.findById(characterId);
      if (!character) {
        return [];
      }

      // Total Level for filtering (old level × 10)
      const totalLevel = character.totalLevel || 30;
      return COSMIC_QUESTS.filter(quest => {
        // Total Level requirement (old level × 10)
        if (totalLevel < quest.levelRequirement * 10) {
          return false;
        }

        // Already completed
        if (progress.completedQuests.includes(quest.id)) {
          return false;
        }

        // Previous quest requirement
        if (quest.previousQuest && !progress.completedQuests.includes(quest.previousQuest)) {
          return false;
        }

        // Corruption maximum (some quests lock if too corrupted)
        if (quest.corruptionMaximum && progress.corruption.level > quest.corruptionMaximum) {
          return false;
        }

        return true;
      });
    } catch (error) {
      throw new AppError('Failed to get available quests', 500);
    }
  }

  /**
   * Get lore discovered by character
   */
  static async getDiscoveredLore(
    characterId: string,
    category?: string
  ): Promise<LoreEntry[]> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        return [];
      }

      // Model stores lore IDs, need to fetch full lore from quest data
      const lore: LoreEntry[] = [];
      for (const loreId of progress.discoveredLore) {
        // Search through all quests to find the lore entry
        for (const quest of COSMIC_QUESTS) {
          const loreEntry = quest.lore.find(l => l.id === loreId);
          if (loreEntry) {
            lore.push(loreEntry);
            break;
          }
        }
      }

      if (category) {
        return lore.filter(l => l.category === category);
      }

      return lore;
    } catch (error) {
      throw new AppError('Failed to get discovered lore', 500);
    }
  }

  /**
   * Get experienced visions
   */
  static async getExperiencedVisions(characterId: string): Promise<Vision[]> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        return [];
      }

      // Model stores vision IDs, need to fetch full visions from quest data
      const visions: Vision[] = [];
      for (const visionId of progress.experiencedVisions) {
        // Search through all quests to find the vision
        for (const quest of COSMIC_QUESTS) {
          const vision = quest.visions.find(v => v.id === visionId);
          if (vision) {
            visions.push(vision);
            break;
          }
        }
      }

      return visions;
    } catch (error) {
      throw new AppError('Failed to get experienced visions', 500);
    }
  }

  /**
   * Get corruption state
   */
  static async getCorruptionState(characterId: string): Promise<{
    corruption: CorruptionState;
    warningLevel: 'safe' | 'warning' | 'danger' | 'critical';
    canBeReversed: boolean;
  }> {
    try {
      const progress = await CosmicProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Cosmic questline not started', 400);
      }

      const level = progress.corruption.level;

      let warningLevel: 'safe' | 'warning' | 'danger' | 'critical';
      if (level < 20) {
        warningLevel = 'safe';
      } else if (level < 40) {
        warningLevel = 'warning';
      } else if (level < 60) {
        warningLevel = 'danger';
      } else {
        warningLevel = 'critical';
      }

      const canBeReversed = level < 60; // Stage 3 is the point of no return

      return {
        corruption: progress.corruption,
        warningLevel,
        canBeReversed
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get corruption state', 500);
    }
  }

  /**
   * Trigger a sanity event
   */
  static async triggerSanityEvent(
    characterId: string,
    event: SanityEvent
  ): Promise<{
    corruptionGained: number;
    visionTriggered?: Vision;
  }> {
    try {
      // Add corruption from event
      await this.addCorruption(characterId, event.corruptionGain, `Sanity Event: ${event.id}`);

      let visionTriggered: Vision | undefined;

      // Trigger vision if specified
      if (event.visionTriggered) {
        // Find vision in quests
        for (const quest of COSMIC_QUESTS) {
          const vision = quest.visions.find(v => v.id === event.visionTriggered);
          if (vision) {
            await this.addVision(characterId, vision);
            visionTriggered = vision;
            break;
          }
        }
      }

      return {
        corruptionGained: event.corruptionGain,
        visionTriggered
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to trigger sanity event', 500);
    }
  }
}
