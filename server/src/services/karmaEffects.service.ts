/**
 * Karma Effects Service
 *
 * Calculates and applies active blessing/curse modifiers to gameplay.
 * Used by combat, gambling, crime, and other services to modify outcomes
 * based on a character's divine favor or disfavor.
 *
 * Effects are aggregated from all active (non-expired) blessings and curses
 * and returned as a single modifier object for easy application.
 */

import { Types } from 'mongoose';
import { CharacterKarma, IBlessing, ICurse } from '../models/CharacterKarma.model';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

// ============================================================================
// EFFECT TYPES
// ============================================================================

/**
 * Combined karma effects from all active blessings and curses
 * Positive values = bonuses, Negative values = penalties
 */
export interface IKarmaEffects {
  // Luck modifiers
  luck_bonus: number;           // General luck for random outcomes
  critical_chance: number;      // Critical hit chance modifier
  gambling_bonus: number;       // Gambling win rate modifier
  gambling_penalty: number;     // Gambling loss rate modifier (negative)

  // Combat modifiers
  combat_bonus: number;         // Damage dealt modifier
  combat_penalty: number;       // Combat effectiveness reduction (negative)
  crit_bonus: number;           // Critical damage multiplier
  damage_variance: number;      // Random damage variance increase
  damage_reduction: number;     // Damage taken reduction
  health_regen: number;         // Health regeneration rate
  accuracy: number;             // Hit chance modifier

  // Social modifiers
  reputation_bonus: number;     // Reputation gain modifier
  reputation_penalty: number;   // Reputation reduction (negative)
  npc_disposition: number;      // NPC starting attitude modifier
  intimidation: number;         // Intimidation effectiveness

  // Deception modifiers
  deception_bonus: number;      // Lie/bribe success modifier
  deception_penalty: number;    // Deception reduction (negative)
  bribe_discount: number;       // Reduced bribe costs

  // Movement/Energy modifiers
  escape_bonus: number;         // Flee success modifier
  movement_penalty: number;     // Movement cost increase (negative)
  energy_cost_increase: number; // Energy cost modifier (negative)
  jail_time_reduction: number;  // Jail sentence reduction

  // Fear/Morale
  fear_penalty: number;         // Fear/morale effects (negative)

  // Source tracking
  blessingCount: number;
  curseCount: number;
  sources: Array<{
    type: 'blessing' | 'curse';
    name: string;
    source: 'GAMBLER' | 'OUTLAW_KING';
  }>;
}

/**
 * Default effects with all values at zero (neutral)
 */
const DEFAULT_EFFECTS: IKarmaEffects = {
  luck_bonus: 0,
  critical_chance: 0,
  gambling_bonus: 0,
  gambling_penalty: 0,
  combat_bonus: 0,
  combat_penalty: 0,
  crit_bonus: 0,
  damage_variance: 0,
  damage_reduction: 0,
  health_regen: 0,
  accuracy: 0,
  reputation_bonus: 0,
  reputation_penalty: 0,
  npc_disposition: 0,
  intimidation: 0,
  deception_bonus: 0,
  deception_penalty: 0,
  bribe_discount: 0,
  escape_bonus: 0,
  movement_penalty: 0,
  energy_cost_increase: 0,
  jail_time_reduction: 0,
  fear_penalty: 0,
  blessingCount: 0,
  curseCount: 0,
  sources: []
};

// ============================================================================
// EFFECT MAPPING - Maps blessing/curse effect keys to IKarmaEffects fields
// ============================================================================

const EFFECT_KEY_MAP: Record<string, keyof IKarmaEffects> = {
  // Luck
  'luck_bonus': 'luck_bonus',
  'general_luck': 'luck_bonus',
  'luck_penalty': 'luck_bonus',
  'critical_chance': 'critical_chance',
  'gambling_bonus': 'gambling_bonus',
  'gambling_penalty': 'gambling_penalty',

  // Combat
  'combat_bonus': 'combat_bonus',
  'combat_penalty': 'combat_penalty',
  'crit_bonus': 'crit_bonus',
  'damage_variance': 'damage_variance',
  'damage_reduction': 'damage_reduction',
  'health_regen': 'health_regen',
  'accuracy': 'accuracy',

  // Social
  'reputation_bonus': 'reputation_bonus',
  'reputation_penalty': 'reputation_penalty',
  'npc_disposition': 'npc_disposition',
  'intimidation': 'intimidation',

  // Deception
  'deception_bonus': 'deception_bonus',
  'deception_penalty': 'deception_penalty',
  'bribe_discount': 'bribe_discount',

  // Movement
  'escape_bonus': 'escape_bonus',
  'movement_penalty': 'movement_penalty',
  'energy_cost_increase': 'energy_cost_increase',
  'jail_time_reduction': 'jail_time_reduction',

  // Fear
  'fear_penalty': 'fear_penalty'
};

// ============================================================================
// KARMA EFFECTS SERVICE
// ============================================================================

class KarmaEffectsService {
  /**
   * Get combined active effects for a character
   * Aggregates all non-expired blessings and curses into a single effect object
   */
  async getActiveEffects(characterId: string | Types.ObjectId): Promise<IKarmaEffects> {
    const effects: IKarmaEffects = { ...DEFAULT_EFFECTS, sources: [] };

    try {
      const karma = await CharacterKarma.findOne({ characterId });

      if (!karma) {
        return effects;
      }

      const now = new Date();

      // Process active blessings
      const activeBlessings = karma.blessings.filter(
        (b: IBlessing) => !b.expiresAt || b.expiresAt > now
      );

      for (const blessing of activeBlessings) {
        this.applyEffects(effects, blessing, 'blessing');
      }

      // Process active curses
      const activeCurses = karma.curses.filter(
        (c: ICurse) => !c.expiresAt || c.expiresAt > now
      );

      for (const curse of activeCurses) {
        this.applyEffects(effects, curse, 'curse');
      }

      effects.blessingCount = activeBlessings.length;
      effects.curseCount = activeCurses.length;

      logger.debug(`Karma effects calculated for character ${characterId}`, {
        blessings: effects.blessingCount,
        curses: effects.curseCount,
        effects: {
          luck: effects.luck_bonus,
          combat: effects.combat_bonus,
          deception: effects.deception_bonus
        }
      });

      return effects;
    } catch (error) {
      logger.error('Failed to get karma effects', { characterId, error });
      return effects;
    }
  }

  /**
   * Apply effects from a blessing or curse to the cumulative effects object
   */
  private applyEffects(
    effects: IKarmaEffects,
    source: IBlessing | ICurse,
    type: 'blessing' | 'curse'
  ): void {
    // Parse effect data if it's a string
    let effectData: Record<string, number | string>;

    if (typeof source === 'object' && 'type' in source) {
      // This is a blessing or curse document - we need to look up its effects
      // Effects are stored in the manifestation, but for gameplay we use
      // standardized effect types based on the blessing/curse type
      effectData = this.getEffectDataForType(source.type, type, source.source);
    } else {
      effectData = {};
    }

    // Scale by power (blessings) or severity (curses)
    const multiplier = type === 'blessing'
      ? (source as IBlessing).power || 1
      : (source as ICurse).severity || 1;

    for (const [key, value] of Object.entries(effectData)) {
      if (key === 'removalCondition') continue;

      const mappedKey = EFFECT_KEY_MAP[key];
      if (mappedKey && typeof value === 'number' && mappedKey !== 'sources' && mappedKey !== 'blessingCount' && mappedKey !== 'curseCount') {
        // TYPE-5 FIX: Type-safe numeric property access
        // At this point, mappedKey is guaranteed to be a numeric effect property
        const currentValue = effects[mappedKey];
        if (typeof currentValue === 'number') {
          // Apply multiplier and add to cumulative effects
          (effects as unknown as Record<string, number | unknown[]>)[mappedKey] = currentValue + value * multiplier;
        }
      }
    }

    // Track source
    effects.sources.push({
      type,
      name: source.type,
      source: source.source
    });
  }

  /**
   * Get standardized effect data for a blessing/curse type
   * Mirrors the definitions in karma.service.ts
   */
  private getEffectDataForType(
    type: string,
    category: 'blessing' | 'curse',
    deity: 'GAMBLER' | 'OUTLAW_KING'
  ): Record<string, number> {
    // Gambler blessings
    const gamblerBlessings: Record<string, Record<string, number>> = {
      'FORTUNE_FAVOR': { luck_bonus: 15, gambling_bonus: 10 },
      'RIGHTEOUS_HAND': { combat_bonus: 10, accuracy: 5 },
      'GENTLE_TOUCH': { reputation_bonus: 20, npc_disposition: 10 },
      'GAMBLERS_LUCK': { luck_bonus: 10, critical_chance: 5 }
    };

    // Gambler curses
    const gamblerCurses: Record<string, Record<string, number>> = {
      'FATES_DISFAVOR': { luck_bonus: -20, gambling_penalty: -15 },
      'MARKED_LIAR': { deception_penalty: -25, npc_disposition: -10 },
      'UNLUCKY_STREAK': { luck_bonus: -15, critical_chance: -10 }
    };

    // Outlaw King blessings
    const outlawBlessings: Record<string, Record<string, number>> = {
      'WILD_SPIRIT': { crit_bonus: 20, damage_variance: 15 },
      'UNKILLABLE': { damage_reduction: 15, health_regen: 5 },
      'SILVER_TONGUE': { deception_bonus: 25, bribe_discount: 20 },
      'OUTLAWS_FREEDOM': { escape_bonus: 30, jail_time_reduction: 50 }
    };

    // Outlaw King curses
    const outlawCurses: Record<string, Record<string, number>> = {
      'CHAINS_OF_ORDER': { movement_penalty: -20, energy_cost_increase: 10 },
      'FOOLS_MARK': { combat_penalty: -15, intimidation: -20 },
      'BRANDED_COWARD': { fear_penalty: 25, reputation_penalty: -15 }
    };

    // Select appropriate effect set
    if (category === 'blessing') {
      if (deity === 'GAMBLER' && gamblerBlessings[type]) {
        return gamblerBlessings[type];
      }
      if (deity === 'OUTLAW_KING' && outlawBlessings[type]) {
        return outlawBlessings[type];
      }
    } else {
      if (deity === 'GAMBLER' && gamblerCurses[type]) {
        return gamblerCurses[type];
      }
      if (deity === 'OUTLAW_KING' && outlawCurses[type]) {
        return outlawCurses[type];
      }
    }

    return {};
  }

  // ============================================================================
  // EFFECT APPLICATION HELPERS
  // ============================================================================

  /**
   * Apply luck modifier to a random chance roll
   * Note: Only uses luck_bonus, NOT critical_chance (which is for combat crits only)
   * @param baseChance Base success chance (0-100)
   * @param effects Karma effects object
   * @returns Modified chance (0-100, clamped)
   */
  applyLuckModifier(baseChance: number, effects: IKarmaEffects): number {
    // LOGIC-5 FIX: critical_chance should NOT affect general luck rolls
    // critical_chance is specifically for combat critical hits
    const modifier = effects.luck_bonus;
    const modifiedChance = baseChance + modifier;

    // Clamp to 5-95 range (always some chance of success/failure)
    return Math.max(5, Math.min(95, modifiedChance));
  }

  /**
   * Apply combat modifiers to damage dealt
   * @param baseDamage Base damage before modifiers
   * @param effects Karma effects object
   * @returns Modified damage (minimum 1)
   */
  applyCombatDamageModifier(baseDamage: number, effects: IKarmaEffects): number {
    // Base modifier from combat bonus
    let damage = baseDamage * (1 + effects.combat_bonus / 100);

    // Apply penalty if any
    if (effects.combat_penalty < 0) {
      damage *= (1 + effects.combat_penalty / 100);
    }

    // Add variance if wild spirit is active
    if (effects.damage_variance > 0) {
      const variance = SecureRNG.float(-1, 1, 4) * effects.damage_variance / 100;
      damage *= (1 + variance);
    }

    return Math.max(1, Math.round(damage));
  }

  /**
   * Calculate critical hit chance
   * @param baseCritChance Base crit chance (0-100)
   * @param effects Karma effects object
   * @returns Modified crit chance (0-100)
   */
  applyCriticalChanceModifier(baseCritChance: number, effects: IKarmaEffects): number {
    const modifier = effects.critical_chance + (effects.crit_bonus / 2);
    return Math.max(0, Math.min(100, baseCritChance + modifier));
  }

  /**
   * Apply damage reduction to incoming damage
   * @param incomingDamage Raw incoming damage
   * @param effects Karma effects object
   * @returns Reduced damage (minimum 1)
   */
  applyDamageReduction(incomingDamage: number, effects: IKarmaEffects): number {
    const reduction = effects.damage_reduction / 100;
    const reducedDamage = incomingDamage * (1 - reduction);
    return Math.max(1, Math.round(reducedDamage));
  }

  /**
   * Apply deception modifier to bribe/lie success chance
   * @param baseChance Base success chance (0-100)
   * @param effects Karma effects object
   * @returns Modified chance (0-100)
   */
  applyDeceptionModifier(baseChance: number, effects: IKarmaEffects): number {
    const modifier = effects.deception_bonus + effects.deception_penalty;
    return Math.max(5, Math.min(95, baseChance + modifier));
  }

  /**
   * Apply bribe cost discount
   * @param baseCost Base bribe cost
   * @param effects Karma effects object
   * @returns Discounted cost
   */
  applyBribeDiscount(baseCost: number, effects: IKarmaEffects): number {
    const discount = effects.bribe_discount / 100;
    return Math.max(1, Math.round(baseCost * (1 - discount)));
  }

  /**
   * Apply escape/flee modifier
   * @param baseChance Base escape chance (0-100)
   * @param effects Karma effects object
   * @returns Modified chance (0-100)
   */
  applyEscapeModifier(baseChance: number, effects: IKarmaEffects): number {
    return Math.max(5, Math.min(95, baseChance + effects.escape_bonus));
  }

  /**
   * Apply energy cost modifier
   * @param baseCost Base energy cost
   * @param effects Karma effects object
   * @returns Modified cost (minimum 1)
   */
  applyEnergyCostModifier(baseCost: number, effects: IKarmaEffects): number {
    const increase = effects.energy_cost_increase / 100;
    const penalty = effects.movement_penalty / 100;
    const modifier = increase - penalty; // movement_penalty is negative, so subtracting adds
    return Math.max(1, Math.round(baseCost * (1 + modifier)));
  }

  /**
   * Apply jail time reduction
   * @param baseTime Base jail time in minutes
   * @param effects Karma effects object
   * @returns Reduced time (minimum 1)
   */
  applyJailTimeReduction(baseTime: number, effects: IKarmaEffects): number {
    const reduction = effects.jail_time_reduction / 100;
    return Math.max(1, Math.round(baseTime * (1 - reduction)));
  }

  /**
   * Apply reputation modifier
   * @param baseReputation Base reputation change
   * @param effects Karma effects object
   * @returns Modified reputation change
   */
  applyReputationModifier(baseReputation: number, effects: IKarmaEffects): number {
    if (baseReputation >= 0) {
      return Math.round(baseReputation * (1 + effects.reputation_bonus / 100));
    } else {
      return Math.round(baseReputation * (1 + Math.abs(effects.reputation_penalty) / 100));
    }
  }

  /**
   * Apply NPC disposition modifier
   * @param baseDisposition Base NPC disposition (-100 to 100)
   * @param effects Karma effects object
   * @returns Modified disposition
   */
  applyNPCDispositionModifier(baseDisposition: number, effects: IKarmaEffects): number {
    return Math.max(-100, Math.min(100, baseDisposition + effects.npc_disposition));
  }

  /**
   * Apply gambling modifier
   * @param baseChance Base win chance (0-100)
   * @param effects Karma effects object
   * @returns Modified win chance (0-100)
   */
  applyGamblingModifier(baseChance: number, effects: IKarmaEffects): number {
    const modifier = effects.gambling_bonus + effects.gambling_penalty + effects.luck_bonus;
    return Math.max(5, Math.min(95, baseChance + modifier));
  }

  /**
   * Check if character has any active effects
   */
  async hasActiveEffects(characterId: string | Types.ObjectId): Promise<boolean> {
    const effects = await this.getActiveEffects(characterId);
    return effects.blessingCount > 0 || effects.curseCount > 0;
  }

  /**
   * Check if a specific effect type is active
   */
  async hasEffect(characterId: string | Types.ObjectId, effectName: string): Promise<boolean> {
    const effects = await this.getActiveEffects(characterId);
    return effects.sources.some(s => s.name === effectName);
  }

  /**
   * Get a summary of active effects for display
   */
  async getEffectsSummary(characterId: string | Types.ObjectId): Promise<{
    blessings: string[];
    curses: string[];
    netLuck: number;
    netCombat: number;
    netDeception: number;
  }> {
    const effects = await this.getActiveEffects(characterId);

    return {
      blessings: effects.sources.filter(s => s.type === 'blessing').map(s => s.name),
      curses: effects.sources.filter(s => s.type === 'curse').map(s => s.name),
      netLuck: effects.luck_bonus + effects.critical_chance + effects.gambling_bonus + effects.gambling_penalty,
      netCombat: effects.combat_bonus + effects.combat_penalty + effects.crit_bonus + effects.damage_reduction,
      netDeception: effects.deception_bonus + effects.deception_penalty + effects.bribe_discount
    };
  }
}

export const karmaEffectsService = new KarmaEffectsService();
export default karmaEffectsService;
