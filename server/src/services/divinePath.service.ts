/**
 * Divine Path Service - Divine Struggle System
 *
 * Manages The Eternal Struggle divine/demonic questline
 * Rebranded from Cosmic Quest Service (cosmic horror → angels & demons)
 */

import mongoose from 'mongoose';
import {
  CosmicProgress as DivineProgressType,
  CosmicQuest as DivineQuest,
  CosmicObjective as DivineObjective,
  CosmicAct as DivineAct,
  CorruptionState as SinState,
  CorruptionEffect as SinEffect,
  Vision as DivineVision,
  LoreEntry as SacredLore,
  JournalEntry,
  SanityEvent as FaithEvent,
  CosmicReward as DivineReward,
  WorldEffect
} from '@desperados/shared';
import { Character } from '../models/Character.model';
import { CosmicProgress as DivineProgressModel, ICosmicProgress as IDivineProgress } from '../models/CosmicProgress.model';
import { AppError } from '../utils/errors';
import { COSMIC_QUESTS as DIVINE_QUESTS, getCosmicQuest as getDivineQuest, getNextQuest } from '../data/cosmicQuests';
import { COSMIC_ARTIFACTS as SACRED_RELICS, COSMIC_POWERS as DIVINE_POWERS } from '../data/cosmicLore';

// Re-export type aliases for divine terminology
export type { DivineProgressType as DivineProgress };
export type { DivineQuest };
export type { DivineObjective };
export type { DivineAct };
export type { SinState };
export type { SinEffect };
export type { DivineVision };
export type { SacredLore };
export type { DivineReward };

// Import original service for reference (use CosmicQuestService directly if you need the original)
import { CosmicQuestService as OriginalCosmicQuestService } from './cosmicQuest.service';
export const CosmicQuestServiceRef = OriginalCosmicQuestService;

export class DivinePathService {
  /**
   * Start the divine path questline for a character
   */
  static async startDivineStoryline(characterId: string): Promise<{
    progress: IDivineProgress;
    firstQuest: DivineQuest;
  }> {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      if (character.level < 25) {
        throw new AppError('Character must be level 25 to begin the divine path', 400);
      }

      // Check if already started
      const existing = await DivineProgressModel.findByCharacter(characterId);
      if (existing) {
        throw new AppError('Divine path already begun', 400);
      }

      // Create initial progress
      const progress = await DivineProgressModel.create({
        characterId: new mongoose.Types.ObjectId(characterId),
        currentQuest: 'cosmic_01_strange_happenings', // Will be renamed in data phase
        completedQuests: [],
        currentAct: DivineAct.WHISPERS, // WHISPERS -> Divine Whispers
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

      const firstQuest = getDivineQuest('cosmic_01_strange_happenings')!;

      return { progress, firstQuest };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to start divine path', 500);
    }
  }

  /**
   * Get character's divine path progress
   */
  static async getDivineProgress(characterId: string): Promise<IDivineProgress | null> {
    try {
      return await DivineProgressModel.findByCharacter(characterId);
    } catch (error) {
      throw new AppError('Failed to retrieve divine progress', 500);
    }
  }

  /**
   * Add sin to character (exposure to demonic influence)
   */
  static async addSin(
    characterId: string,
    amount: number,
    source: string
  ): Promise<SinState> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
      }

      progress.corruption.level = Math.min(100, progress.corruption.level + amount);
      progress.corruption.lastUpdate = new Date();

      // Check for new sin effects
      const newEffects = this.checkSinEffects(progress.corruption.level);
      for (const effect of newEffects) {
        if (!progress.corruption.effects.find(e => e.id === effect.id)) {
          progress.corruption.effects.push(effect);
        }
      }

      await progress.save();

      return progress.corruption;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add sin', 500);
    }
  }

  /**
   * Determine sin effects based on level
   */
  private static checkSinEffects(sinLevel: number): SinEffect[] {
    const effects: SinEffect[] = [];

    if (sinLevel >= 20 && sinLevel < 40) {
      effects.push({
        id: 'sin_minor_sight',
        name: 'Spiritual Awareness',
        description: 'You occasionally perceive angels and demons others cannot see.',
        severity: 'minor',
        isPermanent: false,
        gainedAt: new Date()
      });
    }

    if (sinLevel >= 40 && sinLevel < 60) {
      effects.push({
        id: 'sin_moderate_change',
        name: 'Divine Mark',
        description: 'Your eyes occasionally glow with celestial light - or hellfire',
        severity: 'moderate',
        visualEffect: 'Glowing eyes in moments of spiritual intensity',
        isPermanent: false,
        gainedAt: new Date()
      });
    }

    if (sinLevel >= 60 && sinLevel < 80) {
      effects.push({
        id: 'sin_severe_transformation',
        name: 'Partial Manifestation',
        description: 'Your body shows signs of divine or demonic influence',
        severity: 'severe',
        statModifiers: {
          cunning: 5,
          spirit: -3
        },
        visualEffect: 'Visible marks of celestial or infernal nature',
        isPermanent: true,
        gainedAt: new Date()
      });
    }

    if (sinLevel >= 80) {
      effects.push({
        id: 'sin_catastrophic_merge',
        name: 'Threshold of Transcendence',
        description: 'You stand at the edge of becoming something more - or less - than human',
        severity: 'catastrophic',
        statModifiers: {
          cunning: 10,
          spirit: -10,
          combat: 5
        },
        visualEffect: 'Clearly supernatural appearance',
        isPermanent: true,
        gainedAt: new Date()
      });
    }

    return effects;
  }

  /**
   * Add a divine vision to character's experience
   */
  static async addVision(characterId: string, vision: DivineVision): Promise<void> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
      }

      // Store vision ID (model stores IDs, not full objects)
      if (!progress.experiencedVisions.includes(vision.id)) {
        progress.experiencedVisions.push(vision.id);
      }

      // Unlock related sacred lore
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
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
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
   * Complete a divine path objective
   */
  static async completeObjective(
    characterId: string,
    questId: string,
    objectiveId: string
  ): Promise<{
    objective: DivineObjective;
    questCompleted: boolean;
    visionTriggered?: DivineVision;
    sinGained: number;
  }> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
      }

      const quest = getDivineQuest(questId);
      if (!quest) {
        throw new AppError('Quest not found', 404);
      }

      const objective = quest.objectives.find(obj => obj.id === objectiveId);
      if (!objective) {
        throw new AppError('Objective not found', 404);
      }

      // Mark objective as complete
      objective.current = objective.required;

      // Add sin if applicable
      let sinGained = 0;
      if (objective.corruptionOnComplete) {
        await this.addSin(characterId, objective.corruptionOnComplete, `Objective: ${objectiveId}`);
        sinGained = objective.corruptionOnComplete;
      }

      // Check if all objectives complete
      const allComplete = quest.objectives.every(obj => obj.current >= obj.required);

      let visionTriggered: DivineVision | undefined;

      // If quest complete, handle completion
      if (allComplete) {
        const result = await this.completeQuest(characterId, questId);
        visionTriggered = result.visionTriggered;
      }

      return {
        objective,
        questCompleted: allComplete,
        visionTriggered,
        sinGained
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to complete objective', 500);
    }
  }

  /**
   * Complete a divine quest
   */
  static async completeQuest(
    characterId: string,
    questId: string
  ): Promise<{
    rewards: DivineReward[];
    nextQuest?: DivineQuest;
    visionTriggered?: DivineVision;
    sinGained: number;
  }> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
      }

      const quest = getDivineQuest(questId);
      if (!quest) {
        throw new AppError('Quest not found', 404);
      }

      // Add to completed quests
      if (!progress.completedQuests.includes(questId)) {
        progress.completedQuests.push(questId);
      }

      // Add base sin
      await this.addSin(characterId, quest.corruptionGain, `Quest: ${questId}`);

      // Add sacred lore (store IDs only)
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

      // Grant rewards
      const rewards = quest.baseRewards;

      // Check for triggered visions
      let visionTriggered: DivineVision | undefined;
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
        sinGained: quest.corruptionGain
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to complete quest', 500);
    }
  }

  /**
   * Make a major choice in the divine path
   */
  static async makeChoice(
    characterId: string,
    questId: string,
    choiceId: string
  ): Promise<{
    sinChange: number;
    endingPath?: string;
  }> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
      }

      const quest = getDivineQuest(questId);
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

      let sinChange = 0;

      if (choiceReward) {
        // Update ending path
        if (choiceReward.endingPath) {
          progress.ending = choiceReward.endingPath;
        }
      }

      await progress.save();

      return {
        sinChange,
        endingPath: progress.ending
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to make choice', 500);
    }
  }

  /**
   * Get available divine quests for character
   */
  static async getAvailableQuests(characterId: string): Promise<DivineQuest[]> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        return [];
      }

      const character = await Character.findById(characterId);
      if (!character) {
        return [];
      }

      return DIVINE_QUESTS.filter(quest => {
        // Level requirement
        if (character.level < quest.levelRequirement) {
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

        // Sin maximum (some quests lock if too tainted)
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
   * Get sacred lore discovered by character
   */
  static async getDiscoveredLore(
    characterId: string,
    category?: string
  ): Promise<SacredLore[]> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        return [];
      }

      // Model stores lore IDs, need to fetch full lore from quest data
      const lore: SacredLore[] = [];
      for (const loreId of progress.discoveredLore) {
        // Search through all quests to find the lore entry
        for (const quest of DIVINE_QUESTS) {
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
  static async getExperiencedVisions(characterId: string): Promise<DivineVision[]> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        return [];
      }

      // Model stores vision IDs, need to fetch full visions from quest data
      const visions: DivineVision[] = [];
      for (const visionId of progress.experiencedVisions) {
        // Search through all quests to find the vision
        for (const quest of DIVINE_QUESTS) {
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
   * Get sin state (spiritual corruption level)
   */
  static async getSinState(characterId: string): Promise<{
    sin: SinState;
    warningLevel: 'grace' | 'tempted' | 'tainted' | 'damned';
    canBeRedeemed: boolean;
  }> {
    try {
      const progress = await DivineProgressModel.findByCharacter(characterId);
      if (!progress) {
        throw new AppError('Divine path not started', 400);
      }

      const level = progress.corruption.level;

      let warningLevel: 'grace' | 'tempted' | 'tainted' | 'damned';
      if (level < 20) {
        warningLevel = 'grace';
      } else if (level < 40) {
        warningLevel = 'tempted';
      } else if (level < 60) {
        warningLevel = 'tainted';
      } else {
        warningLevel = 'damned';
      }

      const canBeRedeemed = level < 60; // Stage 3 is the point of no redemption

      return {
        sin: progress.corruption,
        warningLevel,
        canBeRedeemed
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get sin state', 500);
    }
  }

  /**
   * Trigger a faith event (divine/demonic encounter)
   */
  static async triggerFaithEvent(
    characterId: string,
    event: FaithEvent
  ): Promise<{
    sinGained: number;
    visionTriggered?: DivineVision;
  }> {
    try {
      // Add sin from event
      await this.addSin(characterId, event.corruptionGain, `Faith Event: ${event.id}`);

      let visionTriggered: DivineVision | undefined;

      // Trigger vision if specified
      if (event.visionTriggered) {
        // Find vision in quests
        for (const quest of DIVINE_QUESTS) {
          const vision = quest.visions.find(v => v.id === event.visionTriggered);
          if (vision) {
            await this.addVision(characterId, vision);
            visionTriggered = vision;
            break;
          }
        }
      }

      return {
        sinGained: event.corruptionGain,
        visionTriggered
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to trigger faith event', 500);
    }
  }
}

// Backwards compatibility alias
export const CosmicQuestService = DivinePathService;
