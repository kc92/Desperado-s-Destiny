/**
 * Sin Service - Divine Struggle System - PRIMARY SOURCE
 *
 * Manages character sin, spiritual torment, and divine struggle effects.
 * This is the canonical source for all sin/torment mechanics.
 *
 * For backwards compatibility with old code, see corruption.service.ts
 */

import { CharacterSin, ICharacterSin } from '../models/CharacterSin.model';
import { Character } from '../models/Character.model';
import {
  SinLevel,
  TormentType,
  SacredKnowledgeType,
  TormentEffect,
  DIVINE_STRUGGLE_CONSTANTS,
  getSinLevel
} from '@desperados/shared';
import { getSinEffects } from '../data/sinEffects';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

export class SinService {
  /**
   * Get or create sin tracker for character
   */
  static async getOrCreateTracker(characterId: string): Promise<ICharacterSin> {
    let tracker = await CharacterSin.findByCharacterId(characterId);

    if (!tracker) {
      tracker = await CharacterSin.createForCharacter(characterId);
      logger.info(`Created sin tracker for character ${characterId}`);
    }

    // Clean up expired torments
    tracker.removeExpiredTorments();
    if (tracker.isModified()) {
      await tracker.save();
    }

    return tracker;
  }

  /**
   * Apply sin gain
   */
  static async gainSin(
    characterId: string,
    amount: number,
    source: string,
    location?: string
  ): Promise<{
    newSin: number;
    sinLevel: SinLevel;
    levelChanged: boolean;
    tormentGained: TormentEffect | null;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const oldLevel = tracker.sinLevel;

    await tracker.gainSin(amount, source, location);

    const levelChanged = oldLevel !== tracker.sinLevel;
    let tormentGained: TormentEffect | null = null;

    // Roll for torment
    if (tracker.currentSin > DIVINE_STRUGGLE_CONSTANTS.SIN_PURE_MAX) {
      tormentGained = await this.rollForTorment(tracker);
      if (tormentGained) {
        tracker.addTorment(tormentGained);
        await tracker.save();
      }
    }

    const message = this.generateSinMessage(tracker.sinLevel, amount, levelChanged);

    logger.info(
      `Character ${characterId} gained ${amount} sin. New total: ${tracker.currentSin}`
    );

    return {
      newSin: tracker.currentSin,
      sinLevel: tracker.sinLevel,
      levelChanged,
      tormentGained,
      message
    };
  }

  /**
   * Apply sin loss (absolution)
   */
  static async absolveSin(
    characterId: string,
    amount: number,
    method: string
  ): Promise<{
    newSin: number;
    sinLevel: SinLevel;
    levelChanged: boolean;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const oldLevel = tracker.sinLevel;

    await tracker.absolveSin(amount, method);

    const levelChanged = oldLevel !== tracker.sinLevel;
    const message = `Absolved ${amount} sin via ${method}. Current: ${tracker.currentSin}`;

    logger.info(`Character ${characterId} absolved ${amount} sin via ${method}`);

    return {
      newSin: tracker.currentSin,
      sinLevel: tracker.sinLevel,
      levelChanged,
      message
    };
  }

  /**
   * Handle death - reduce sin
   */
  static async handleDeath(characterId: string): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    const reductionAmount = DIVINE_STRUGGLE_CONSTANTS.DEATH_SIN_RESET;

    await tracker.absolveSin(reductionAmount, 'Death');
    tracker.deathsToSin += 1;

    // Remove some active torments
    if (tracker.activeTorments.length > 0) {
      tracker.activeTorments = tracker.activeTorments.slice(0, Math.floor(tracker.activeTorments.length / 2));
    }

    await tracker.save();

    logger.info(
      `Character ${characterId} died. Sin reduced by ${reductionAmount}. New total: ${tracker.currentSin}`
    );
  }

  /**
   * Apply sin from being in The Rift
   */
  static async applyRiftExposure(
    characterId: string,
    minutesInRift: number,
    deepInRift: boolean = false
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);

    const hoursInRift = minutesInRift / 60;
    const rate = deepInRift
      ? DIVINE_STRUGGLE_CONSTANTS.RIFT_DEEP_SIN_PER_HOUR
      : DIVINE_STRUGGLE_CONSTANTS.RIFT_BASE_SIN_PER_HOUR;

    const sinGain = hoursInRift * rate;

    if (sinGain > 0) {
      await tracker.gainSin(
        sinGain,
        deepInRift ? 'The Rift (Deep)' : 'The Rift',
        'The Rift'
      );

      tracker.timeInRift += minutesInRift;
      await tracker.save();
    }
  }

  /**
   * Roll for torment based on sin
   */
  static async rollForTorment(tracker: ICharacterSin): Promise<TormentEffect | null> {
    // Check if at max torments
    if (tracker.activeTorments.length >= DIVINE_STRUGGLE_CONSTANTS.MAX_ACTIVE_TORMENTS) {
      return null;
    }

    // Calculate chance based on sin
    const sinTens = Math.floor(tracker.currentSin / 10);
    const baseChance = sinTens * DIVINE_STRUGGLE_CONSTANTS.TORMENT_CHANCE_PER_SIN_10;

    // Apply resistance
    const resistance = tracker.tormentResistance / 100;
    const finalChance = baseChance * (1 - resistance);

    // Roll
    if (!SecureRNG.chance(finalChance)) {
      return null;
    }

    // Generate torment
    return this.generateRandomTorment();
  }

  /**
   * Generate random torment
   */
  static generateRandomTorment(): TormentEffect {
    const types = Object.values(TormentType);
    const type = SecureRNG.select(types);

    const tormentTemplates: { [key in TormentType]: Partial<TormentEffect> } = {
      [TormentType.PARANOIA]: {
        name: 'Spiritual Paranoia',
        description: 'Everyone is watching. Angels judge your every move. Demons whisper lies.',
        gameplayEffects: {
          npcHostility: 20,
          statPenalty: -5
        },
        triggerConditions: ['In towns', 'Around NPCs'],
        symptoms: ['Constant suspicion', 'Seeing watchers everywhere', 'Trust no one'],
        curedBy: ['Rest in consecrated ground for 24 hours', 'Confession to a priest', 'Divine blessing']
      },
      [TormentType.OBSESSION]: {
        name: 'Divine Obsession',
        description: 'You must complete the sacred task. Nothing else matters. NOTHING.',
        gameplayEffects: {
          actionRestrictions: ['Cannot leave area until objective complete'],
          forcedActions: ['Must pursue obsession']
        },
        triggerConditions: ['When obsession target is present'],
        symptoms: ['Single-minded focus', 'Ignoring danger', 'Compulsive behavior'],
        curedBy: ['Complete the obsession', 'Severe trauma', 'Exorcism ritual']
      },
      [TormentType.DREAD]: {
        name: 'Holy Dread',
        description: 'Terror of divine judgment fills your soul. The sight of holiness brings panic.',
        gameplayEffects: {
          statPenalty: -10,
          actionRestrictions: ['Cannot enter churches']
        },
        triggerConditions: ['Near holy places', 'When praying'],
        symptoms: ['Panic attacks', 'Uncontrollable fear', 'Need to flee from holiness'],
        curedBy: ['Gradual exposure to sacred places', 'Courage elixir', 'Face judgment successfully']
      },
      [TormentType.VISIONS]: {
        name: 'Divine Visions',
        description: 'You see things from beyond. Angels weep. Demons dance. Reality fractures.',
        gameplayEffects: {
          visionImpairment: 0.3,
          statPenalty: -8
        },
        triggerConditions: ['Low light', 'When alone', 'Under stress'],
        symptoms: ['Hallucinations', 'Prophetic nightmares', 'Confusion'],
        curedBy: ['Sedation', 'Holy relic possession', 'Companion presence']
      },
      [TormentType.COMPULSION]: {
        name: 'Ritual Compulsion',
        description: 'You must perform the ritual. Again. And again. The pattern must be complete.',
        gameplayEffects: {
          forcedActions: ['Must perform compulsion regularly'],
          statPenalty: -5
        },
        triggerConditions: ['Every few hours', 'When stressed'],
        symptoms: ['Repetitive behaviors', 'Anxiety when unable to perform', 'Ritualistic actions'],
        curedBy: ['Behavioral therapy from priest', 'Distraction for 48 hours', 'Divine intervention']
      },
      [TormentType.PRIDE]: {
        name: 'Spiritual Pride',
        description: 'You are chosen. You are destined for greatness. You are above mere mortals.',
        gameplayEffects: {
          npcHostility: 15,
          actionRestrictions: ['Cannot back down from challenges']
        },
        triggerConditions: ['In social situations', 'When challenged'],
        symptoms: ['Delusions of grandeur', 'Overconfidence', 'Reckless behavior'],
        curedBy: ['Humbling defeat', 'Confession of sins', 'Time in servitude']
      },
      [TormentType.DESPAIR]: {
        name: 'Spiritual Despair',
        description: 'Hope is lost. Faith is broken. The divine has abandoned you.',
        gameplayEffects: {
          statPenalty: -12,
          visionImpairment: 0.2
        },
        triggerConditions: ['Combat', 'High stress', 'Randomly'],
        symptoms: ['Feeling forsaken', 'Numbness', 'Loss of will'],
        curedBy: ['Act of genuine kindness received', 'Divine sign', 'Emotional connection']
      }
    };

    const template = tormentTemplates[type];
    const severity = SecureRNG.range(3, 7);
    const duration = DIVINE_STRUGGLE_CONSTANTS.TORMENT_DURATION_BASE * severity;

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
   * Cure torment
   */
  static async cureTorment(
    characterId: string,
    tormentId: string,
    method: string
  ): Promise<boolean> {
    const tracker = await this.getOrCreateTracker(characterId);
    const torment = tracker.activeTorments.find(t => t.id === tormentId);

    if (!torment) {
      return false;
    }

    // Check if method is valid
    if (!torment.curedBy.some(cure => cure.toLowerCase().includes(method.toLowerCase()))) {
      return false;
    }

    tracker.removeTorment(tormentId);
    tracker.tormentResistance = Math.min(
      100,
      tracker.tormentResistance + DIVINE_STRUGGLE_CONSTANTS.TORMENT_RESISTANCE_PER_EPISODE
    );
    await tracker.save();

    logger.info(`Character ${characterId} cured torment ${tormentId} via ${method}`);
    return true;
  }

  /**
   * Add permanent torment
   */
  static async addPermanentTorment(
    characterId: string,
    type: TormentType
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.addPermanentTorment(type);
    await tracker.save();

    logger.info(`Character ${characterId} gained permanent ${type} torment`);
  }

  /**
   * Learn sacred knowledge
   */
  static async learnSacredKnowledge(
    characterId: string,
    knowledge: SacredKnowledgeType,
    faithCost: number,
    sinCost: number
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
    if (tracker.sacredKnowledge.includes(knowledge)) {
      return { success: false, message: 'You already possess this sacred knowledge' };
    }

    // Check max knowledge
    if (tracker.sacredKnowledge.length >= DIVINE_STRUGGLE_CONSTANTS.KNOWLEDGE_MAX_PER_CHARACTER) {
      return {
        success: false,
        message: 'Your soul cannot hold more sacred knowledge. It would be consumed.'
      };
    }

    // Apply costs
    try {
      // Sin cost
      await tracker.gainSin(sinCost, `Learning ${knowledge}`, 'Study');

      // Grant knowledge
      tracker.addKnowledge(knowledge);
      await tracker.save();

      logger.info(`Character ${characterId} learned sacred knowledge: ${knowledge}`);

      return {
        success: true,
        message: `You have learned ${knowledge}. Your understanding of the divine deepens. The veil between worlds grows thin.`
      };
    } catch (error) {
      logger.error(`Failed to grant knowledge to ${characterId}:`, error);
      return { success: false, message: 'Failed to comprehend the sacred knowledge' };
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
   * Record celestial entity encounter
   */
  static async encounterEntity(
    characterId: string,
    entityId: string
  ): Promise<void> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.encounterEntity(entityId);
    await tracker.save();

    logger.info(`Character ${characterId} encountered celestial entity: ${entityId}`);
  }

  /**
   * Check damnation risk
   */
  static async checkDamnation(characterId: string): Promise<{
    atRisk: boolean;
    riskPercent: number;
    damned: boolean;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    if (tracker.sinLevel !== SinLevel.DAMNED) {
      return { atRisk: false, riskPercent: 0, damned: false };
    }

    const risk = tracker.calculateDamnationRisk();

    if (SecureRNG.chance(risk)) {
      // Damnation occurs
      logger.warn(`Character ${characterId} has been damned... their soul is lost.`);

      return {
        atRisk: true,
        riskPercent: risk * 100,
        damned: true
      };
    }

    return {
      atRisk: true,
      riskPercent: risk * 100,
      damned: false
    };
  }

  /**
   * Get sin effects
   */
  static getEffects(sin: number) {
    return getSinEffects(sin);
  }

  /**
   * Calculate combat modifiers from sin
   */
  static async calculateCombatModifiers(characterId: string): Promise<{
    damageBonus: number;
    defenseModifier: number;
    specialAbilities: string[];
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const effects = getSinEffects(tracker.currentSin);

    return {
      damageBonus: effects.damageBonus,
      defenseModifier: -effects.healingPenalty / 2,
      specialAbilities: effects.abilities
    };
  }

  /**
   * Calculate NPC reaction modifier
   */
  static async calculateNPCReaction(characterId: string): Promise<{
    reactionPenalty: number;
    reactionLevel: number;
    willFlee: boolean;
    willAttack: boolean;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);
    const effects = getSinEffects(tracker.currentSin);

    const fleeThreshold = DIVINE_STRUGGLE_CONSTANTS.NPC_FLEE_THRESHOLD_DAMNED;
    const attackThreshold = DIVINE_STRUGGLE_CONSTANTS.NPC_ATTACK_THRESHOLD_DAMNED;

    return {
      reactionPenalty: effects.npcReactionPenalty,
      reactionLevel: tracker.npcReactionLevel,
      willFlee: tracker.currentSin >= fleeThreshold,
      willAttack: tracker.currentSin >= attackThreshold
    };
  }

  /**
   * Generate sin message
   */
  static generateSinMessage(
    level: SinLevel,
    amount: number,
    levelChanged: boolean
  ): string {
    const baseMessage = `You feel sin stain your soul. +${amount} sin.`;

    if (!levelChanged) {
      return baseMessage;
    }

    const levelMessages = {
      [SinLevel.PURE]: 'You feel grace restored. The divine light shines upon you.',
      [SinLevel.TEMPTED]: 'Temptation whispers at the edge of your soul. Your eyes reflect an inner fire. Something watches you.',
      [SinLevel.STAINED]: 'Sin stains your soul. Faint marks appear on your skin. Your shadow carries darkness. You glimpse things beyond mortal sight.',
      [SinLevel.FALLEN]: 'You have fallen from grace. Strange symbols writhe beneath your skin. Your voice echoes with otherworldly tones. NPCs sense your corruption.',
      [SinLevel.DAMNED]: 'You are DAMNED. Reality recoils from your presence. You exist between worlds. You hunger for the forbidden. Redemption seems impossible.'
    };

    return `${baseMessage}\n\n${levelMessages[level]}`;
  }

  /**
   * Get character sin status
   */
  static async getStatus(characterId: string) {
    const tracker = await this.getOrCreateTracker(characterId);
    const effects = getSinEffects(tracker.currentSin);

    return {
      ...tracker.toSafeObject(),
      effects,
      damnationRisk: tracker.calculateDamnationRisk()
    };
  }

  // =============================================================================
  // BACKWARDS COMPATIBILITY METHOD ALIASES
  // =============================================================================

  /** @deprecated Use gainSin() */
  static gainCorruption = SinService.gainSin;

  /** @deprecated Use absolveSin() */
  static loseCorruption = SinService.absolveSin;

  /** @deprecated Use applyRiftExposure() */
  static applyScarExposure = SinService.applyRiftExposure;

  /** @deprecated Use rollForTorment() */
  static rollForMadness = SinService.rollForTorment;

  /** @deprecated Use generateRandomTorment() */
  static generateRandomMadness = SinService.generateRandomTorment;

  /** @deprecated Use cureTorment() */
  static cureMadness = SinService.cureTorment;

  /** @deprecated Use addPermanentTorment() */
  static addPermanentMadness = SinService.addPermanentTorment;

  /** @deprecated Use learnSacredKnowledge() */
  static learnKnowledge = SinService.learnSacredKnowledge;

  /** @deprecated Use checkDamnation() */
  static checkTransformation = SinService.checkDamnation;

  /** @deprecated Use generateSinMessage() */
  static generateCorruptionMessage = SinService.generateSinMessage;
}

// =============================================================================
// BACKWARDS COMPATIBILITY ALIASES
// =============================================================================

/** @deprecated Use SinService */
export const CorruptionService = SinService;

/**
 * Method mapping reference:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * gainCorruption()            →  gainSin()
 * loseCorruption()            →  absolveSin()
 * applyScarExposure()         →  applyRiftExposure()
 * rollForMadness()            →  rollForTorment()
 * generateRandomMadness()     →  generateRandomTorment()
 * cureMadness()               →  cureTorment()
 * addPermanentMadness()       →  addPermanentTorment()
 * learnKnowledge()            →  learnSacredKnowledge()
 * checkTransformation()       →  checkDamnation()
 */
