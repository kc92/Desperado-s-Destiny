/**
 * Ritual Service - Phase 14, Wave 14.1
 *
 * Manages dark rituals and cosmic ceremonies
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { CharacterCorruption } from '../models/CharacterCorruption.model';
import { RITUALS, getRitualById } from '../data/rituals';
import {
  Ritual,
  RitualType,
  RitualResult,
  RitualFailure,
  COSMIC_HORROR_CONSTANTS
} from '@desperados/shared';
import { CorruptionService } from './corruption.service';
import logger from '../utils/logger';

/**
 * Active ritual tracking (in-memory for now, could be database)
 */
const activeRituals = new Map<string, {
  ritualId: string;
  characterId: string;
  startedAt: Date;
  completesAt: Date;
  participants: string[];
}>();

export class RitualService {
  /**
   * Check if character can perform ritual
   */
  static async canPerformRitual(
    characterId: string,
    ritualId: string
  ): Promise<{
    canPerform: boolean;
    reason?: string;
  }> {
    const ritual = getRitualById(ritualId);
    if (!ritual) {
      return { canPerform: false, reason: 'Ritual not found' };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return { canPerform: false, reason: 'Character not found' };
    }

    const corruption = await CorruptionService.getOrCreateTracker(characterId);

    // Check corruption requirement
    if (corruption.currentCorruption < ritual.corruptionRequired) {
      return {
        canPerform: false,
        reason: `Requires ${ritual.corruptionRequired} corruption. You have ${corruption.currentCorruption}.`
      };
    }

    // Check forbidden knowledge
    for (const knowledge of ritual.knowledgeRequired) {
      if (!corruption.forbiddenKnowledge.includes(knowledge)) {
        return {
          canPerform: false,
          reason: `Requires forbidden knowledge: ${knowledge}`
        };
      }
    }

    // Check if ritual is learned
    if (!corruption.ritualsLearned.includes(ritualId)) {
      return {
        canPerform: false,
        reason: 'You have not learned this ritual'
      };
    }

    // Check energy
    if (!character.canAffordAction(ritual.energyCost)) {
      return {
        canPerform: false,
        reason: `Requires ${ritual.energyCost} energy`
      };
    }

    // Check gold cost
    if (ritual.goldCost && character.gold < ritual.goldCost) {
      return {
        canPerform: false,
        reason: `Requires ${ritual.goldCost} gold`
      };
    }

    // TODO: Check components in inventory
    // TODO: Check location
    // TODO: Check cooldown

    return { canPerform: true };
  }

  /**
   * Start ritual
   */
  static async startRitual(
    characterId: string,
    ritualId: string,
    participants: string[] = []
  ): Promise<{
    success: boolean;
    message: string;
    completesAt?: Date;
  }> {
    const ritual = getRitualById(ritualId);
    if (!ritual) {
      return { success: false, message: 'Ritual not found' };
    }

    // Check if can perform
    const canPerform = await this.canPerformRitual(characterId, ritualId);
    if (!canPerform.canPerform) {
      return { success: false, message: canPerform.reason! };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return { success: false, message: 'Character not found' };
    }

    // Check participants
    if (participants.length + 1 < ritual.participantsRequired) {
      return {
        success: false,
        message: `This ritual requires ${ritual.participantsRequired} participants`
      };
    }

    // Pay costs
    character.spendEnergy(ritual.energyCost);

    if (ritual.goldCost) {
      await character.deductGold(ritual.goldCost, 'ritual' as any, { ritualId });
    }

    // Apply sanity cost (would integrate with sanity service)
    // await SanityService.loseSanity(characterId, ritual.sanityCost, `Ritual: ${ritual.name}`);

    // Apply corruption cost
    await CorruptionService.gainCorruption(characterId, ritual.corruptionCost, `Ritual: ${ritual.name}`);

    await character.save();

    // Schedule completion
    const completesAt = new Date(Date.now() + ritual.timeRequired * 60 * 1000);

    activeRituals.set(characterId, {
      ritualId,
      characterId,
      startedAt: new Date(),
      completesAt,
      participants
    });

    logger.info(
      `Character ${characterId} started ritual ${ritualId}. Completes at ${completesAt.toISOString()}`
    );

    return {
      success: true,
      message: `Ritual begun. ${ritual.horrorDescription}\n\nIt will complete in ${ritual.timeRequired} minutes.`,
      completesAt
    };
  }

  /**
   * Complete ritual
   */
  static async completeRitual(characterId: string): Promise<{
    success: boolean;
    failed: boolean;
    results?: RitualResult[];
    failure?: RitualFailure;
    message: string;
  }> {
    const activeRitual = activeRituals.get(characterId);
    if (!activeRitual) {
      return {
        success: false,
        failed: false,
        message: 'No active ritual found'
      };
    }

    // Check if ritual is complete
    if (new Date() < activeRitual.completesAt) {
      const remaining = Math.ceil((activeRitual.completesAt.getTime() - Date.now()) / 60000);
      return {
        success: false,
        failed: false,
        message: `Ritual still in progress. ${remaining} minutes remaining.`
      };
    }

    const ritual = getRitualById(activeRitual.ritualId);
    if (!ritual) {
      activeRituals.delete(characterId);
      return {
        success: false,
        failed: true,
        message: 'Ritual data corrupted'
      };
    }

    // Roll for success
    const roll = Math.random();
    const corruption = await CorruptionService.getOrCreateTracker(characterId);

    // Knowledge bonuses
    let successBonus = 0;
    for (const knowledge of ritual.knowledgeRequired) {
      if (corruption.forbiddenKnowledge.includes(knowledge)) {
        successBonus += COSMIC_HORROR_CONSTANTS.RITUAL_SUCCESS_PER_KNOWLEDGE;
      }
    }

    const finalSuccessChance = Math.min(0.95, ritual.successChance + successBonus);
    const criticalChance = COSMIC_HORROR_CONSTANTS.RITUAL_CRITICAL_CHANCE;

    // Critical success
    if (roll < criticalChance && ritual.criticalSuccess) {
      activeRituals.delete(characterId);
      await this.applyRitualResults(characterId, ritual.criticalSuccess);

      logger.info(`Character ${characterId} achieved CRITICAL SUCCESS on ritual ${ritual.id}`);

      return {
        success: true,
        failed: false,
        results: ritual.criticalSuccess,
        message: `CRITICAL SUCCESS!\n\nThe ritual succeeds beyond all expectations. The cosmos itself bends to your will.\n\n${this.formatResults(ritual.criticalSuccess)}`
      };
    }

    // Normal success
    if (roll < finalSuccessChance) {
      activeRituals.delete(characterId);
      await this.applyRitualResults(characterId, ritual.successResults);

      logger.info(`Character ${characterId} succeeded on ritual ${ritual.id}`);

      return {
        success: true,
        failed: false,
        results: ritual.successResults,
        message: `SUCCESS!\n\nThe ritual completes successfully.\n\n${this.formatResults(ritual.successResults)}`
      };
    }

    // Failure
    if (ritual.canFail) {
      activeRituals.delete(characterId);
      await this.applyFailureConsequences(characterId, ritual.failureConsequence);

      logger.info(`Character ${characterId} FAILED ritual ${ritual.id}`);

      return {
        success: false,
        failed: true,
        failure: ritual.failureConsequence,
        message: `FAILURE!\n\n${ritual.failureConsequence.description}\n\n${this.formatFailure(ritual.failureConsequence)}`
      };
    }

    // Shouldn't reach here, but just in case
    activeRituals.delete(characterId);
    return {
      success: false,
      failed: false,
      message: 'Ritual fizzles out without effect'
    };
  }

  /**
   * Cancel ritual
   */
  static async cancelRitual(characterId: string): Promise<{
    success: boolean;
    message: string;
    backlash?: boolean;
  }> {
    const activeRitual = activeRituals.get(characterId);
    if (!activeRitual) {
      return {
        success: false,
        message: 'No active ritual to cancel'
      };
    }

    const ritual = getRitualById(activeRitual.ritualId);
    if (!ritual) {
      activeRituals.delete(characterId);
      return { success: true, message: 'Ritual cancelled' };
    }

    // Cancelling has consequences
    const character = await Character.findById(characterId);
    if (character) {
      // Take damage
      // character.health -= 25; // Would need to integrate with health system

      // Gain corruption
      await CorruptionService.gainCorruption(characterId, 10, 'Ritual Interruption');
    }

    activeRituals.delete(characterId);

    logger.info(`Character ${characterId} cancelled ritual ${ritual.id} with backlash`);

    return {
      success: true,
      message: 'Ritual cancelled! Reality backlashes against you. You take 25 damage and gain 10 corruption.',
      backlash: true
    };
  }

  /**
   * Apply ritual results
   */
  static async applyRitualResults(
    characterId: string,
    results: RitualResult[]
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    const corruption = await CorruptionService.getOrCreateTracker(characterId);

    for (const result of results) {
      switch (result.type) {
        case 'knowledge':
          // Grant forbidden knowledge
          if (result.effect.knowledgeGained) {
            // Would implement knowledge granting
            logger.info(`Granted knowledge: ${result.effect.knowledgeGained}`);
          }
          break;

        case 'power':
          // Grant temporary power
          if (result.effect.statBonus) {
            // Would implement stat bonuses
            logger.info(`Granted stat bonuses`, result.effect.statBonus);
          }
          break;

        case 'summon':
          // Summon entity
          if (result.effect.entityType) {
            // Would implement entity summoning
            logger.info(`Summoned: ${result.effect.entityType}`);
          }
          break;

        case 'protection':
          // Grant protection
          logger.info(`Protection granted for ${result.duration} minutes`);
          break;

        case 'transformation':
          // Apply transformation
          if (result.effect.chosenMutation) {
            // Would implement mutation selection
            logger.info('Transformation granted');
          }
          break;

        case 'item':
          // Grant item
          if (result.effect.itemId) {
            // Would implement item granting
            logger.info(`Item granted: ${result.effect.itemId}`);
          }
          break;
      }
    }
  }

  /**
   * Apply failure consequences
   */
  static async applyFailureConsequences(
    characterId: string,
    failure: RitualFailure
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    // Apply damage
    if (failure.effect.damage) {
      // Would integrate with health system
      logger.info(`Character takes ${failure.effect.damage} damage from ritual failure`);
    }

    // Apply sanity loss
    if (failure.effect.sanityLoss) {
      // Would integrate with sanity system
      logger.info(`Character loses ${failure.effect.sanityLoss} sanity from ritual failure`);
    }

    // Apply corruption gain
    if (failure.effect.corruptionGain) {
      await CorruptionService.gainCorruption(
        characterId,
        failure.effect.corruptionGain,
        'Ritual Failure'
      );
    }

    // Apply madness
    if (failure.effect.madnessGained) {
      await CorruptionService.addPermanentMadness(characterId, failure.effect.madnessGained);
    }

    // Summon hostile entity
    if (failure.effect.entitySummoned) {
      // Would implement hostile entity spawning
      logger.info(`Hostile entity summoned: ${failure.effect.entitySummoned}`);
    }
  }

  /**
   * Format results for display
   */
  static formatResults(results: RitualResult[]): string {
    return results.map(r => `- ${r.description}`).join('\n');
  }

  /**
   * Format failure for display
   */
  static formatFailure(failure: RitualFailure): string {
    const effects: string[] = [];

    if (failure.effect.damage) {
      effects.push(`Take ${failure.effect.damage} damage`);
    }
    if (failure.effect.sanityLoss) {
      effects.push(`Lose ${failure.effect.sanityLoss} sanity`);
    }
    if (failure.effect.corruptionGain) {
      effects.push(`Gain ${failure.effect.corruptionGain} corruption`);
    }
    if (failure.effect.madnessGained) {
      effects.push(`Gain ${failure.effect.madnessGained} madness`);
    }
    if (failure.effect.entitySummoned) {
      effects.push(`${failure.effect.entitySummoned} is summoned!`);
    }
    if (failure.effect.otherEffect) {
      effects.push(failure.effect.otherEffect);
    }

    return effects.join('\n');
  }

  /**
   * Get active ritual status
   */
  static getActiveRitual(characterId: string) {
    const active = activeRituals.get(characterId);
    if (!active) return null;

    const ritual = getRitualById(active.ritualId);
    const remaining = Math.max(0, active.completesAt.getTime() - Date.now());

    return {
      ritual,
      startedAt: active.startedAt,
      completesAt: active.completesAt,
      remainingMinutes: Math.ceil(remaining / 60000),
      participants: active.participants
    };
  }

  /**
   * Get all available rituals for character
   */
  static async getAvailableRituals(characterId: string) {
    const corruption = await CorruptionService.getOrCreateTracker(characterId);

    return RITUALS.filter(ritual => {
      // Check corruption requirement
      if (ritual.corruptionRequired > corruption.currentCorruption) {
        return false;
      }

      // Check if learned
      if (!corruption.ritualsLearned.includes(ritual.id)) {
        return false;
      }

      // Check knowledge requirements
      for (const knowledge of ritual.knowledgeRequired) {
        if (!corruption.forbiddenKnowledge.includes(knowledge)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get all rituals (for discovery)
   */
  static getAllRituals() {
    return RITUALS;
  }

  /**
   * Discover ritual
   */
  static async discoverRitual(characterId: string, ritualId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const ritual = getRitualById(ritualId);
    if (!ritual) {
      return { success: false, message: 'Ritual not found' };
    }

    const corruption = await CorruptionService.getOrCreateTracker(characterId);

    // Check if already known
    if (corruption.ritualsLearned.includes(ritualId)) {
      return { success: false, message: 'You already know this ritual' };
    }

    // Learn it
    await CorruptionService.learnRitual(characterId, ritualId);

    logger.info(`Character ${characterId} discovered ritual: ${ritualId}`);

    return {
      success: true,
      message: `You have learned the ritual: ${ritual.name}\n\n${ritual.description}\n\nYou can now perform this ritual.`
    };
  }
}
