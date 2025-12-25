/**
 * Boss Ability Executor Service
 *
 * Handles execution of different boss ability types:
 * - DAMAGE: Direct damage attacks
 * - AOE: Area of effect damage to all players
 * - DOT: Apply damage over time effects
 * - DEBUFF: Apply status effects without immediate damage
 * - BUFF: Boss self-enhancement (heal, defense, etc.)
 * - SUMMON: Spawn minions
 * - HEAL: Boss healing
 * - PHASE_CHANGE: Force phase transition
 * - ENVIRONMENTAL: Modify arena/add hazards
 * - ULTIMATE: Powerful finisher abilities
 * - TRANSFORMATION: Spirit form changes
 */

import {
  BossAbility,
  BossAbilityType,
  BossEncounter,
  BossPhase,
  StatusEffectInstance,
  StatusEffect,
  BossDamageType,
  AppliedStatusEffect,
} from '@desperados/shared';
import { IBossEncounter } from '../models/BossEncounter.model';
import { BossStatusEffectService } from './bossStatusEffect.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

/**
 * Result of executing a boss ability
 */
export interface AbilityExecutionResult {
  abilityId: string;
  abilityName: string;
  abilityType: BossAbilityType;
  targetIds: string[];
  damage: number;
  effectsApplied: AppliedStatusEffect[];
  healAmount?: number;
  minionsSpawned?: Array<{
    id: string;
    name: string;
    health: number;
    damage: number;
  }>;
  environmentalEffect?: {
    type: string;
    description: string;
    duration: number;
  };
  narrative: string;
  telegraphMessage?: string;
}

/**
 * Player state interface for ability execution
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
 * Minion definition
 */
interface Minion {
  id: string;
  type: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  isAlive: boolean;
}

export class BossAbilityExecutorService {
  /**
   * Execute a boss ability
   */
  static executeAbility(
    encounter: IBossEncounter,
    boss: BossEncounter,
    ability: BossAbility,
    currentPhase: BossPhase,
    baseDamage: number
  ): AbilityExecutionResult {
    // Select targets based on ability target type
    const targetIds = this.selectTargets(encounter, ability);

    // Calculate damage with phase modifiers
    const damage = this.calculateDamage(ability, currentPhase, baseDamage);

    // Build base result
    const result: AbilityExecutionResult = {
      abilityId: ability.id,
      abilityName: ability.name,
      abilityType: ability.type,
      targetIds,
      damage: 0,
      effectsApplied: [],
      narrative: ability.narrative || this.generateNarrative(ability, boss),
      telegraphMessage: ability.telegraphMessage,
    };

    // Execute based on ability type
    switch (ability.type) {
      case BossAbilityType.DAMAGE:
        this.executeDamage(encounter, targetIds, damage, result);
        break;

      case BossAbilityType.AOE:
        this.executeAoE(encounter, damage, result);
        break;

      case BossAbilityType.DOT:
        this.executeDot(encounter, ability, targetIds, damage, result);
        break;

      case BossAbilityType.DEBUFF:
        this.executeDebuff(encounter, ability, targetIds, result);
        break;

      case BossAbilityType.BUFF:
        this.executeBuff(encounter, ability, result);
        break;

      case BossAbilityType.SUMMON:
        this.executeSummon(encounter, ability, currentPhase, result);
        break;

      case BossAbilityType.HEAL:
        this.executeHeal(encounter, ability, result);
        break;

      case BossAbilityType.PHASE_CHANGE:
        this.executePhaseChange(encounter, ability, result);
        break;

      case BossAbilityType.ENVIRONMENTAL:
        this.executeEnvironmental(encounter, ability, result);
        break;

      case BossAbilityType.ULTIMATE:
        this.executeUltimate(encounter, ability, targetIds, damage, result);
        break;

      case BossAbilityType.TRANSFORMATION:
        this.executeTransformation(encounter, boss, ability, result);
        break;

      default:
        // Fallback to basic damage
        this.executeDamage(encounter, targetIds, damage, result);
    }

    logger.info(
      `Boss used ${ability.name} (${ability.type}): ${result.damage} damage to ${targetIds.length} targets`
    );

    return result;
  }

  /**
   * Select targets for an ability
   */
  private static selectTargets(
    encounter: IBossEncounter,
    ability: BossAbility
  ): string[] {
    const alivePlayers = Array.from(encounter.playerStates.entries())
      .filter(([_, state]) => (state as any).isAlive)
      .map(([id, _]) => id);

    if (alivePlayers.length === 0) {
      return [];
    }

    switch (ability.targetType) {
      case 'single':
        return [SecureRNG.select(alivePlayers)];

      case 'all':
        return alivePlayers;

      case 'random':
        const count = Math.min(SecureRNG.range(1, 3), alivePlayers.length);
        const shuffled = SecureRNG.shuffle([...alivePlayers]);
        return shuffled.slice(0, count);

      default:
        return [alivePlayers[0]];
    }
  }

  /**
   * Calculate damage with phase modifiers
   */
  private static calculateDamage(
    ability: BossAbility,
    currentPhase: BossPhase,
    baseDamage: number
  ): number {
    let damage = ability.damage || baseDamage;

    // Apply phase modifiers
    for (const modifier of currentPhase.modifiers) {
      if (modifier.type === 'damage') {
        damage = Math.floor(damage * modifier.multiplier);
      }
    }

    // Add variance (±10%)
    const variance = SecureRNG.range(-10, 10);
    damage += variance;

    return Math.max(1, damage);
  }

  /**
   * Execute direct damage ability
   */
  private static executeDamage(
    encounter: IBossEncounter,
    targetIds: string[],
    damage: number,
    result: AbilityExecutionResult
  ): void {
    result.damage = 0;

    for (const targetId of targetIds) {
      const playerState = encounter.playerStates.get(targetId) as PlayerState;
      if (!playerState) continue;

      // Apply defense modifiers from status effects
      const modifiers = BossStatusEffectService.getCombinedModifiers(playerState);
      const finalDamage = Math.floor(damage / modifiers.defenseMultiplier);

      playerState.health = Math.max(0, playerState.health - finalDamage);
      playerState.damageTaken += finalDamage;
      result.damage += finalDamage;

      if (playerState.health <= 0) {
        playerState.isAlive = false;
      }
    }
  }

  /**
   * Execute AoE damage ability (hits all alive players)
   */
  private static executeAoE(
    encounter: IBossEncounter,
    damage: number,
    result: AbilityExecutionResult
  ): void {
    const alivePlayers = Array.from(encounter.playerStates.entries())
      .filter(([_, state]) => (state as any).isAlive)
      .map(([id, _]) => id);

    result.targetIds = alivePlayers;
    result.damage = 0;

    for (const targetId of alivePlayers) {
      const playerState = encounter.playerStates.get(targetId) as PlayerState;
      if (!playerState) continue;

      // AoE damage is typically slightly reduced per target
      const aoeDamage = Math.floor(damage * 0.8);

      const modifiers = BossStatusEffectService.getCombinedModifiers(playerState);
      const finalDamage = Math.floor(aoeDamage / modifiers.defenseMultiplier);

      playerState.health = Math.max(0, playerState.health - finalDamage);
      playerState.damageTaken += finalDamage;
      result.damage += finalDamage;

      if (playerState.health <= 0) {
        playerState.isAlive = false;
      }
    }
  }

  /**
   * Execute DOT ability (damage + apply effect)
   */
  private static executeDot(
    encounter: IBossEncounter,
    ability: BossAbility,
    targetIds: string[],
    damage: number,
    result: AbilityExecutionResult
  ): void {
    // First apply immediate damage (reduced for DOT abilities)
    const immediateDamage = Math.floor(damage * 0.5);
    this.executeDamage(encounter, targetIds, immediateDamage, result);

    // Then apply the DOT effect
    if (ability.effect) {
      for (const targetId of targetIds) {
        const playerState = encounter.playerStates.get(targetId) as PlayerState;
        if (!playerState || !playerState.isAlive) continue;

        const effectInstance = BossStatusEffectService.createEffectFromAbility(ability);
        if (effectInstance) {
          // Note: player immunities would be checked here if implemented
          const applyResult = BossStatusEffectService.applyEffect(
            playerState,
            effectInstance,
            [] // Player immunities (none for now)
          );

          result.effectsApplied.push({
            targetId,
            effect: ability.effect.type,
            applied: applyResult.applied,
            message: applyResult.message,
          });
        }
      }
    }
  }

  /**
   * Execute debuff ability (status effect without immediate damage)
   */
  private static executeDebuff(
    encounter: IBossEncounter,
    ability: BossAbility,
    targetIds: string[],
    result: AbilityExecutionResult
  ): void {
    if (!ability.effect) {
      logger.warn(`Debuff ability ${ability.id} has no effect defined`);
      return;
    }

    for (const targetId of targetIds) {
      const playerState = encounter.playerStates.get(targetId) as PlayerState;
      if (!playerState || !playerState.isAlive) continue;

      const effectInstance = BossStatusEffectService.createEffectFromAbility(ability);
      if (effectInstance) {
        const applyResult = BossStatusEffectService.applyEffect(
          playerState,
          effectInstance,
          []
        );

        result.effectsApplied.push({
          targetId,
          effect: ability.effect.type,
          applied: applyResult.applied,
          message: applyResult.message,
        });
      }
    }
  }

  /**
   * Execute boss buff ability (self-enhancement)
   */
  private static executeBuff(
    encounter: IBossEncounter,
    ability: BossAbility,
    result: AbilityExecutionResult
  ): void {
    // Boss buffs could modify encounter state
    // For now, we'll track this in environmental effects
    result.environmentalEffect = {
      type: 'boss_buff',
      description: ability.description,
      duration: ability.effect?.duration || 3,
    };

    result.narrative = `${ability.name}: The boss grows stronger!`;
  }

  /**
   * Execute summon ability (spawn minions)
   */
  private static executeSummon(
    encounter: IBossEncounter,
    ability: BossAbility,
    currentPhase: BossPhase,
    result: AbilityExecutionResult
  ): void {
    result.minionsSpawned = [];

    // Check if phase has minion definitions
    const minionDef = currentPhase.summonMinions;

    // Determine minion count and stats
    const minionCount = minionDef?.count || SecureRNG.range(1, 3);
    const minionName = minionDef?.type || ability.name.replace('Summon ', '').replace('Swarm', 'Creature');

    // Base minion stats derived from ability damage or defaults
    const baseHealth = ability.damage ? ability.damage * 2 : 50;
    const baseDamage = ability.damage ? Math.floor(ability.damage / 3) : 10;

    for (let i = 0; i < minionCount; i++) {
      const minion: Minion = {
        id: `minion_${Date.now()}_${i}`,
        type: minionDef?.type || 'minion',
        name: minionName,
        health: baseHealth + SecureRNG.range(0, 20),
        maxHealth: baseHealth + 20,
        damage: baseDamage + SecureRNG.range(0, 5),
        isAlive: true,
      };

      // Add to encounter's minion array if it exists
      if (!(encounter as any).minions) {
        (encounter as any).minions = [];
      }
      (encounter as any).minions.push(minion);

      result.minionsSpawned.push({
        id: minion.id,
        name: minion.name,
        health: minion.health,
        damage: minion.damage,
      });
    }

    const spawnMessage = minionDef?.spawnMessage || `${minionCount} creatures emerge!`;
    result.narrative = `${ability.name}: ${spawnMessage}`;
  }

  /**
   * Execute heal ability (boss self-heal)
   */
  private static executeHeal(
    encounter: IBossEncounter,
    ability: BossAbility,
    result: AbilityExecutionResult
  ): void {
    const healAmount = ability.damage || 50; // Reuse damage field for heal amount
    const oldHealth = encounter.bossHealth;

    encounter.bossHealth = Math.min(
      encounter.bossMaxHealth,
      encounter.bossHealth + healAmount
    );

    result.healAmount = encounter.bossHealth - oldHealth;
    result.narrative = `${ability.name}: The boss recovers ${result.healAmount} health!`;
  }

  /**
   * Execute phase change ability (force transition)
   */
  private static executePhaseChange(
    encounter: IBossEncounter,
    ability: BossAbility,
    result: AbilityExecutionResult
  ): void {
    // Phase change abilities can force a transition
    // This is typically handled by health thresholds, but some bosses
    // have abilities that force transitions
    result.narrative = `${ability.name}: The battle shifts dramatically!`;
    result.environmentalEffect = {
      type: 'phase_change',
      description: ability.description,
      duration: 0, // Permanent
    };
  }

  /**
   * Execute environmental ability (add arena hazards)
   * Environmental effects are tracked in the result and can be processed
   * by the client or encounter service separately
   */
  private static executeEnvironmental(
    encounter: IBossEncounter,
    ability: BossAbility,
    result: AbilityExecutionResult
  ): void {
    const hazard = {
      type: ability.id,
      description: ability.description,
      duration: ability.effect?.duration || 5,
      damagePerTurn: ability.damage || 10,
    };

    // Store environmental effect in result for tracking
    // The encounter service can persist this to the database if needed
    result.environmentalEffect = {
      type: hazard.type,
      description: hazard.description,
      duration: hazard.duration,
    };

    result.narrative = `${ability.name}: The arena becomes more dangerous!`;
  }

  /**
   * Execute ultimate ability (high damage + effects)
   */
  private static executeUltimate(
    encounter: IBossEncounter,
    ability: BossAbility,
    targetIds: string[],
    damage: number,
    result: AbilityExecutionResult
  ): void {
    // Ultimate abilities deal 50% more damage
    const ultimateDamage = Math.floor(damage * 1.5);
    this.executeDamage(encounter, targetIds, ultimateDamage, result);

    // And apply effects if defined
    if (ability.effect) {
      for (const targetId of targetIds) {
        const playerState = encounter.playerStates.get(targetId) as PlayerState;
        if (!playerState || !playerState.isAlive) continue;

        const effectInstance = BossStatusEffectService.createEffectFromAbility(ability);
        if (effectInstance) {
          const applyResult = BossStatusEffectService.applyEffect(
            playerState,
            effectInstance,
            []
          );

          result.effectsApplied.push({
            targetId,
            effect: ability.effect.type,
            applied: applyResult.applied,
            message: applyResult.message,
          });
        }
      }
    }

    result.narrative = ability.narrative || `${ability.name}: A devastating attack!`;
  }

  /**
   * Execute transformation ability (Phase 19.5 spirit forms)
   */
  private static executeTransformation(
    encounter: IBossEncounter,
    boss: BossEncounter,
    ability: BossAbility,
    result: AbilityExecutionResult
  ): void {
    // Transformation changes boss appearance and may unlock new abilities
    result.environmentalEffect = {
      type: 'transformation',
      description: ability.description,
      duration: ability.effect?.duration || 0, // 0 = permanent
    };

    result.narrative = ability.narrative || `${boss.name} transforms into a terrifying new form!`;
  }

  /**
   * Generate narrative text for ability use
   */
  private static generateNarrative(ability: BossAbility, boss: BossEncounter): string {
    const narratives: Record<BossAbilityType, string[]> = {
      [BossAbilityType.DAMAGE]: [
        `${boss.name} strikes with ${ability.name}!`,
        `${ability.name} crashes down upon you!`,
        `${boss.name} unleashes ${ability.name}!`,
      ],
      [BossAbilityType.AOE]: [
        `${boss.name} unleashes ${ability.name}, striking everyone!`,
        `${ability.name} engulfs the entire area!`,
      ],
      [BossAbilityType.DOT]: [
        `${ability.name} begins to take effect...`,
        `${boss.name}'s ${ability.name} will hurt for a while...`,
      ],
      [BossAbilityType.DEBUFF]: [
        `${ability.name} weakens your resolve!`,
        `${boss.name} curses you with ${ability.name}!`,
      ],
      [BossAbilityType.BUFF]: [
        `${boss.name} grows stronger!`,
        `${ability.name} empowers ${boss.name}!`,
      ],
      [BossAbilityType.SUMMON]: [
        `${boss.name} calls for reinforcements!`,
        `${ability.name} brings new foes to the battle!`,
      ],
      [BossAbilityType.HEAL]: [
        `${boss.name} recovers some strength!`,
        `${ability.name} restores ${boss.name}!`,
      ],
      [BossAbilityType.PHASE_CHANGE]: [
        `The battle shifts dramatically!`,
        `${boss.name} enters a new phase!`,
      ],
      [BossAbilityType.ENVIRONMENTAL]: [
        `The arena becomes more dangerous!`,
        `${ability.name} changes the battlefield!`,
      ],
      [BossAbilityType.ULTIMATE]: [
        `${boss.name} unleashes their ultimate power!`,
        `${ability.name} - a devastating attack!`,
      ],
      [BossAbilityType.TRANSFORMATION]: [
        `${boss.name} transforms!`,
        `${ability.name} reveals ${boss.name}'s true form!`,
      ],
    };

    const options = narratives[ability.type] || [`${boss.name} uses ${ability.name}!`];
    return SecureRNG.select(options);
  }

  /**
   * Process minion attacks (called after boss ability)
   */
  static processMinionAttacks(encounter: IBossEncounter): Array<{
    minionId: string;
    minionName: string;
    targetId: string;
    damage: number;
  }> {
    const attacks: Array<{
      minionId: string;
      minionName: string;
      targetId: string;
      damage: number;
    }> = [];

    const minions = (encounter as any).minions as Minion[] | undefined;
    if (!minions || minions.length === 0) {
      return attacks;
    }

    const alivePlayers = Array.from(encounter.playerStates.entries())
      .filter(([_, state]) => (state as any).isAlive)
      .map(([id, _]) => id);

    if (alivePlayers.length === 0) {
      return attacks;
    }

    for (const minion of minions) {
      if (!minion.isAlive) continue;

      // Each minion attacks a random alive player
      const targetId = SecureRNG.select(alivePlayers);
      const playerState = encounter.playerStates.get(targetId) as PlayerState;

      if (playerState && playerState.isAlive) {
        const damage = minion.damage + SecureRNG.range(-3, 3);

        playerState.health = Math.max(0, playerState.health - damage);
        playerState.damageTaken += damage;

        if (playerState.health <= 0) {
          playerState.isAlive = false;
        }

        attacks.push({
          minionId: minion.id,
          minionName: minion.name,
          targetId,
          damage,
        });
      }
    }

    return attacks;
  }

  /**
   * Process damage to minions from player attacks
   */
  static damageMinion(
    encounter: IBossEncounter,
    minionId: string,
    damage: number
  ): { killed: boolean; damageDealt: number } {
    const minions = (encounter as any).minions as Minion[] | undefined;
    if (!minions) {
      return { killed: false, damageDealt: 0 };
    }

    const minion = minions.find(m => m.id === minionId);
    if (!minion || !minion.isAlive) {
      return { killed: false, damageDealt: 0 };
    }

    const actualDamage = Math.min(damage, minion.health);
    minion.health -= actualDamage;

    if (minion.health <= 0) {
      minion.isAlive = false;
      return { killed: true, damageDealt: actualDamage };
    }

    return { killed: false, damageDealt: actualDamage };
  }

  /**
   * Get count of alive minions
   */
  static getAliveMinionsCount(encounter: IBossEncounter): number {
    const minions = (encounter as any).minions as Minion[] | undefined;
    if (!minions) return 0;

    return minions.filter(m => m.isAlive).length;
  }
}
