/**
 * Faith Service - Divine Struggle System
 *
 * Manages character faith, divine visions, spiritual wounds, and celestial resistance
 * Rebranded from Sanity Service (cosmic horror → angels & demons)
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
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';

// Faith-specific type aliases for clarity
export type FaithState = SanityState;
export type DivineVision = Hallucination;
export type SpiritualWound = Trauma;
export type FaithCheck = SanityCheck;

// Import original service for reference (use SanityService directly if you need the original)
import { SanityService as OriginalSanityService } from './sanity.service';
export const SanityServiceRef = OriginalSanityService;

export class FaithService {
  /**
   * Get or create faith tracker for character
   */
  static async getOrCreateTracker(characterId: string): Promise<ISanityTracker> {
    let tracker = await SanityTracker.findByCharacterId(characterId);

    if (!tracker) {
      tracker = await SanityTracker.createForCharacter(characterId);
      logger.info(`Created faith tracker for character ${characterId}`);
    }

    // Remove expired visions
    tracker.removeExpiredHallucinations();
    if (tracker.isModified()) {
      await tracker.save();
    }

    return tracker;
  }

  /**
   * Lose faith from divine/demonic encounter
   */
  static async loseFaith(
    characterId: string,
    amount: number,
    source: string
  ): Promise<{
    newFaith: number;
    faithState: FaithState;
    visionGained: DivineVision | null;
    woundGained: SpiritualWound | null;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    // Apply faith loss
    const result = await tracker.loseSanity(amount, source);

    // Roll for divine vision
    const vision = tracker.rollForHallucination();
    if (vision) {
      tracker.activeHallucinations.push(vision);
      await tracker.save();
    }

    // Handle spiritual wound
    let wound: SpiritualWound | null = null;
    if (result.traumaGained) {
      wound = await this.assignSpiritualWound(characterId, source);
    }

    // Build spiritual fortitude
    tracker.buildResistance(HORROR_CONSTANTS.HORROR_RESISTANCE_PER_ENCOUNTER);
    await tracker.save();

    const message = this.generateFaithLossMessage(tracker.sanityState, amount);

    logger.info(
      `Character ${characterId} lost ${amount} faith. New faith: ${result.newSanity}/${tracker.maxSanity}`
    );

    return {
      newFaith: result.newSanity,
      faithState: tracker.sanityState,
      visionGained: vision as any,
      woundGained: wound,
      message
    };
  }

  /**
   * Restore faith
   */
  static async restoreFaith(
    characterId: string,
    amount: number,
    method: string
  ): Promise<{
    newFaith: number;
    faithState: FaithState;
    message: string;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    const newFaith = await tracker.restoreSanity(amount);

    const message = `Your faith has been renewed. You feel the divine presence once more.`;

    logger.info(
      `Character ${characterId} restored ${amount} faith via ${method}. New faith: ${newFaith}/${tracker.maxSanity}`
    );

    return {
      newFaith,
      faithState: tracker.sanityState,
      message
    };
  }

  /**
   * Perform faith check (resist divine/demonic influence)
   */
  static async performFaithCheck(
    characterId: string,
    difficulty: number
  ): Promise<FaithCheck> {
    const tracker = await this.getOrCreateTracker(characterId);

    const roll = SecureRNG.d100();
    const totalModifier = tracker.currentSanity + tracker.horrorResistance;
    const success = roll + totalModifier >= difficulty * 10;

    const faithLoss = success ? 0 : Math.floor(difficulty * SecureRNG.range(2, 5));

    const check: FaithCheck = {
      difficulty,
      currentSanity: tracker.currentSanity,
      horrorResistance: tracker.horrorResistance,
      roll,
      success,
      sanityLoss: faithLoss,
      effects: []
    };

    if (!success && faithLoss > 0) {
      await this.loseFaith(characterId, faithLoss, 'failed_faith_check');
      check.effects = ['Faith wavered from divine trial'];
    }

    return check;
  }

  /**
   * Assign a spiritual wound to character
   */
  static async assignSpiritualWound(characterId: string, triggeredBy: string): Promise<SpiritualWound | null> {
    const tracker = await this.getOrCreateTracker(characterId);

    if (tracker.permanentTraumas.length >= HORROR_CONSTANTS.MAX_TRAUMAS) {
      return null;
    }

    // Find appropriate wound
    let woundDef = TRAUMA_DEFINITIONS.find(t => t.triggeredBy === triggeredBy);
    if (!woundDef) {
      // Default wound
      woundDef = TRAUMA_DEFINITIONS[0];
    }

    const wound = {
      ...woundDef,
      acquiredAt: new Date()
    };

    await tracker.addTrauma(wound);

    logger.warn(
      `Character ${characterId} gained spiritual wound: ${wound.name}`
    );

    return wound as any;
  }

  /**
   * Get active divine visions
   */
  static async getActiveVisions(characterId: string): Promise<DivineVision[]> {
    const tracker = await this.getOrCreateTracker(characterId);
    tracker.removeExpiredHallucinations();
    await tracker.save();

    return tracker.activeHallucinations as any[];
  }

  /**
   * Get permanent spiritual wounds
   */
  static async getSpiritualWounds(characterId: string): Promise<SpiritualWound[]> {
    const tracker = await this.getOrCreateTracker(characterId);
    return tracker.permanentTraumas as any[];
  }

  /**
   * Get combat penalty from wavering faith
   */
  static async getCombatPenalty(characterId: string): Promise<number> {
    const tracker = await this.getOrCreateTracker(characterId);
    return tracker.getSanityCombatPenalty();
  }

  /**
   * Check if character can encounter celestial beings
   */
  static async canEncounterCelestial(characterId: string): Promise<boolean> {
    const tracker = await this.getOrCreateTracker(characterId);
    return tracker.canEncounterHorror();
  }

  /**
   * Passive faith regeneration (called by background job)
   */
  static async passiveFaithRegen(): Promise<void> {
    const trackers = await SanityTracker.find({
      currentSanity: { $lt: HORROR_CONSTANTS.SANITY_MAX }
    });

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const tracker of trackers) {
      const hoursSinceLastRegen = (now - tracker.lastRestoration.getTime()) / oneHour;

      if (hoursSinceLastRegen >= 1) {
        // Check if character is in holy location
        const character = await Character.findById(tracker.characterId);
        if (!character) continue;

        // Faith regenerates in towns with churches or sacred places
        const holyPlaces = ['Dusty Hollow', 'Red Gulch', 'Nahi Village', 'Fort Sangre'];
        if (holyPlaces.includes(character.currentLocation)) {
          const regenAmount = Math.floor(hoursSinceLastRegen * HORROR_CONSTANTS.BASE_SANITY_REGEN);
          await tracker.restoreSanity(regenAmount);
        }
      }
    }
  }

  /**
   * Use faith restoration method (prayer, confession, etc.)
   */
  static async useFaithRestoration(
    characterId: string,
    methodId: string,
    session?: mongoose.ClientSession
  ): Promise<{
    success: boolean;
    newFaith: number;
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
          newFaith: 0,
          message: `Requires level ${method.requirements.minLevel}`
        };
      }
    }

    // Check costs
    if (method.cost && character.dollars < method.cost) {
      return {
        success: false,
        newFaith: 0,
        message: `Insufficient dollars. Need ${method.cost} dollars.`
      };
    }

    if (method.energyCost && character.energy < method.energyCost) {
      return {
        success: false,
        newFaith: 0,
        message: `Insufficient energy. Need ${method.energyCost} energy.`
      };
    }

    // Deduct costs
    if (method.cost) {
      await DollarService.deductDollars(
        character._id.toString(),
        method.cost,
        TransactionSource.RITUAL,
        { methodId, methodName: method.name },
        session || undefined
      );
    }

    if (method.energyCost) {
      character.energy -= method.energyCost;
      await character.save({ session: session || undefined });
    }

    // Restore faith
    const result = await this.restoreFaith(characterId, method.sanityRestored, methodId);

    logger.info(
      `Character ${characterId} used ${method.name} to restore ${method.sanityRestored} faith`
    );

    return {
      success: true,
      newFaith: result.newFaith,
      message: method.description,
      costGold: method.cost,
      costEnergy: method.energyCost
    };
  }

  /**
   * Generate atmospheric faith loss message
   */
  private static generateFaithLossMessage(state: FaithState, amount: number): string {
    const messages: Record<FaithState, string[]> = {
      [SanityState.STABLE]: [
        'Your faith wavers for a moment. You offer a silent prayer and steady yourself.',
        'The divine trial shakes you, but your conviction holds.',
        'Doubt flickers through your soul, but you remain faithful.'
      ],
      [SanityState.RATTLED]: [
        'Questions flood your mind. Has God truly abandoned this frontier?',
        'The silence where prayer used to bring comfort feels heavy.',
        'You clutch your cross tighter. Why does faith feel so distant?'
      ],
      [SanityState.SHAKEN]: [
        'Angels or demons? You can no longer tell which speaks to you.',
        'Your prayers feel hollow. The words taste like ash.',
        'The boundary between grace and damnation blurs before you.'
      ],
      [SanityState.BREAKING]: [
        'The divine light burns rather than comforts. You shield your eyes.',
        'Sacred words twist into blasphemy on your tongue.',
        'Heaven and Hell war for your soul. You feel torn apart.'
      ],
      [SanityState.SHATTERED]: [
        'Your faith shatters like stained glass. The shards cut deep.',
        'God has abandoned you. Or perhaps you have become what He despises.',
        'The pit yawns beneath you. The light above seems impossibly far.'
      ]
    };

    const stateMessages = messages[state];
    return SecureRNG.select(stateMessages);
  }

  /**
   * Get faith statistics for character
   */
  static async getFaithStatistics(characterId: string): Promise<{
    currentFaith: number;
    maxFaith: number;
    faithState: FaithState;
    totalLost: number;
    totalRestored: number;
    divineEncounters: number;
    spiritualFortitude: number;
    activeVisions: number;
    spiritualWounds: number;
    combatPenalty: number;
  }> {
    const tracker = await this.getOrCreateTracker(characterId);

    return {
      currentFaith: tracker.currentSanity,
      maxFaith: tracker.maxSanity,
      faithState: tracker.sanityState,
      totalLost: tracker.totalSanityLost,
      totalRestored: tracker.totalSanityRestored,
      divineEncounters: tracker.encountersWithHorror,
      spiritualFortitude: tracker.horrorResistance,
      activeVisions: tracker.activeHallucinations.length,
      spiritualWounds: tracker.permanentTraumas.length,
      combatPenalty: tracker.getSanityCombatPenalty()
    };
  }
}

// Backwards compatibility alias
export const SanityService = FaithService;
