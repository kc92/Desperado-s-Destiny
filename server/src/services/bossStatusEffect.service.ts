/**
 * Boss Status Effect Service
 *
 * Handles status effect application, processing, and decay for boss encounters.
 * Implements DOT damage, debuffs, stacking, and effect-specific mechanics.
 */

import {
  StatusEffect,
  StatusEffectInstance,
  BossAbility,
  BossDamageType,
} from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Result of processing status effects for a turn
 */
export interface StatusEffectResult {
  damage: number;
  effects: string[];
  expiredEffects: string[];
  modifiers: {
    damageMultiplier: number;
    defenseMultiplier: number;
    handSizeModifier: number;
    canAct: boolean;
  };
}

/**
 * Player state interface for status effect processing
 * Uses a simplified status effect structure matching the database model
 */
interface PlayerState {
  health: number;
  maxHealth: number;
  statusEffects: Array<{
    type: StatusEffect;
    duration: number;
    power: number;
    appliedAt: Date;
    stackable?: boolean;
    maxStacks?: number;
  }>;
  isAlive: boolean;
  damageTaken: number;
}

/**
 * Status effect configuration - defines behavior for each effect type
 */
const STATUS_EFFECT_CONFIG: Record<StatusEffect, {
  isDot: boolean;
  damagePerPower: number;
  preventAction: boolean;
  damageModifier: number;
  defenseModifier: number;
  handSizeModifier: number;
  description: string;
}> = {
  // DOT Effects
  [StatusEffect.BLEED]: {
    isDot: true,
    damagePerPower: 1.0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 1.0,
    handSizeModifier: 0,
    description: 'Bleeding: Taking damage over time',
  },
  [StatusEffect.BURN]: {
    isDot: true,
    damagePerPower: 1.2,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 0.9, // Burns reduce defense
    handSizeModifier: 0,
    description: 'Burning: Taking fire damage over time',
  },
  [StatusEffect.POISON]: {
    isDot: true,
    damagePerPower: 0.8,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 1.0,
    handSizeModifier: 0,
    description: 'Poisoned: Taking poison damage over time',
  },
  [StatusEffect.CORRUPTION]: {
    isDot: true,
    damagePerPower: 1.5,
    preventAction: false,
    damageModifier: 0.9,
    defenseModifier: 0.9,
    handSizeModifier: 0,
    description: 'Corrupted: Taking void damage and weakened',
  },

  // Control Effects
  [StatusEffect.STUN]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: true,
    damageModifier: 1.0,
    defenseModifier: 0.5, // Stunned = vulnerable
    handSizeModifier: 0,
    description: 'Stunned: Cannot act this turn',
  },
  [StatusEffect.FEAR]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.7, // Fear reduces damage
    defenseModifier: 0.8,
    handSizeModifier: -1, // Draw fewer cards
    description: 'Feared: Dealing less damage, drawing fewer cards',
  },
  [StatusEffect.CONFUSION]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.8,
    defenseModifier: 1.0,
    handSizeModifier: -1,
    description: 'Confused: Attacks may miss or be weaker',
  },
  [StatusEffect.ROOT]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 0.8,
    handSizeModifier: 0,
    description: 'Rooted: Cannot flee or use movement abilities',
  },
  [StatusEffect.SILENCE]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 1.0,
    handSizeModifier: 0,
    description: 'Silenced: Cannot use items or special abilities',
  },

  // Debuff Effects
  [StatusEffect.WEAKNESS]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.6, // Major damage reduction
    defenseModifier: 1.0,
    handSizeModifier: 0,
    description: 'Weakened: Dealing significantly less damage',
  },
  [StatusEffect.ARMOR_BREAK]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 0.5, // Major defense reduction
    handSizeModifier: 0,
    description: 'Armor Broken: Taking significantly more damage',
  },
  [StatusEffect.SLOW]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.9,
    defenseModifier: 0.9,
    handSizeModifier: -1,
    description: 'Slowed: Reduced combat effectiveness',
  },
  [StatusEffect.BLIND]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.5,
    defenseModifier: 0.7,
    handSizeModifier: -2, // Major hand size penalty
    description: 'Blinded: Severely reduced accuracy and awareness',
  },
  [StatusEffect.MADNESS]: {
    isDot: true,
    damagePerPower: 0.5,
    preventAction: false,
    damageModifier: 1.2, // Madness increases damage but...
    defenseModifier: 0.6, // ...reduces defense significantly
    handSizeModifier: 0,
    description: 'Maddened: Increased damage but vulnerable',
  },

  // Special Boss Mechanic Effects (Phase 19.5)
  [StatusEffect.COLD_EXPOSURE]: {
    isDot: true,
    damagePerPower: 0.5,
    preventAction: false,
    damageModifier: 0.9,
    defenseModifier: 0.9,
    handSizeModifier: -1, // Cold reduces hand size
    description: 'Cold Exposure: Freezing, reduced hand size',
  },
  [StatusEffect.GOLD_CORRUPTION]: {
    isDot: true,
    damagePerPower: 1.0,
    preventAction: false,
    damageModifier: 0.8,
    defenseModifier: 0.8,
    handSizeModifier: 0,
    description: 'Gold Corruption: Cursed by ancient gold',
  },
  [StatusEffect.GUILTY_VERDICT]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.7,
    defenseModifier: 0.7,
    handSizeModifier: -1,
    description: 'Guilty Verdict: Found guilty by Judge Bean',
  },
  [StatusEffect.CONTEMPT_OF_COURT]: {
    isDot: true,
    damagePerPower: 2.0,
    preventAction: false,
    damageModifier: 0.5,
    defenseModifier: 0.5,
    handSizeModifier: -2,
    description: 'Contempt of Court: Severe penalties from the Judge',
  },
  [StatusEffect.MARKED]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 0.5, // Marked = priority target, extra vulnerable
    handSizeModifier: 0,
    description: 'Marked: Targeted by the spirit, extra vulnerable',
  },
  [StatusEffect.OXYGEN_DEPLETION]: {
    isDot: true,
    damagePerPower: 1.5,
    preventAction: false,
    damageModifier: 0.8,
    defenseModifier: 1.0,
    handSizeModifier: -1,
    description: 'Oxygen Depletion: Suffocating in bad air',
  },
  [StatusEffect.POKER_ROUND_ACTIVE]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 1.0,
    handSizeModifier: 2, // Extra cards for poker round
    description: 'Poker Round: High stakes card game active',
  },
  [StatusEffect.GUILT_VISION_ACTIVE]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.8,
    defenseModifier: 0.8,
    handSizeModifier: 0,
    description: 'Guilt Vision: Haunted by past sins',
  },
  [StatusEffect.ALTAR_TRIGGER]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 1.0,
    handSizeModifier: 0,
    description: 'Altar Triggered: Dark ritual in progress',
  },
  [StatusEffect.DEAD_MANS_HAND_DEBUFF]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.7,
    defenseModifier: 0.7,
    handSizeModifier: -1,
    description: 'Dead Man\'s Hand: Cursed by Wild Bill\'s final hand',
  },
  [StatusEffect.TOUCHED_BY_GOLD]: {
    isDot: true,
    damagePerPower: 0.8,
    preventAction: false,
    damageModifier: 1.0,
    defenseModifier: 0.8,
    handSizeModifier: 0,
    description: 'Touched by Gold: Slowly turning to gold',
  },
  [StatusEffect.COWARDS_MARK]: {
    isDot: false,
    damagePerPower: 0,
    preventAction: false,
    damageModifier: 0.6,
    defenseModifier: 1.0,
    handSizeModifier: -1,
    description: 'Coward\'s Mark: Shame reduces combat effectiveness',
  },
  [StatusEffect.CONSUMED_BY_RAGE]: {
    isDot: true,
    damagePerPower: 0.3,
    preventAction: false,
    damageModifier: 1.3, // Rage increases damage
    defenseModifier: 0.6, // But reduces defense
    handSizeModifier: 0,
    description: 'Consumed by Rage: Increased damage but vulnerable',
  },
};

/**
 * Status effect instance for application (simplified)
 */
interface EffectToApply {
  type: StatusEffect;
  duration: number;
  power: number;
  stackable?: boolean;
  maxStacks?: number;
}

export class BossStatusEffectService {
  /**
   * Apply a status effect to a player
   */
  static applyEffect(
    playerState: PlayerState,
    effect: EffectToApply,
    immunities: StatusEffect[] = []
  ): { applied: boolean; message: string } {
    // Check immunity
    if (immunities.includes(effect.type)) {
      return {
        applied: false,
        message: `Immune to ${effect.type}`,
      };
    }

    // Check for existing effect of same type
    const existingIndex = playerState.statusEffects.findIndex(
      e => e.type === effect.type
    );

    if (existingIndex >= 0) {
      const existing = playerState.statusEffects[existingIndex];

      // Check if stackable
      if (effect.stackable) {
        const currentStacks = existing.power / (effect.power || 1);
        const maxStacks = effect.maxStacks || 5;

        if (currentStacks < maxStacks) {
          // Add stack
          existing.power += effect.power;
          existing.duration = Math.max(existing.duration, effect.duration);
          existing.appliedAt = new Date();

          logger.debug(`Stacked ${effect.type} effect (power: ${existing.power})`);

          return {
            applied: true,
            message: `${effect.type} stacked (${Math.floor(currentStacks + 1)} stacks)`,
          };
        } else {
          // Refresh duration at max stacks
          existing.duration = Math.max(existing.duration, effect.duration);

          return {
            applied: true,
            message: `${effect.type} refreshed (max stacks)`,
          };
        }
      } else {
        // Non-stackable - refresh duration if new is longer
        if (effect.duration > existing.duration) {
          existing.duration = effect.duration;
          existing.power = Math.max(existing.power, effect.power);
          existing.appliedAt = new Date();

          return {
            applied: true,
            message: `${effect.type} refreshed`,
          };
        }

        return {
          applied: false,
          message: `${effect.type} already active`,
        };
      }
    }

    // Apply new effect
    playerState.statusEffects.push({
      type: effect.type,
      duration: effect.duration,
      power: effect.power,
      stackable: effect.stackable,
      maxStacks: effect.maxStacks,
      appliedAt: new Date(),
    });

    const config = STATUS_EFFECT_CONFIG[effect.type];
    logger.debug(`Applied ${effect.type} effect: ${config?.description || 'Unknown effect'}`);

    return {
      applied: true,
      message: config?.description || `${effect.type} applied`,
    };
  }

  /**
   * Process all status effects for a player at start of turn
   * Returns total DOT damage and modifiers for the turn
   */
  static processEffects(playerState: PlayerState): StatusEffectResult {
    let totalDamage = 0;
    const effects: string[] = [];
    const expiredEffects: string[] = [];

    // Aggregate modifiers
    let damageMultiplier = 1.0;
    let defenseMultiplier = 1.0;
    let handSizeModifier = 0;
    let canAct = true;

    // Process each effect
    for (const effect of playerState.statusEffects) {
      const config = STATUS_EFFECT_CONFIG[effect.type];

      if (!config) {
        logger.warn(`Unknown status effect type: ${effect.type}`);
        continue;
      }

      // Apply DOT damage
      if (config.isDot && effect.power > 0) {
        const dotDamage = Math.floor(effect.power * config.damagePerPower);
        totalDamage += dotDamage;
        effects.push(`${effect.type}: ${dotDamage} damage`);
      }

      // Apply modifiers (multiplicative for damage/defense)
      damageMultiplier *= config.damageModifier;
      defenseMultiplier *= config.defenseModifier;
      handSizeModifier += config.handSizeModifier;

      // Check action prevention
      if (config.preventAction) {
        canAct = false;
        effects.push(`${effect.type}: Cannot act`);
      }
    }

    // Apply DOT damage to player
    if (totalDamage > 0) {
      playerState.health = Math.max(0, playerState.health - totalDamage);
      playerState.damageTaken += totalDamage;

      if (playerState.health <= 0) {
        playerState.isAlive = false;
      }
    }

    return {
      damage: totalDamage,
      effects,
      expiredEffects,
      modifiers: {
        damageMultiplier,
        defenseMultiplier,
        handSizeModifier,
        canAct,
      },
    };
  }

  /**
   * Decay effect durations at end of turn
   * Returns list of expired effect names
   */
  static decayEffects(playerState: PlayerState): string[] {
    const expiredEffects: string[] = [];

    playerState.statusEffects = playerState.statusEffects.filter(effect => {
      effect.duration -= 1;

      if (effect.duration <= 0) {
        expiredEffects.push(effect.type);
        logger.debug(`Effect expired: ${effect.type}`);
        return false;
      }

      return true;
    });

    return expiredEffects;
  }

  /**
   * Remove a specific effect from a player
   */
  static removeEffect(playerState: PlayerState, effectType: StatusEffect): boolean {
    const initialLength = playerState.statusEffects.length;
    playerState.statusEffects = playerState.statusEffects.filter(
      e => e.type !== effectType
    );

    return playerState.statusEffects.length < initialLength;
  }

  /**
   * Remove all effects from a player
   */
  static clearAllEffects(playerState: PlayerState): number {
    const count = playerState.statusEffects.length;
    playerState.statusEffects = [];
    return count;
  }

  /**
   * Check if player has a specific effect
   */
  static hasEffect(playerState: PlayerState, effectType: StatusEffect): boolean {
    return playerState.statusEffects.some(e => e.type === effectType);
  }

  /**
   * Get effect stacks for a specific effect type
   */
  static getEffectStacks(playerState: PlayerState, effectType: StatusEffect): number {
    const effect = playerState.statusEffects.find(e => e.type === effectType);
    if (!effect) return 0;

    // Stacks are represented by power divided by base power
    // For simplicity, we estimate 1 stack = power value
    return effect.power;
  }

  /**
   * Create a status effect instance from ability data
   */
  static createEffectFromAbility(ability: BossAbility): StatusEffectInstance | null {
    if (!ability.effect) {
      return null;
    }

    return {
      type: ability.effect.type,
      duration: ability.effect.duration,
      power: ability.effect.power,
      stackable: ability.effect.stackable,
      maxStacks: ability.effect.maxStacks,
      appliedAt: new Date(),
    };
  }

  /**
   * Get human-readable description for active effects
   */
  static getEffectDescriptions(playerState: PlayerState): string[] {
    return playerState.statusEffects.map(effect => {
      const config = STATUS_EFFECT_CONFIG[effect.type];
      return `${config?.description || effect.type} (${effect.duration} turns remaining)`;
    });
  }

  /**
   * Calculate combined modifiers from all active effects
   */
  static getCombinedModifiers(playerState: PlayerState): {
    damageMultiplier: number;
    defenseMultiplier: number;
    handSizeModifier: number;
    canAct: boolean;
  } {
    let damageMultiplier = 1.0;
    let defenseMultiplier = 1.0;
    let handSizeModifier = 0;
    let canAct = true;

    for (const effect of playerState.statusEffects) {
      const config = STATUS_EFFECT_CONFIG[effect.type];
      if (!config) continue;

      damageMultiplier *= config.damageModifier;
      defenseMultiplier *= config.defenseModifier;
      handSizeModifier += config.handSizeModifier;

      if (config.preventAction) {
        canAct = false;
      }
    }

    return {
      damageMultiplier,
      defenseMultiplier,
      handSizeModifier,
      canAct,
    };
  }
}
