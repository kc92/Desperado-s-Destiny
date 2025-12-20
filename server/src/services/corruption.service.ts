/**
 * Corruption Service - Phase 14, Wave 14.1
 *
 * Manages character corruption, madness, and cosmic horror effects
 */

import mongoose from 'mongoose';
import { CharacterCorruption, ICharacterCorruption } from '../models/CharacterCorruption.model';
import { Character } from '../models/Character.model';
import {
  CorruptionLevel,
  MadnessType,
  ForbiddenKnowledgeType,
  MadnessEffect,
  COSMIC_HORROR_CONSTANTS,
  getCorruptionLevel
} from '@desperados/shared';
import { getCorruptionEffects } from '../data/corruptionEffects';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

export class CorruptionService {
  /**
   * Get or create corruption tracker for character
   */
  static async getOrCreateTracker(characterId: string): Promise<ICharacterCorruption> {
    let tracker = await CharacterCorruption.findByCharacterId(characterId);

    if (!tracker) {
      tracker = await CharacterCorruption.createForCharacter(characterId);
      logger.info(`Created corruption tracker for character ${characterId}`);
    }

    // Clean up expired madness
    tracker.removeExpiredMadness();
    if (tracker.isModified()) {
      await tracker.save();
    }

    return tracker;
  }

  /**
   * Apply corruption gain
   */
  static async gainCorruption(
    characterId: string,
    amount: number,
    source: string,
    location?: string
  ): Promise<{
    newCorruption: number;
    corruptionLevel: CorruptionLevel;
    levelChanged: boolean;
    madnessGained: MadnessEffect | null;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const oldLevel = tracker.corruptionLevel;

    await tracker.gainCorruption(amount, source, location);

    const levelChanged = oldLevel !== tracker.corruptionLevel;
    let madnessGained: MadnessEffect | null = null;

    // Roll for madness
    if (tracker.currentCorruption > COSMIC_HORROR_CONSTANTS.CORRUPTION_CLEAN_MAX) {
      madnessGained = await this.rollForMadness(tracker);
      if (madnessGained) {
        tracker.addMadness(madnessGained);
        await tracker.save();
      }
    }

    const message = this.generateCorruptionMessage(tracker.corruptionLevel, amount, levelChanged);

    logger.info(
      `Character ${characterId} gained ${amount} corruption. New total: ${tracker.currentCorruption}`
    );

    return {
      newCorruption: tracker.currentCorruption,
      corruptionLevel: tracker.corruptionLevel,
      levelChanged,
      madnessGained,
      message
    };
  }

  /**
   * Apply corruption loss (purge)
   */
  static async loseCorruption(
    characterId: string,
    amount: number,
    method: string
  ): Promise<{
    newCorruption: number;
    corruptionLevel: CorruptionLevel;
    levelChanged: boolean;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const oldLevel = tracker.corruptionLevel;

    await tracker.loseCorruption(amount, method);

    const levelChanged = oldLevel !== tracker.corruptionLevel;
    const message = `Purged ${amount} corruption via ${method}. Current: ${tracker.currentCorruption}`;

    logger.info(`Character ${characterId} lost ${amount} corruption via ${method}`);

    return {
      newCorruption: tracker.currentCorruption,
      corruptionLevel: tracker.corruptionLevel,
      levelChanged,
      message
    };
  }

  /**
   * Handle death - reduce corruption
   */
  static async handleDeath(characterId: string): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    const reductionAmount = COSMIC_HORROR_CONSTANTS.DEATH_CORRUPTION_RESET;

    await tracker.loseCorruption(reductionAmount, 'Death');
    tracker.deathsToCorruption += 1;

    // Remove some active madness
    if (tracker.activeMadness.length > 0) {
      tracker.activeMadness = tracker.activeMadness.slice(0, Math.floor(tracker.activeMadness.length / 2));
    }

    await tracker.save();

    logger.info(
      `Character ${characterId} died. Corruption reduced by ${reductionAmount}. New total: ${tracker.currentCorruption}`
    );
  }

  /**
   * Apply corruption from being in The Scar
   */
  static async applyScarExposure(
    characterId: string,
    minutesInScar: number,
    deepInScar: boolean = false
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);

    const hoursInScar = minutesInScar / 60;
    const rate = deepInScar
      ? COSMIC_HORROR_CONSTANTS.SCAR_DEEP_CORRUPTION_PER_HOUR
      : COSMIC_HORROR_CONSTANTS.SCAR_BASE_CORRUPTION_PER_HOUR;

    const corruptionGain = hoursInScar * rate;

    if (corruptionGain > 0) {
      await tracker.gainCorruption(
        corruptionGain,
        deepInScar ? 'The Scar (Deep)' : 'The Scar',
        'The Scar'
      );

      tracker.timeInScar += minutesInScar;
      await tracker.save();
    }
  }

  /**
   * Roll for madness based on corruption
   */
  static async rollForMadness(tracker: ICharacterCorruption): Promise<MadnessEffect | null> {
    // Check if at max madness
    if (tracker.activeMadness.length >= COSMIC_HORROR_CONSTANTS.MAX_ACTIVE_MADNESS) {
      return null;
    }

    // Calculate chance based on corruption
    const corruptionTens = Math.floor(tracker.currentCorruption / 10);
    const baseChance = corruptionTens * COSMIC_HORROR_CONSTANTS.MADNESS_CHANCE_PER_CORRUPTION_10;

    // Apply resistance
    const resistance = tracker.madnessResistance / 100;
    const finalChance = baseChance * (1 - resistance);

    // Roll
    if (!SecureRNG.chance(finalChance)) {
      return null;
    }

    // Generate madness
    return this.generateRandomMadness();
  }

  /**
   * Generate random madness
   */
  static generateRandomMadness(): MadnessEffect {
    const types = Object.values(MadnessType);
    const type = SecureRNG.select(types);

    const madnessTemplates: { [key in MadnessType]: Partial<MadnessEffect> } = {
      [MadnessType.PARANOIA]: {
        name: 'Paranoia',
        description: 'Everyone is watching. Everyone is plotting. You know the truth.',
        gameplayEffects: {
          npcHostility: 20,
          statPenalty: -5
        },
        triggerConditions: ['In towns', 'Around NPCs'],
        symptoms: ['Constant suspicion', 'Seeing threats everywhere', 'Trust no one'],
        curedBy: ['Rest in safe location for 24 hours', 'Therapy from Doctor', 'Holy blessing']
      },
      [MadnessType.OBSESSION]: {
        name: 'Obsession',
        description: 'You must complete the task. Nothing else matters. NOTHING.',
        gameplayEffects: {
          actionRestrictions: ['Cannot leave area until objective complete'],
          forcedActions: ['Must pursue obsession']
        },
        triggerConditions: ['When obsession target is present'],
        symptoms: ['Single-minded focus', 'Ignoring danger', 'Compulsive behavior'],
        curedBy: ['Complete the obsession', 'Severe trauma', 'Mind-clearing ritual']
      },
      [MadnessType.PHOBIA]: {
        name: 'Cosmic Phobia',
        description: 'Terror of specific things. The sight of them fills you with primal dread.',
        gameplayEffects: {
          statPenalty: -10,
          actionRestrictions: ['Cannot approach feared object']
        },
        triggerConditions: ['When phobia trigger is present'],
        symptoms: ['Panic attacks', 'Uncontrollable fear', 'Need to flee'],
        curedBy: ['Gradual exposure therapy', 'Courage elixir', 'Face fear successfully 3 times']
      },
      [MadnessType.DELUSION]: {
        name: 'Delusions',
        description: 'You see things that are not there. Or are they?',
        gameplayEffects: {
          visionImpairment: 0.3,
          statPenalty: -8
        },
        triggerConditions: ['Low light', 'When alone', 'Under stress'],
        symptoms: ['Hallucinations', 'False beliefs', 'Confusion'],
        curedBy: ['Sedation', 'Reality anchor item', 'Companion presence']
      },
      [MadnessType.COMPULSION]: {
        name: 'Compulsion',
        description: 'You must perform the ritual. Again. And again. And again.',
        gameplayEffects: {
          forcedActions: ['Must perform compulsion regularly'],
          statPenalty: -5
        },
        triggerConditions: ['Every few hours', 'When stressed'],
        symptoms: ['Repetitive behaviors', 'Anxiety when unable to perform', 'Ritualistic actions'],
        curedBy: ['Behavioral therapy', 'Distraction for 48 hours', 'Medication']
      },
      [MadnessType.MEGALOMANIA]: {
        name: 'Megalomania',
        description: 'You are destined for greatness. You are chosen. You are GOD.',
        gameplayEffects: {
          npcHostility: 15,
          actionRestrictions: ['Cannot back down from challenges']
        },
        triggerConditions: ['In social situations', 'When challenged'],
        symptoms: ['Delusions of grandeur', 'Overconfidence', 'Reckless behavior'],
        curedBy: ['Humbling defeat', 'Reality check', 'Time and reflection']
      },
      [MadnessType.DISSOCIATION]: {
        name: 'Dissociation',
        description: 'You are not here. This is not real. Are you even you?',
        gameplayEffects: {
          statPenalty: -12,
          visionImpairment: 0.2
        },
        triggerConditions: ['Combat', 'High stress', 'Randomly'],
        symptoms: ['Feeling detached', 'Dreamlike state', 'Identity confusion'],
        curedBy: ['Grounding techniques', 'Strong stimulation', 'Emotional connection']
      }
    };

    const template = madnessTemplates[type];
    const severity = SecureRNG.range(3, 7);
    const duration = COSMIC_HORROR_CONSTANTS.MADNESS_DURATION_BASE * severity;

    return {
      id: `${type}_${Date.now()}`,
      type,
      name: template.name!,
      description: template.description!,
      duration,
      startedAt: new Date(),
      severity,
      gameplayEffects: template.gameplayEffects!,
      triggerConditions: template.triggerConditions!,
      symptoms: template.symptoms!,
      curedBy: template.curedBy!
    };
  }

  /**
   * Cure madness
   */
  static async cureMadness(
    characterId: string,
    madnessId: string,
    method: string
  ): Promise<boolean> {
    const tracker = await this.getOrCreateTracker(characterId);
    const madness = tracker.activeMadness.find(m => m.id === madnessId);

    if (!madness) {
      return false;
    }

    // Check if method is valid
    if (!madness.curedBy.some(cure => cure.toLowerCase().includes(method.toLowerCase()))) {
      return false;
    }

    tracker.removeMadness(madnessId);
    tracker.madnessResistance = Math.min(
      100,
      tracker.madnessResistance + COSMIC_HORROR_CONSTANTS.MADNESS_RESISTANCE_PER_EPISODE
    );
    await tracker.save();

    logger.info(`Character ${characterId} cured madness ${madnessId} via ${method}`);
    return true;
  }

  /**
   * Add permanent madness
   */
  static async addPermanentMadness(
    characterId: string,
    type: MadnessType
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.addPermanentMadness(type);
    await tracker.save();

    logger.info(`Character ${characterId} gained permanent ${type} madness`);
  }

  /**
   * Learn forbidden knowledge
   */
  static async learnKnowledge(
    characterId: string,
    knowledge: ForbiddenKnowledgeType,
    sanityCost: number,
    corruptionCost: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const character = await Character.findById(characterId);

    if (!character) {
      return { success: false, message: 'Character not found' };
    }

    // Check if already known
    if (tracker.forbiddenKnowledge.includes(knowledge)) {
      return { success: false, message: 'You already possess this knowledge' };
    }

    // Check max knowledge
    if (tracker.forbiddenKnowledge.length >= COSMIC_HORROR_CONSTANTS.KNOWLEDGE_MAX_PER_CHARACTER) {
      return {
        success: false,
        message: 'Your mind cannot hold more forbidden knowledge. It would shatter.'
      };
    }

    // Apply costs via other services
    try {
      // Sanity cost (assuming sanity service exists)
      // await SanityService.loseSanity(characterId, sanityCost, 'Forbidden Knowledge');

      // Corruption cost
      await tracker.gainCorruption(corruptionCost, `Learning ${knowledge}`, 'Study');

      // Grant knowledge
      tracker.addKnowledge(knowledge);
      await tracker.save();

      logger.info(`Character ${characterId} learned forbidden knowledge: ${knowledge}`);

      return {
        success: true,
        message: `You have learned ${knowledge}. Your understanding of the cosmos deepens. Reality seems... malleable.`
      };
    } catch (error) {
      logger.error(`Failed to grant knowledge to ${characterId}:`, error);
      return { success: false, message: 'Failed to comprehend the knowledge' };
    }
  }

  /**
   * Learn ritual
   */
  static async learnRitual(
    characterId: string,
    ritualId: string
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.learnRitual(ritualId);
    await tracker.save();

    logger.info(`Character ${characterId} learned ritual: ${ritualId}`);
  }

  /**
   * Record entity encounter
   */
  static async encounterEntity(
    characterId: string,
    entityId: string
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.encounterEntity(entityId);
    await tracker.save();

    logger.info(`Character ${characterId} encountered entity: ${entityId}`);
  }

  /**
   * Check transformation risk
   */
  static async checkTransformation(characterId: string): Promise<{
    atRisk: boolean;
    riskPercent: number;
    transformed: boolean;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    if (tracker.corruptionLevel !== CorruptionLevel.LOST) {
      return { atRisk: false, riskPercent: 0, transformed: false };
    }

    const risk = tracker.calculateTransformationRisk();

    if (SecureRNG.chance(risk)) {
      // Transformation occurs
      logger.warn(`Character ${characterId} has transformed into something... else.`);

      return {
        atRisk: true,
        riskPercent: risk * 100,
        transformed: true
      };
    }

    return {
      atRisk: true,
      riskPercent: risk * 100,
      transformed: false
    };
  }

  /**
   * Get corruption effects
   */
  static getEffects(corruption: number) {
    return getCorruptionEffects(corruption);
  }

  /**
   * Calculate combat modifiers from corruption
   */
  static async calculateCombatModifiers(characterId: string): Promise<{
    damageBonus: number;
    defenseModifier: number;
    specialAbilities: string[];
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const effects = getCorruptionEffects(tracker.currentCorruption);

    return {
      damageBonus: effects.damageBonus,
      defenseModifier: -effects.healingPenalty / 2, // Convert healing penalty to defense
      specialAbilities: effects.abilities
    };
  }

  /**
   * Calculate NPC reaction modifier
   */
  static async calculateNPCReaction(characterId: string): Promise<{
    reactionPenalty: number;
    fearLevel: number;
    willFlee: boolean;
    willAttack: boolean;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const effects = getCorruptionEffects(tracker.currentCorruption);

    const fleeThreshold = COSMIC_HORROR_CONSTANTS.NPC_FLEE_THRESHOLD_LOST;
    const attackThreshold = COSMIC_HORROR_CONSTANTS.NPC_ATTACK_THRESHOLD_LOST;

    return {
      reactionPenalty: effects.npcReactionPenalty,
      fearLevel: tracker.npcFearLevel,
      willFlee: tracker.currentCorruption >= fleeThreshold,
      willAttack: tracker.currentCorruption >= attackThreshold
    };
  }

  /**
   * Generate corruption message
   */
  static generateCorruptionMessage(
    level: CorruptionLevel,
    amount: number,
    levelChanged: boolean
  ): string {
    const baseMessage = `You feel the corruption seep deeper. +${amount} corruption.`;

    if (!levelChanged) {
      return baseMessage;
    }

    const levelMessages = {
      [CorruptionLevel.CLEAN]: 'You feel pure. The whispers are silent.',
      [CorruptionLevel.TOUCHED]: 'Something has changed. You hear whispers at the edge of hearing. Your eyes reflect light strangely.',
      [CorruptionLevel.TAINTED]: 'The corruption takes hold. Your veins pulse with darkness. Your shadow moves wrong. You see things others cannot.',
      [CorruptionLevel.CORRUPTED]: 'You are no longer entirely human. Strange symbols writhe beneath your skin. Your voice carries echoes from beyond. NPCs fear you.',
      [CorruptionLevel.LOST]: 'You are LOST. Reality bends around you. You exist in multiple states. You hunger for things beyond mortal understanding. There may be no return.'
    };

    return `${baseMessage}\n\n${levelMessages[level]}`;
  }

  /**
   * Get character corruption status
   */
  static async getStatus(characterId: string) {
    const tracker = await this.getOrCreateTracker(characterId);
    const effects = getCorruptionEffects(tracker.currentCorruption);

    return {
      ...tracker.toSafeObject(),
      effects,
      transformationRisk: tracker.calculateTransformationRisk()
    };
  }
}
