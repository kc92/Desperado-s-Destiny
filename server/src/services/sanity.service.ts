/**
 * Sanity Service - Phase 10, Wave 10.2
 *
 * Manages character sanity, hallucinations, traumas, and horror resistance
 */

import mongoose from 'mongoose';
import { SanityTracker, ISanityTracker, TRAUMA_DEFINITIONS } from '../models/SanityTracker.model';
import { Character } from '../models/Character.model';
import {
  SanityState,
  HallucinationType,
  Hallucination,
  Trauma,
  SanityCheck,
  HORROR_CONSTANTS,
  SANITY_RESTORATION_METHODS
} from '@desperados/shared';
import logger from '../utils/logger';

export class SanityService {
  /**
   * Get or create sanity tracker for character
   */
  static async getOrCreateTracker(characterId: string): Promise<ISanityTracker> {
    let tracker = await SanityTracker.findByCharacterId(characterId);

    if (!tracker) {
      tracker = await SanityTracker.createForCharacter(characterId);
      logger.info(`Created sanity tracker for character ${characterId}`);
    }

    // Remove expired hallucinations
    tracker.removeExpiredHallucinations();
    if (tracker.isModified()) {
      await tracker.save();
    }

    return tracker;
  }

  /**
   * Lose sanity from horror encounter
   */
  static async loseSanity(
    characterId: string,
    amount: number,
    source: string
  ): Promise<{
    newSanity: number;
    sanityState: SanityState;
    hallucinationGained: Hallucination | null;
    traumaGained: Trauma | null;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    // Apply sanity loss
    const result = await tracker.loseSanity(amount, source);

    // Roll for hallucination
    const hallucination = tracker.rollForHallucination();
    if (hallucination) {
      tracker.activeHallucinations.push(hallucination);
      await tracker.save();
    }

    // Handle trauma
    let trauma: Trauma | null = null;
    if (result.traumaGained) {
      trauma = await this.assignTrauma(characterId, source);
    }

    // Build resistance
    tracker.buildResistance(HORROR_CONSTANTS.HORROR_RESISTANCE_PER_ENCOUNTER);
    await tracker.save();

    const message = this.generateSanityLossMessage(tracker.sanityState, amount);

    logger.info(
      `Character ${characterId} lost ${amount} sanity. New sanity: ${result.newSanity}/${tracker.maxSanity}`
    );

    return {
      newSanity: result.newSanity,
      sanityState: tracker.sanityState,
      hallucinationGained: hallucination as any,
      traumaGained: trauma,
      message
    };
  }

  /**
   * Restore sanity
   */
  static async restoreSanity(
    characterId: string,
    amount: number,
    method: string
  ): Promise<{
    newSanity: number;
    sanityState: SanityState;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    const newSanity = await tracker.restoreSanity(amount);

    const message = `Your sanity has been restored. You feel more grounded in reality.`;

    logger.info(
      `Character ${characterId} restored ${amount} sanity via ${method}. New sanity: ${newSanity}/${tracker.maxSanity}`
    );

    return {
      newSanity,
      sanityState: tracker.sanityState,
      message
    };
  }

  /**
   * Perform sanity check
   */
  static async performSanityCheck(
    characterId: string,
    difficulty: number
  ): Promise<SanityCheck> {
    const tracker = await this.getOrCreateTracker(characterId);

    const roll = Math.floor(Math.random() * 100) + 1;
    const totalModifier = tracker.currentSanity + tracker.horrorResistance;
    const success = roll + totalModifier >= difficulty * 10;

    const sanityLoss = success ? 0 : Math.floor(difficulty * (Math.random() * 3 + 2));

    const check: SanityCheck = {
      difficulty,
      currentSanity: tracker.currentSanity,
      horrorResistance: tracker.horrorResistance,
      roll,
      success,
      sanityLoss,
      effects: []
    };

    if (!success && sanityLoss > 0) {
      await this.loseSanity(characterId, sanityLoss, 'failed_sanity_check');
      check.effects = ['Sanity loss from failed check'];
    }

    return check;
  }

  /**
   * Assign a trauma to character
   */
  static async assignTrauma(characterId: string, triggeredBy: string): Promise<Trauma | null> {
    const tracker = await this.getOrCreateTracker(characterId);

    if (tracker.permanentTraumas.length >= HORROR_CONSTANTS.MAX_TRAUMAS) {
      return null;
    }

    // Find appropriate trauma
    let traumaDef = TRAUMA_DEFINITIONS.find(t => t.triggeredBy === triggeredBy);
    if (!traumaDef) {
      // Default trauma
      traumaDef = TRAUMA_DEFINITIONS[0];
    }

    const trauma = {
      ...traumaDef,
      acquiredAt: new Date()
    };

    await tracker.addTrauma(trauma);

    logger.warn(
      `Character ${characterId} gained permanent trauma: ${trauma.name}`
    );

    return trauma as any;
  }

  /**
   * Get active hallucinations
   */
  static async getActiveHallucinations(characterId: string): Promise<Hallucination[]> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.removeExpiredHallucinations();
    await tracker.save();

    return tracker.activeHallucinations as any[];
  }

  /**
   * Get permanent traumas
   */
  static async getTraumas(characterId: string): Promise<Trauma[]> {
    const tracker = await this.getOrCreateTracker(characterId);
    return tracker.permanentTraumas as any[];
  }

  /**
   * Get combat penalty from sanity
   */
  static async getCombatPenalty(characterId: string): Promise<number> {
    const tracker = await this.getOrCreateTracker(characterId);
    return tracker.getSanityCombatPenalty();
  }

  /**
   * Check if character can encounter horror
   */
  static async canEncounterHorror(characterId: string): Promise<boolean> {
    const tracker = await this.getOrCreateTracker(characterId);
    return tracker.canEncounterHorror();
  }

  /**
   * Passive sanity regeneration (called by background job)
   */
  static async passiveSanityRegen(): Promise<void> {
    const trackers = await SanityTracker.find({
      currentSanity: { $lt: HORROR_CONSTANTS.SANITY_MAX }
    });

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const tracker of trackers) {
      const hoursSinceLastRegen = (now - tracker.lastRestoration.getTime()) / oneHour;

      if (hoursSinceLastRegen >= 1) {
        // Check if character is in safe location
        const character = await Character.findById(tracker.characterId);
        if (!character) continue;

        // Only regen in safe towns
        const safeTowns = ['Dusty Hollow', 'Red Gulch', 'Nahi Village', 'Fort Sangre'];
        if (safeTowns.includes(character.currentLocation)) {
          const regenAmount = Math.floor(hoursSinceLastRegen * HORROR_CONSTANTS.BASE_SANITY_REGEN);
          await tracker.restoreSanity(regenAmount);
        }
      }
    }
  }

  /**
   * Use sanity restoration method
   */
  static async useSanityRestoration(
    characterId: string,
    methodId: string,
    session?: mongoose.ClientSession
  ): Promise<{
    success: boolean;
    newSanity: number;
    message: string;
    costGold?: number;
    costEnergy?: number;
  }> {
    const method = SANITY_RESTORATION_METHODS.find(m => m.methodId === methodId);
    if (!method) {
      throw new Error('Invalid restoration method');
    }

    const character = await Character.findById(characterId).session(session || null);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check requirements
    if (method.requirements) {
      if (method.requirements.minLevel && character.level < method.requirements.minLevel) {
        return {
          success: false,
          newSanity: 0,
          message: `Requires level ${method.requirements.minLevel}`
        };
      }
    }

    // Check costs
    if (method.cost && character.gold < method.cost) {
      return {
        success: false,
        newSanity: 0,
        message: `Insufficient gold. Need ${method.cost} gold.`
      };
    }

    if (method.energyCost && character.energy < method.energyCost) {
      return {
        success: false,
        newSanity: 0,
        message: `Insufficient energy. Need ${method.energyCost} energy.`
      };
    }

    // Deduct costs
    if (method.cost) {
      character.gold -= method.cost;
    }

    if (method.energyCost) {
      character.energy -= method.energyCost;
    }

    await character.save({ session: session || undefined });

    // Restore sanity
    const result = await this.restoreSanity(characterId, method.sanityRestored, methodId);

    logger.info(
      `Character ${characterId} used ${method.name} to restore ${method.sanityRestored} sanity`
    );

    return {
      success: true,
      newSanity: result.newSanity,
      message: method.description,
      costGold: method.cost,
      costEnergy: method.energyCost
    };
  }

  /**
   * Generate atmospheric sanity loss message
   */
  private static generateSanityLossMessage(state: SanityState, amount: number): string {
    const messages: Record<SanityState, string[]> = {
      [SanityState.STABLE]: [
        'Your hands shake slightly. You take a deep breath and steady yourself.',
        'The sight disturbs you, but you remain composed.',
        'Your pulse quickens, but you maintain control.'
      ],
      [SanityState.RATTLED]: [
        'Your breath comes faster. Something about this feels deeply wrong.',
        'Cold sweat breaks out on your forehead. You struggle to focus.',
        'The world feels less solid. You grip your weapon tighter.'
      ],
      [SanityState.SHAKEN]: [
        'Panic claws at the edges of your mind. You fight to stay rational.',
        'Are those whispers real? You can\'t tell anymore.',
        'Your vision swims. Nothing makes sense.'
      ],
      [SanityState.BREAKING]: [
        'Reality fractures. You see things that can\'t be there.',
        'Laughter bubbles up unbidden. Is that your voice?',
        'The shadows have eyes. They\'re all watching you.'
      ],
      [SanityState.SHATTERED]: [
        'Your mind shatters like glass. Fragments of reality scatter.',
        'You no longer know what\'s real. Perhaps nothing ever was.',
        'The darkness inside is darker than the darkness outside.'
      ]
    };

    const stateMessages = messages[state];
    return stateMessages[Math.floor(Math.random() * stateMessages.length)];
  }

  /**
   * Get sanity statistics for character
   */
  static async getSanityStatistics(characterId: string): Promise<{
    currentSanity: number;
    maxSanity: number;
    sanityState: SanityState;
    totalLost: number;
    totalRestored: number;
    encounters: number;
    resistance: number;
    activeHallucinations: number;
    permanentTraumas: number;
    combatPenalty: number;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    return {
      currentSanity: tracker.currentSanity,
      maxSanity: tracker.maxSanity,
      sanityState: tracker.sanityState,
      totalLost: tracker.totalSanityLost,
      totalRestored: tracker.totalSanityRestored,
      encounters: tracker.encountersWithHorror,
      resistance: tracker.horrorResistance,
      activeHallucinations: tracker.activeHallucinations.length,
      permanentTraumas: tracker.permanentTraumas.length,
      combatPenalty: tracker.getSanityCombatPenalty()
    };
  }
}
