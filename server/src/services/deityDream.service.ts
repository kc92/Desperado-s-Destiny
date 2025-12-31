/**
 * Deity Dream Service
 *
 * Handles the generation and delivery of divine dreams to characters
 * during rest actions. Dreams are a primary manifestation type that
 * provides karma hints, warnings, blessings, or curses.
 *
 * Dream Types:
 * - PROPHETIC: Good future shown (positive trajectory + positive affinity)
 * - WARNING: Deity warns of path (declining trajectory + positive affinity)
 * - VISION: Deity tests resolve (improving trajectory + negative affinity)
 * - NIGHTMARE: Deity shows consequences (declining trajectory + negative affinity)
 * - MEMORY: Neutral reflection (stable trajectory)
 * - CHAOS_DREAM: Volatile karma trajectory
 */

import mongoose, { Types } from 'mongoose';
import { CharacterKarma, ICharacterKarma, IKarmaValues } from '../models/CharacterKarma.model';
import { DeityAttention, DeityName } from '../models/DeityAttention.model';
import { DivineManifestation, ManifestationType } from '../models/DivineManifestation.model';
import deityDialogueService from './deityDialogue.service';
import deityDecisionService from './deityDecision.service';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * Rest types that can trigger dreams
 * - short_rest/short: Brief rest, low chance
 * - full_rest/long: Full night's rest, higher chance
 * - death: Between life and death, highest chance for visions
 * - hotel/camp/home: Location-based rest with varying chances
 */
export type RestType = 'short_rest' | 'short' | 'full_rest' | 'long' | 'hotel' | 'camp' | 'home' | 'death';

/**
 * Dream types with their effects and descriptions
 */
export type DreamType = 'PROPHETIC' | 'WARNING' | 'VISION' | 'NIGHTMARE' | 'MEMORY' | 'CHAOS_DREAM';

/**
 * Dream result returned to the caller
 */
export interface IDreamResult {
  deity: DeityName;
  dreamType: DreamType;
  message: string;
  effects: IDreamEffect;
  manifestationId: string;
}

/**
 * Effects applied from a dream
 */
export interface IDreamEffect {
  luckBonus?: number;
  luckPenalty?: number;
  sanityEffect?: number;
  revealTrajectory?: boolean;
  testReward?: string;
  duration?: number;
}

/**
 * Dream effect templates by type
 */
const DREAM_EFFECTS: Record<DreamType, IDreamEffect> = {
  PROPHETIC: {
    luckBonus: 5,
    sanityEffect: 1,
    duration: 24 * 60 * 60 * 1000 // 24 hours
  },
  WARNING: {
    revealTrajectory: true,
    sanityEffect: 0
  },
  VISION: {
    testReward: 'blessing_on_pass',
    sanityEffect: 0
  },
  NIGHTMARE: {
    luckPenalty: -5,
    sanityEffect: -1,
    revealTrajectory: true,
    duration: 12 * 60 * 60 * 1000 // 12 hours
  },
  MEMORY: {
    sanityEffect: 1
  },
  CHAOS_DREAM: {
    sanityEffect: -1,
    revealTrajectory: true
  }
};

/**
 * Dream chance by rest type
 */
const DREAM_CHANCE_BY_REST: Record<RestType, number> = {
  death: 0.45,       // 45% base chance - between life and death, highest vision chance
  full_rest: 0.30,   // 30% base chance
  long: 0.30,        // 30% base chance (alias for full_rest)
  hotel: 0.28,       // 28% base chance
  home: 0.25,        // 25% base chance
  camp: 0.15,        // 15% base chance
  short_rest: 0.10,  // 10% base chance
  short: 0.10        // 10% base chance (alias for short_rest)
};

/**
 * Minimum hours between dreams
 */
const DREAM_COOLDOWN_HOURS = 8;

class DeityDreamService {
  /**
   * Check if a character should receive a dream during rest
   * Returns dream result or null if no dream
   */
  async checkForDream(
    characterId: string | Types.ObjectId,
    restType: RestType
  ): Promise<IDreamResult | null> {
    try {
      const karma = await CharacterKarma.findByCharacterId(characterId);
      if (!karma) return null;

      // Check cooldown
      if (!this.isDreamAvailable(karma)) {
        logger.debug(`Dream on cooldown for character ${characterId}`);
        return null;
      }

      // Calculate dream chance
      const dreamChance = await this.calculateDreamChance(characterId, karma, restType);
      if (!SecureRNG.chance(dreamChance)) {
        return null;
      }

      // Select which deity sends the dream
      const deity = await this.selectDreamDeity(characterId, karma);
      if (!deity) return null;

      // Generate the dream
      const dream = await this.generateDream(characterId, karma, deity);
      if (!dream) return null;

      // Update karma record
      karma.lastDreamFrom = deity;
      karma.lastDreamAt = new Date();
      karma.dreamsReceived++;
      await karma.save();

      // Update deity attention
      const attention = await DeityAttention.findByCharacterAndDeity(characterId, deity);
      if (attention) {
        attention.recordIntervention('DREAM');
        await attention.save();
      }

      logger.info(`Dream generated for character ${characterId}`, {
        deity,
        dreamType: dream.dreamType,
        restType
      });

      return dream;
    } catch (error) {
      logger.error('Error checking for dream:', error);
      return null;
    }
  }

  /**
   * Check if a dream is available (not on cooldown)
   */
  isDreamAvailable(karma: ICharacterKarma): boolean {
    if (!karma.lastDreamAt) return true;

    const hoursSince = (Date.now() - karma.lastDreamAt.getTime()) / (1000 * 60 * 60);
    return hoursSince >= DREAM_COOLDOWN_HOURS;
  }

  /**
   * Calculate the chance of receiving a dream
   */
  async calculateDreamChance(
    characterId: string | Types.ObjectId,
    karma: ICharacterKarma,
    restType: RestType
  ): Promise<number> {
    // Base chance from rest type
    let chance = DREAM_CHANCE_BY_REST[restType] || 0.1;

    // Get attention from both deities
    const gamblerAttention = await DeityAttention.findByCharacterAndDeity(characterId, 'GAMBLER');
    const outlawAttention = await DeityAttention.findByCharacterAndDeity(characterId, 'OUTLAW_KING');

    // Attention modifier (0-100 total attention = 0-2x modifier)
    const totalAttention = (gamblerAttention?.attention || 0) + (outlawAttention?.attention || 0);
    const attentionModifier = Math.min(2, totalAttention / 50);
    chance *= attentionModifier;

    // Moral conflict bonus (deities love dramatic characters)
    if (karma.detectMoralConflict()) {
      chance *= 1.25;
    }

    // Active blessings/curses bonus (more divine activity = more dreams)
    const activeEffects = karma.getActiveBlessings().length + karma.getActiveCurses().length;
    if (activeEffects > 0) {
      chance *= (1 + activeEffects * 0.1);
    }

    // Time since last dream bonus (longer = higher chance)
    if (karma.lastDreamAt) {
      const hoursSince = (Date.now() - karma.lastDreamAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        chance *= 1.2;
      }
      if (hoursSince > 72) {
        chance *= 1.5;
      }
    }

    // Cap at 50% to prevent guarantee
    return Math.min(0.5, chance);
  }

  /**
   * Select which deity sends the dream
   */
  async selectDreamDeity(
    characterId: string | Types.ObjectId,
    karma: ICharacterKarma
  ): Promise<DeityName | null> {
    // Get attention from both deities
    const gamblerAttention = await DeityAttention.findByCharacterAndDeity(characterId, 'GAMBLER');
    const outlawAttention = await DeityAttention.findByCharacterAndDeity(characterId, 'OUTLAW_KING');

    const gamblerScore = gamblerAttention?.attention || 0;
    const outlawScore = outlawAttention?.attention || 0;

    // If neither deity is paying attention, no dream
    if (gamblerScore < 10 && outlawScore < 10) {
      return null;
    }

    // Weight by attention level
    const total = gamblerScore + outlawScore;
    if (SecureRNG.chance(gamblerScore / total)) {
      return 'GAMBLER';
    } else {
      return 'OUTLAW_KING';
    }
  }

  /**
   * Generate the dream content and create manifestation
   */
  async generateDream(
    characterId: string | Types.ObjectId,
    karma: ICharacterKarma,
    deity: DeityName
  ): Promise<IDreamResult | null> {
    try {
      const affinity = deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;

      // Get karma trajectory
      const trajectory = await deityDecisionService.analyzeKarmaTrajectory(karma, deity);

      // Determine dream type
      const dreamType = this.determineDreamType(affinity, trajectory);

      // Get dream effects
      const effects = DREAM_EFFECTS[dreamType];

      // Generate dream message
      const message = deityDialogueService.generateMessage(deity, 'DREAM', {
        karma: karma.karma,
        affinity,
        isBlessing: dreamType === 'PROPHETIC' || dreamType === 'MEMORY',
        isCurse: dreamType === 'NIGHTMARE'
      });

      // Create manifestation record
      const manifestation = new DivineManifestation({
        deityName: deity,
        targetCharacterId: characterId,
        type: 'DREAM' as ManifestationType,
        message,
        effect: JSON.stringify({
          dreamType,
          ...effects,
          trajectoryInfo: trajectory.direction
        }),
        urgency: dreamType === 'NIGHTMARE' ? 'HIGH' : 'LOW',
        delivered: false,
        acknowledged: false
      });

      await manifestation.save();

      return {
        deity,
        dreamType,
        message,
        effects,
        manifestationId: manifestation._id.toString()
      };
    } catch (error) {
      logger.error('Error generating dream:', error);
      return null;
    }
  }

  /**
   * Determine dream type based on affinity and trajectory
   */
  determineDreamType(
    affinity: number,
    trajectory: { direction: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'VOLATILE' }
  ): DreamType {
    const isPositive = affinity > 0;

    switch (trajectory.direction) {
      case 'IMPROVING':
        return isPositive ? 'PROPHETIC' : 'VISION';

      case 'DECLINING':
        return isPositive ? 'WARNING' : 'NIGHTMARE';

      case 'VOLATILE':
        return 'CHAOS_DREAM';

      case 'STABLE':
      default:
        return 'MEMORY';
    }
  }

  /**
   * Apply dream effects to a character
   * Called after the dream is acknowledged
   */
  async applyDreamEffects(
    characterId: string | Types.ObjectId,
    dreamType: DreamType
  ): Promise<void> {
    const effects = DREAM_EFFECTS[dreamType];
    if (!effects) return;

    // Get karma record
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) return;

    // Apply sanity effects (if sanity system exists)
    // This would integrate with SanityTracker.model.ts if implemented

    // Apply luck effects (temporary blessing/curse)
    if (effects.luckBonus && effects.duration) {
      const expiresAt = new Date(Date.now() + effects.duration);
      karma.blessings.push({
        source: karma.lastDreamFrom || 'GAMBLER',
        type: 'DREAM_LUCK',
        power: 1,
        description: 'A fortunate vision lingers in your mind.',
        expiresAt,
        grantedAt: new Date()
      });
    }

    if (effects.luckPenalty && effects.duration) {
      const expiresAt = new Date(Date.now() + effects.duration);
      karma.curses.push({
        source: karma.lastDreamFrom || 'OUTLAW_KING',
        type: 'DREAM_CURSE',
        severity: 1,
        description: 'The nightmare clouds your thoughts.',
        removalCondition: 'Wait for the effect to fade.',
        expiresAt,
        inflictedAt: new Date()
      });
    }

    await karma.save();

    logger.debug(`Applied dream effects to character ${characterId}`, {
      dreamType,
      effects
    });
  }

  /**
   * Get dream interpretation (for UI display)
   */
  getDreamInterpretation(dreamType: DreamType, deity: DeityName): string {
    const interpretations: Record<DeityName, Record<DreamType, string>> = {
      GAMBLER: {
        PROPHETIC: 'The cards reveal fortune in your path. Continue walking the righteous road.',
        WARNING: 'The deck whispers of divergence. Your chosen path leads to shadow.',
        VISION: 'A test of character awaits. Will you prove worthy of redemption?',
        NIGHTMARE: 'The hand you play is cursed. Change your ways, or face the dealer\'s judgment.',
        MEMORY: 'The past shuffles through your dreams. What lessons do you take forward?',
        CHAOS_DREAM: 'The cards dance wildly, their meanings shifting. Your fate remains unwritten.'
      },
      OUTLAW_KING: {
        PROPHETIC: 'The wild spirits show you freedom. Break your chains and claim your destiny.',
        WARNING: 'The frontier warns of complacency. Do not let order tame your spirit.',
        VISION: 'A choice between cage and sky. What price are you willing to pay for freedom?',
        NIGHTMARE: 'Chains rattle in the darkness. Your submission brings only suffering.',
        MEMORY: 'The untamed past echoes through your mind. Remember what you fight for.',
        CHAOS_DREAM: 'Fire and wind war in your dreams. The world itself is in flux.'
      }
    };

    return interpretations[deity][dreamType] ||
      'A mysterious dream whose meaning remains unclear.';
  }

  /**
   * Force a dream for testing/admin purposes
   */
  async forceDream(
    characterId: string | Types.ObjectId,
    deity: DeityName,
    dreamType: DreamType
  ): Promise<IDreamResult | null> {
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) return null;

    const effects = DREAM_EFFECTS[dreamType];
    const affinity = deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;

    const message = deityDialogueService.generateMessage(deity, 'DREAM', {
      karma: karma.karma,
      affinity,
      isBlessing: dreamType === 'PROPHETIC' || dreamType === 'MEMORY',
      isCurse: dreamType === 'NIGHTMARE'
    });

    const manifestation = new DivineManifestation({
      deityName: deity,
      targetCharacterId: characterId,
      type: 'DREAM' as ManifestationType,
      message,
      effect: JSON.stringify({ dreamType, ...effects }),
      urgency: 'MEDIUM',
      delivered: false,
      acknowledged: false
    });

    await manifestation.save();

    // Update karma record
    karma.lastDreamFrom = deity;
    karma.lastDreamAt = new Date();
    karma.dreamsReceived++;
    await karma.save();

    return {
      deity,
      dreamType,
      message,
      effects,
      manifestationId: manifestation._id.toString()
    };
  }
}

export const deityDreamService = new DeityDreamService();
export default deityDreamService;
