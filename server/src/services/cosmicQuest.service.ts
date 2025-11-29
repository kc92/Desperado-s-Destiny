/**
 * Cosmic Quest Service
 *
 * Manages the What-Waits-Below cosmic horror questline
 */

import mongoose from 'mongoose';
import {
  CosmicProgress,
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
import { AppError } from '../utils/errors';
import { COSMIC_QUESTS, getCosmicQuest, getNextQuest } from '../data/cosmicQuests';
import { COSMIC_ARTIFACTS, COSMIC_POWERS } from '../data/cosmicLore';

// Temporary in-memory storage for cosmic progress
// In production, this would be a MongoDB model
const cosmicProgressMap = new Map<string, CosmicProgress>();

export class CosmicQuestService {
  /**
   * Start the cosmic questline for a character
   */
  static async startCosmicStoryline(characterId: string): Promise<{
    progress: CosmicProgress;
    firstQuest: CosmicQuest;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    if (character.level < 25) {
      throw new AppError('Character must be level 25 to start this questline', 400);
    }

    // Check if already started
    const existing = cosmicProgressMap.get(characterId);
    if (existing) {
      throw new AppError('Cosmic questline already started', 400);
    }

    // Create initial progress
    const progress: CosmicProgress = {
      characterId,
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
    };

    cosmicProgressMap.set(characterId, progress);

    const firstQuest = getCosmicQuest('cosmic_01_strange_happenings')!;

    return { progress, firstQuest };
  }

  /**
   * Get character's cosmic progress
   */
  static async getCosmicProgress(characterId: string): Promise<CosmicProgress | null> {
    return cosmicProgressMap.get(characterId) || null;
  }

  /**
   * Add corruption to character
   */
  static async addCorruption(
    characterId: string,
    amount: number,
    source: string
  ): Promise<CorruptionState> {
    const progress = cosmicProgressMap.get(characterId);
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

    cosmicProgressMap.set(characterId, progress);

    return progress.corruption;
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
    const progress = cosmicProgressMap.get(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    vision.timestamp = new Date();
    progress.experiencedVisions.push(vision);

    // Unlock related lore
    if (vision.revealsLore) {
      for (const loreId of vision.revealsLore) {
        // Find lore in quest data and add to discovered
        // This is simplified - in production, would fetch from lore database
        const lore: LoreEntry = {
          id: loreId,
          category: 'entity_dreams' as any,
          title: 'Revealed Knowledge',
          content: 'Content revealed through vision',
          source: 'Vision',
          discoveredAt: new Date()
        };
        progress.discoveredLore.push(lore);
      }
    }

    cosmicProgressMap.set(characterId, progress);
  }

  /**
   * Add journal entry
   */
  static async addJournalEntry(characterId: string, entry: JournalEntry): Promise<void> {
    const progress = cosmicProgressMap.get(characterId);
    if (!progress) {
      throw new AppError('Cosmic questline not started', 400);
    }

    entry.timestamp = new Date();
    progress.journalEntries.push(entry);
    cosmicProgressMap.set(characterId, progress);
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
    const progress = cosmicProgressMap.get(characterId);
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
    const progress = cosmicProgressMap.get(characterId);
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

    // Add lore
    for (const lore of quest.lore) {
      lore.discoveredAt = new Date();
      lore.discoveredBy = characterId;
      progress.discoveredLore.push(lore);
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
      progress.currentQuest = undefined;
    }

    progress.lastProgressAt = new Date();
    cosmicProgressMap.set(characterId, progress);

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
    const progress = cosmicProgressMap.get(characterId);
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
      timestamp: new Date()
    });

    // Find choice reward
    const choiceReward = quest.choiceRewards?.find(cr => cr.choiceId === choiceId);

    let corruptionChange = 0;

    if (choiceReward) {
      // Update ending path
      if (choiceReward.endingPath) {
        progress.endingPath = choiceReward.endingPath;
      }

      // Apply corruption changes (if any)
      // This is simplified - would need to look at choice details
    }

    cosmicProgressMap.set(characterId, progress);

    return {
      corruptionChange,
      endingPath: progress.endingPath
    };
  }

  /**
   * Get available cosmic quests for character
   */
  static async getAvailableQuests(characterId: string): Promise<CosmicQuest[]> {
    const progress = cosmicProgressMap.get(characterId);
    if (!progress) {
      return [];
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return [];
    }

    return COSMIC_QUESTS.filter(quest => {
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

      // Corruption maximum (some quests lock if too corrupted)
      if (quest.corruptionMaximum && progress.corruption.level > quest.corruptionMaximum) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get lore discovered by character
   */
  static async getDiscoveredLore(
    characterId: string,
    category?: string
  ): Promise<LoreEntry[]> {
    const progress = cosmicProgressMap.get(characterId);
    if (!progress) {
      return [];
    }

    let lore = progress.discoveredLore;

    if (category) {
      lore = lore.filter(l => l.category === category);
    }

    return lore;
  }

  /**
   * Get experienced visions
   */
  static async getExperiencedVisions(characterId: string): Promise<Vision[]> {
    const progress = cosmicProgressMap.get(characterId);
    if (!progress) {
      return [];
    }

    return progress.experiencedVisions;
  }

  /**
   * Get corruption state
   */
  static async getCorruptionState(characterId: string): Promise<{
    corruption: CorruptionState;
    warningLevel: 'safe' | 'warning' | 'danger' | 'critical';
    canBeReversed: boolean;
  }> {
    const progress = cosmicProgressMap.get(characterId);
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
  }
}
