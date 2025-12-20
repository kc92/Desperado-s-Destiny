/**
 * Deity Omen Service
 *
 * Handles the generation and application of divine omens.
 * Omens are environmental signs from the deities - subtle manifestations
 * that provide temporary effects (buffs/debuffs) and hint at karma state.
 *
 * Omen Types:
 * - Good omens: Luck bonuses, escape bonuses, damage bonuses
 * - Bad omens: Luck penalties, movement penalties, combat penalties
 * - Neutral omens: Warnings about upcoming events
 */

import mongoose, { Types } from 'mongoose';
import { CharacterKarma, ICharacterKarma } from '../models/CharacterKarma.model';
import { DeityAttention, DeityName } from '../models/DeityAttention.model';
import { DivineManifestation, ManifestationType } from '../models/DivineManifestation.model';
import logger from '../utils/logger';

// ============================================================================
// OMEN DEFINITIONS
// ============================================================================

export interface IOmenEffect {
  type: string;
  value: number;
  duration: number; // milliseconds
}

export interface IOmenTemplate {
  id: string;
  deity: DeityName;
  isGood: boolean | null; // null = neutral
  description: string;
  effect: IOmenEffect;
}

/**
 * The Gambler's Omens
 */
const GAMBLER_OMENS: IOmenTemplate[] = [
  // Good omens
  {
    id: 'LUCKY_FIND',
    deity: 'GAMBLER',
    isGood: true,
    description: 'A four-leaf clover grows where you step.',
    effect: { type: 'luck_bonus', value: 5, duration: 3600000 } // 1 hour
  },
  {
    id: 'COIN_EDGE',
    deity: 'GAMBLER',
    isGood: true,
    description: 'A coin lands on its edge and stays there, defying all odds.',
    effect: { type: 'crit_chance', value: 3, duration: 7200000 } // 2 hours
  },
  {
    id: 'SHOOTING_STAR',
    deity: 'GAMBLER',
    isGood: true,
    description: 'A shooting star crosses the sky in daylight.',
    effect: { type: 'gambling_bonus', value: 10, duration: 3600000 }
  },
  {
    id: 'PERFECT_DEAL',
    deity: 'GAMBLER',
    isGood: true,
    description: 'Cards fall from the sky, landing in a perfect royal flush.',
    effect: { type: 'luck_bonus', value: 10, duration: 1800000 } // 30 min
  },

  // Bad omens
  {
    id: 'SNAKE_EYES',
    deity: 'GAMBLER',
    isGood: false,
    description: 'Dice fall from your pocket. Both show ones.',
    effect: { type: 'luck_penalty', value: -5, duration: 3600000 }
  },
  {
    id: 'CRACKED_MIRROR',
    deity: 'GAMBLER',
    isGood: false,
    description: 'Your reflection in a window cracks before your eyes.',
    effect: { type: 'gambling_penalty', value: -10, duration: 3600000 }
  },
  {
    id: 'DEAD_MANS_HAND',
    deity: 'GAMBLER',
    isGood: false,
    description: 'You find five cards at your feet. Aces and eights, all black.',
    effect: { type: 'combat_penalty', value: -5, duration: 7200000 }
  },

  // Neutral omens (warnings)
  {
    id: 'ACE_OF_SPADES',
    deity: 'GAMBLER',
    isGood: null,
    description: 'An Ace of Spades lies face-up in your path.',
    effect: { type: 'omen_warning', value: 1, duration: 7200000 }
  },
  {
    id: 'BROKEN_WATCH',
    deity: 'GAMBLER',
    isGood: null,
    description: 'A pocket watch falls at your feet. It stopped at midnight.',
    effect: { type: 'time_warning', value: 1, duration: 3600000 }
  }
];

/**
 * The Outlaw King's Omens
 */
const OUTLAW_KING_OMENS: IOmenTemplate[] = [
  // Good omens
  {
    id: 'BROKEN_CHAIN',
    deity: 'OUTLAW_KING',
    isGood: true,
    description: 'A rusted chain breaks as you pass.',
    effect: { type: 'escape_bonus', value: 10, duration: 3600000 }
  },
  {
    id: 'WILD_FIRE',
    deity: 'OUTLAW_KING',
    isGood: true,
    description: "Distant flames spell out a word you can't quite read.",
    effect: { type: 'damage_bonus', value: 5, duration: 3600000 }
  },
  {
    id: 'WOLF_HOWL',
    deity: 'OUTLAW_KING',
    isGood: true,
    description: 'A wolf howls in the distance. It sounds like approval.',
    effect: { type: 'survival_bonus', value: 10, duration: 7200000 }
  },
  {
    id: 'BROKEN_BARS',
    deity: 'OUTLAW_KING',
    isGood: true,
    description: 'Iron bars rust and crumble before your eyes.',
    effect: { type: 'jail_resistance', value: 15, duration: 3600000 }
  },

  // Bad omens
  {
    id: 'CAGED_BIRD',
    deity: 'OUTLAW_KING',
    isGood: false,
    description: 'A bird in a cage watches you with knowing eyes.',
    effect: { type: 'movement_penalty', value: -5, duration: 3600000 }
  },
  {
    id: 'TIGHTENING_ROPE',
    deity: 'OUTLAW_KING',
    isGood: false,
    description: 'A noose tightens in the wind, though no one hangs.',
    effect: { type: 'wanted_increase', value: 1, duration: 0 } // Instant effect
  },
  {
    id: 'SILENT_HORSE',
    deity: 'OUTLAW_KING',
    isGood: false,
    description: 'A riderless horse stands motionless, staring at you.',
    effect: { type: 'escape_penalty', value: -10, duration: 3600000 }
  },

  // Neutral omens (warnings)
  {
    id: 'HOWLING_WIND',
    deity: 'OUTLAW_KING',
    isGood: null,
    description: 'The wind howls a name. It sounds like yours.',
    effect: { type: 'confrontation_warning', value: 1, duration: 7200000 }
  },
  {
    id: 'CIRCLING_VULTURES',
    deity: 'OUTLAW_KING',
    isGood: null,
    description: 'Vultures circle overhead, though nothing has died.',
    effect: { type: 'danger_warning', value: 1, duration: 3600000 }
  }
];

// PERF-2 FIX: Cache combined omens array at module level to avoid repeated concatenation
const ALL_OMENS: IOmenTemplate[] = [...GAMBLER_OMENS, ...OUTLAW_KING_OMENS];

// Create a Map for O(1) lookup by omen ID
const OMENS_BY_ID = new Map<string, IOmenTemplate>(
  ALL_OMENS.map(omen => [omen.id, omen])
);

// ============================================================================
// OMEN RESULT INTERFACE
// ============================================================================

export interface IOmenResult {
  deity: DeityName;
  omen: IOmenTemplate;
  manifestationId: string;
  effectApplied: boolean;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class DeityOmenService {
  /**
   * Generate an omen for a character
   */
  async generateOmen(
    characterId: string | Types.ObjectId,
    deity: DeityName,
    forceType?: 'good' | 'bad' | 'neutral'
  ): Promise<IOmenResult | null> {
    try {
      const karma = await CharacterKarma.findByCharacterId(characterId);
      if (!karma) return null;

      const affinity = deity === 'GAMBLER' ? karma.gamblerAffinity : karma.outlawKingAffinity;

      // Select omen based on affinity (unless forced)
      const omen = this.selectOmen(deity, affinity, forceType);
      if (!omen) return null;

      // Create manifestation record
      const manifestation = new DivineManifestation({
        deityName: deity,
        targetCharacterId: characterId,
        type: 'OMEN' as ManifestationType,
        message: omen.description,
        effect: JSON.stringify(omen.effect),
        urgency: omen.isGood === null ? 'HIGH' : 'MEDIUM',
        delivered: false,
        acknowledged: false
      });

      await manifestation.save();

      // Apply effect if it's immediate (duration = 0) or has a duration
      let effectApplied = false;
      if (omen.effect.duration === 0) {
        // Instant effects
        await this.applyInstantEffect(characterId, omen);
        effectApplied = true;
      } else {
        // Timed effects - add as temporary blessing/curse
        await this.applyTimedEffect(characterId, deity, omen);
        effectApplied = true;
      }

      // Update attention
      const attention = await DeityAttention.findByCharacterAndDeity(characterId, deity);
      if (attention) {
        attention.recordIntervention('OMEN');
        await attention.save();
      }

      logger.info(`Generated ${deity} omen for character ${characterId}`, {
        omenId: omen.id,
        isGood: omen.isGood,
        effect: omen.effect.type
      });

      return {
        deity,
        omen,
        manifestationId: manifestation._id.toString(),
        effectApplied
      };
    } catch (error) {
      logger.error('Error generating omen:', error);
      return null;
    }
  }

  /**
   * Select an appropriate omen based on deity and affinity
   */
  private selectOmen(
    deity: DeityName,
    affinity: number,
    forceType?: 'good' | 'bad' | 'neutral'
  ): IOmenTemplate | null {
    const omens = deity === 'GAMBLER' ? GAMBLER_OMENS : OUTLAW_KING_OMENS;

    // Filter by type if forced
    let filtered = omens;
    if (forceType) {
      filtered = omens.filter(o => {
        if (forceType === 'good') return o.isGood === true;
        if (forceType === 'bad') return o.isGood === false;
        return o.isGood === null;
      });
    } else {
      // Filter based on affinity
      filtered = omens.filter(o => {
        // Don't give good omens to enemies
        if (affinity < -20 && o.isGood === true) return false;
        // Don't curse favorites
        if (affinity > 20 && o.isGood === false) return false;
        return true;
      });
    }

    if (filtered.length === 0) return null;

    // Random selection from filtered omens
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Apply instant effects (no duration)
   */
  private async applyInstantEffect(
    characterId: string | Types.ObjectId,
    omen: IOmenTemplate
  ): Promise<void> {
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) return;

    switch (omen.effect.type) {
      case 'wanted_increase':
        // Would integrate with wanted/bounty system
        logger.debug(`Would increase wanted level for ${characterId}`);
        break;

      default:
        logger.debug(`Unknown instant effect type: ${omen.effect.type}`);
    }
  }

  /**
   * Apply timed effects as temporary blessings/curses
   */
  private async applyTimedEffect(
    characterId: string | Types.ObjectId,
    deity: DeityName,
    omen: IOmenTemplate
  ): Promise<void> {
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) return;

    const expiresAt = new Date(Date.now() + omen.effect.duration);

    if (omen.isGood === true || omen.isGood === null) {
      // Good or neutral omens add as blessings
      karma.blessings.push({
        source: deity,
        type: `OMEN_${omen.id}`,
        power: 1,
        description: omen.description,
        expiresAt,
        grantedAt: new Date()
      });
    } else {
      // Bad omens add as curses
      karma.curses.push({
        source: deity,
        type: `OMEN_${omen.id}`,
        severity: 1,
        description: omen.description,
        removalCondition: 'Wait for the omen to pass.',
        expiresAt,
        inflictedAt: new Date()
      });
    }

    await karma.save();
  }

  /**
   * Check if character should receive an omen (called from deity tick)
   */
  async checkForOmen(
    characterId: string | Types.ObjectId,
    deity: DeityName
  ): Promise<IOmenResult | null> {
    // Get attention level
    const attention = await DeityAttention.findByCharacterAndDeity(characterId, deity);
    if (!attention) return null;

    // Check cooldown
    if (!attention.canReceiveOmen()) {
      return null;
    }

    // Base chance modified by attention
    const baseChance = 0.08; // 8%
    const chance = attention.calculateInterventionChance(baseChance);

    if (Math.random() > chance) {
      return null;
    }

    return this.generateOmen(characterId, deity);
  }

  /**
   * Get active omen effects for a character
   */
  async getActiveOmenEffects(characterId: string | Types.ObjectId): Promise<{
    blessings: Array<{ type: string; effect: IOmenEffect; expiresAt: Date }>;
    curses: Array<{ type: string; effect: IOmenEffect; expiresAt: Date }>;
  }> {
    const karma = await CharacterKarma.findByCharacterId(characterId);
    if (!karma) {
      return { blessings: [], curses: [] };
    }

    const now = new Date();

    // Filter active omen blessings (uses cached OMENS_BY_ID for O(1) lookup)
    const blessings = karma.blessings
      .filter(b => b.type.startsWith('OMEN_') && (!b.expiresAt || b.expiresAt > now))
      .map(b => {
        const omenId = b.type.replace('OMEN_', '');
        const omen = OMENS_BY_ID.get(omenId);
        return {
          type: b.type,
          effect: omen?.effect || { type: 'unknown', value: 0, duration: 0 },
          expiresAt: b.expiresAt!
        };
      });

    // Filter active omen curses (uses cached OMENS_BY_ID for O(1) lookup)
    const curses = karma.curses
      .filter(c => c.type.startsWith('OMEN_') && (!c.expiresAt || c.expiresAt > now))
      .map(c => {
        const omenId = c.type.replace('OMEN_', '');
        const omen = OMENS_BY_ID.get(omenId);
        return {
          type: c.type,
          effect: omen?.effect || { type: 'unknown', value: 0, duration: 0 },
          expiresAt: c.expiresAt!
        };
      });

    return { blessings, curses };
  }

  /**
   * Calculate total omen modifier for a specific effect type
   */
  async calculateOmenModifier(
    characterId: string | Types.ObjectId,
    effectType: string
  ): Promise<number> {
    const activeEffects = await this.getActiveOmenEffects(characterId);

    let modifier = 0;

    for (const blessing of activeEffects.blessings) {
      if (blessing.effect.type === effectType) {
        modifier += blessing.effect.value;
      }
    }

    for (const curse of activeEffects.curses) {
      if (curse.effect.type === effectType) {
        modifier += curse.effect.value; // Value is already negative for curses
      }
    }

    return modifier;
  }

  /**
   * Get all available omen templates for reference
   */
  getAllOmenTemplates(): {
    gambler: IOmenTemplate[];
    outlawKing: IOmenTemplate[];
  } {
    return {
      gambler: GAMBLER_OMENS,
      outlawKing: OUTLAW_KING_OMENS
    };
  }

  /**
   * Force an omen for testing/admin purposes
   */
  async forceOmen(
    characterId: string | Types.ObjectId,
    omenId: string
  ): Promise<IOmenResult | null> {
    const allOmens = [...GAMBLER_OMENS, ...OUTLAW_KING_OMENS];
    const omen = allOmens.find(o => o.id === omenId);

    if (!omen) {
      logger.warn(`Omen not found: ${omenId}`);
      return null;
    }

    // Create manifestation
    const manifestation = new DivineManifestation({
      deityName: omen.deity,
      targetCharacterId: characterId,
      type: 'OMEN' as ManifestationType,
      message: omen.description,
      effect: JSON.stringify(omen.effect),
      urgency: 'MEDIUM',
      delivered: true,
      acknowledged: false
    });

    await manifestation.save();

    // Apply effect
    await this.applyTimedEffect(characterId, omen.deity, omen);

    return {
      deity: omen.deity,
      omen,
      manifestationId: manifestation._id.toString(),
      effectApplied: true
    };
  }
}

export const deityOmenService = new DeityOmenService();
export default deityOmenService;
