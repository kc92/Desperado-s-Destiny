/**
 * Boss Phase Service - Phase 14, Wave 14.2
 *
 * Handles boss phase transitions, ability selection, and combat rounds.
 * Integrates with BossStatusEffectService and BossAbilityExecutorService
 * for full ability mechanics including DOT, debuffs, summons, and more.
 */

import { SecureRNG } from './base/SecureRNG';
import mongoose from 'mongoose';
import { IBossEncounter } from '../models/BossEncounter.model';
import {
  BossEncounter,
  BossPhase,
  BossAbility,
  BossCombatRound,
  BossAttackRequest,
  getCurrentPhase,
  Card,
  HandRank,
  shuffleDeck,
  drawCards,
  evaluateHand,
  StatusEffect,
} from '@desperados/shared';
import { BossStatusEffectService, StatusEffectResult } from './bossStatusEffect.service';
import { BossAbilityExecutorService, AbilityExecutionResult } from './bossAbilityExecutor.service';
import logger from '../utils/logger';

export class BossPhaseService {
  /**
   * Check if phase should transition
   */
  static checkPhaseTransition(
    encounter: IBossEncounter,
    boss: BossEncounter
  ): boolean {
    const healthPercent = (encounter.bossHealth / encounter.bossMaxHealth) * 100;
    const currentPhase = getCurrentPhase(encounter.bossHealth, encounter.bossMaxHealth, boss.phases);

    if (currentPhase.phaseNumber > encounter.currentPhase) {
      encounter.currentPhase = currentPhase.phaseNumber;
      logger.info(
        `Boss ${boss.name} entered phase ${currentPhase.phaseNumber}: ${currentPhase.name}`
      );
      return true;
    }

    return false;
  }

  /**
   * Select boss ability for this turn
   */
  static selectBossAbility(
    boss: BossEncounter,
    currentPhase: BossPhase,
    cooldowns: Map<string, number>
  ): BossAbility {
    // Get available abilities for current phase
    const availableAbilities = boss.abilities.filter(ability => {
      // Check if ability requires specific phase
      if (ability.requiresPhase && ability.requiresPhase > currentPhase.phaseNumber) {
        return false;
      }

      // Check if ability is in current phase's ability list
      if (!currentPhase.abilities.includes(ability.id)) {
        return false;
      }

      // Check cooldown
      const cooldown = cooldowns.get(ability.id) || 0;
      if (cooldown > 0) {
        return false;
      }

      return true;
    });

    if (availableAbilities.length === 0) {
      // Fallback to basic attack
      return boss.abilities[0];
    }

    // Sort by priority (higher = more likely)
    availableAbilities.sort((a, b) => b.priority - a.priority);

    // Weighted random selection based on priority
    const totalPriority = availableAbilities.reduce((sum, a) => sum + a.priority, 0);
    let roll = SecureRNG.float(0, 1) * totalPriority;

    for (const ability of availableAbilities) {
      roll -= ability.priority;
      if (roll <= 0) {
        return ability;
      }
    }

    return availableAbilities[0];
  }

  /**
   * Apply ability cooldown
   */
  static applyCooldown(
    cooldowns: Map<string, number>,
    abilityId: string,
    duration: number
  ): void {
    cooldowns.set(abilityId, duration);
  }

  /**
   * Decrease all cooldowns
   */
  static decreaseCooldowns(cooldowns: Map<string, number>): void {
    for (const [abilityId, remaining] of cooldowns.entries()) {
      if (remaining > 0) {
        cooldowns.set(abilityId, remaining - 1);
      }
    }
  }

  /**
   * Calculate boss damage with modifiers
   */
  static calculateBossDamage(
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

    // Add variance
    const variance = SecureRNG.range(-10, 10);
    damage += variance;

    return Math.max(1, damage);
  }

  /**
   * Process combat round with full ability mechanics
   */
  static async processCombatRound(
    encounter: IBossEncounter,
    boss: BossEncounter,
    characterId: string,
    action: BossAttackRequest,
    session: mongoose.ClientSession
  ): Promise<BossCombatRound> {
    // Get current phase
    const currentPhase = getCurrentPhase(
      encounter.bossHealth,
      encounter.bossMaxHealth,
      boss.phases
    );

    // === START OF TURN: Process status effects for all players ===
    const statusEffectResults = new Map<string, StatusEffectResult>();
    for (const [playerId, playerState] of encounter.playerStates.entries()) {
      if ((playerState as any).isAlive) {
        const effectResult = BossStatusEffectService.processEffects(playerState as any);
        statusEffectResults.set(playerId, effectResult);

        if (effectResult.damage > 0) {
          logger.debug(`Player ${playerId} took ${effectResult.damage} DOT damage`);
        }
      }
    }

    // Get modifiers for the acting player
    const playerState = encounter.playerStates.get(characterId);
    const playerModifiers = playerState
      ? BossStatusEffectService.getCombinedModifiers(playerState as any)
      : { damageMultiplier: 1, defenseMultiplier: 1, handSizeModifier: 0, canAct: true };

    // Process player action (with modifiers)
    const playerAction = await this.processPlayerAction(
      encounter,
      characterId,
      action,
      playerModifiers
    );

    // Apply damage to boss
    if (playerAction.damage && playerAction.damage > 0) {
      encounter.bossHealth = Math.max(0, encounter.bossHealth - playerAction.damage);

      // Update player damage dealt
      if (playerState) {
        (playerState as any).damageDealt += playerAction.damage;
      }
    }

    // Check phase transition
    const phaseChanged = this.checkPhaseTransition(encounter, boss);

    // === BOSS TURN: Execute ability with full mechanics ===
    const bossAbilityResult = await this.processBossActionWithAbilities(
      encounter,
      boss,
      currentPhase
    );

    // === MINION ATTACKS (if any) ===
    const minionAttacks = BossAbilityExecutorService.processMinionAttacks(encounter);

    // Decrease cooldowns
    this.decreaseCooldowns(encounter.abilityCooldowns);

    // === END OF TURN: Decay status effects ===
    const expiredEffects = new Map<string, string[]>();
    for (const [playerId, playerState] of encounter.playerStates.entries()) {
      if ((playerState as any).isAlive) {
        const expired = BossStatusEffectService.decayEffects(playerState as any);
        if (expired.length > 0) {
          expiredEffects.set(playerId, expired);
        }
      }
    }

    // Build round result with enhanced data
    const round: BossCombatRound = {
      roundNumber: encounter.turnCount + 1,
      playerActions: [playerAction],
      bossActions: [{
        abilityId: bossAbilityResult.abilityId,
        abilityName: bossAbilityResult.abilityName,
        targetIds: bossAbilityResult.targetIds,
        damage: bossAbilityResult.damage,
        effectsApplied: bossAbilityResult.effectsApplied,
        narrative: bossAbilityResult.narrative,
        telegraphMessage: bossAbilityResult.telegraphMessage,
        minionsSpawned: bossAbilityResult.minionsSpawned,
        minionAttacks: minionAttacks.length > 0 ? minionAttacks : undefined,
      }],
      bossHealthAfter: encounter.bossHealth,
      playerHealthsAfter: new Map(
        Array.from(encounter.playerStates.entries()).map(([id, state]) => [
          id,
          (state as any).health,
        ])
      ),
      phaseChange: phaseChanged ? encounter.currentPhase : undefined,
      statusEffectDamage: statusEffectResults.size > 0
        ? Object.fromEntries(
            Array.from(statusEffectResults.entries()).map(([id, result]) => [id, result.damage])
          )
        : undefined,
      expiredEffects: expiredEffects.size > 0
        ? Object.fromEntries(expiredEffects)
        : undefined,
    };

    return round;
  }

  /**
   * Process player action with status effect modifiers
   */
  private static async processPlayerAction(
    encounter: IBossEncounter,
    characterId: string,
    action: BossAttackRequest,
    modifiers: { damageMultiplier: number; defenseMultiplier: number; handSizeModifier: number; canAct: boolean } = {
      damageMultiplier: 1,
      defenseMultiplier: 1,
      handSizeModifier: 0,
      canAct: true,
    }
  ): Promise<{
    characterId: string;
    action: 'attack' | 'defend' | 'item' | 'flee';
    cards?: Card[];
    handRank?: HandRank;
    damage?: number;
    targetId?: string;
    stunned?: boolean;
  }> {
    const playerState = encounter.playerStates.get(characterId);
    if (!playerState || !(playerState as any).isAlive) {
      return {
        characterId,
        action: 'attack',
        damage: 0,
      };
    }

    // Check if player can act (stunned, feared, etc.)
    if (!modifiers.canAct) {
      logger.debug(`Player ${characterId} cannot act due to status effects`);
      return {
        characterId,
        action: 'attack',
        damage: 0,
        stunned: true,
      };
    }

    if (action.action === 'flee') {
      // Check for ROOT effect preventing flee
      if (BossStatusEffectService.hasEffect(playerState as any, StatusEffect.ROOT)) {
        return {
          characterId,
          action: 'flee',
          damage: 0,
          stunned: true, // Can't flee while rooted
        };
      }
      return {
        characterId,
        action: 'flee',
        damage: 0,
      };
    }

    if (action.action === 'defend') {
      // Reduce damage taken this turn
      return {
        characterId,
        action: 'defend',
        damage: 0,
      };
    }

    if (action.action === 'item') {
      // Check for SILENCE effect preventing item use
      if (BossStatusEffectService.hasEffect(playerState as any, StatusEffect.SILENCE)) {
        return {
          characterId,
          action: 'item',
          damage: 0,
          stunned: true, // Can't use items while silenced
        };
      }
      return {
        characterId,
        action: 'item',
        damage: 0,
      };
    }

    // Attack action - use card-based combat
    const deck = shuffleDeck();

    // Apply hand size modifier from status effects (minimum 3 cards)
    const handSize = Math.max(3, 5 + modifiers.handSizeModifier);
    const { drawn } = drawCards(deck, handSize);
    const evaluation = evaluateHand(drawn.slice(0, 5)); // Evaluate best 5 cards

    // Base damage from hand rank
    const baseDamageByRank: Record<HandRank, number> = {
      [HandRank.ROYAL_FLUSH]: 300,
      [HandRank.STRAIGHT_FLUSH]: 250,
      [HandRank.FOUR_OF_A_KIND]: 200,
      [HandRank.FULL_HOUSE]: 180,
      [HandRank.FLUSH]: 150,
      [HandRank.STRAIGHT]: 120,
      [HandRank.THREE_OF_A_KIND]: 100,
      [HandRank.TWO_PAIR]: 80,
      [HandRank.PAIR]: 60,
      [HandRank.HIGH_CARD]: 40,
    };

    const baseDamage = baseDamageByRank[evaluation.rank] || 40;

    // Apply damage multiplier from status effects
    const finalDamage = Math.floor(baseDamage * modifiers.damageMultiplier);

    return {
      characterId,
      action: 'attack',
      cards: drawn,
      handRank: evaluation.rank,
      damage: finalDamage,
      targetId: action.targetId,
    };
  }

  /**
   * Process boss action using the full ability executor
   * This is the new implementation that handles all ability types
   */
  private static async processBossActionWithAbilities(
    encounter: IBossEncounter,
    boss: BossEncounter,
    currentPhase: BossPhase
  ): Promise<AbilityExecutionResult> {
    // Select ability based on phase, cooldowns, and priority
    const ability = this.selectBossAbility(boss, currentPhase, encounter.abilityCooldowns);

    // Execute the ability with full mechanics
    const result = BossAbilityExecutorService.executeAbility(
      encounter,
      boss,
      ability,
      currentPhase,
      boss.damage
    );

    // Apply cooldown
    if (ability.cooldown > 0) {
      this.applyCooldown(encounter.abilityCooldowns, ability.id, ability.cooldown);
    }

    return result;
  }

  /**
   * Legacy process boss action (kept for backwards compatibility)
   * @deprecated Use processBossActionWithAbilities instead
   */
  private static async processBossAction(
    encounter: IBossEncounter,
    boss: BossEncounter,
    currentPhase: BossPhase
  ): Promise<{
    abilityId: string;
    abilityName: string;
    targetIds: string[];
    damage: number;
    effectsApplied: any[];
  }> {
    const result = await this.processBossActionWithAbilities(encounter, boss, currentPhase);
    return {
      abilityId: result.abilityId,
      abilityName: result.abilityName,
      targetIds: result.targetIds,
      damage: result.damage,
      effectsApplied: result.effectsApplied,
    };
  }

  /**
   * Select targets for boss ability
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
        // Target random alive player
        return [SecureRNG.select(alivePlayers)];

      case 'all':
        // Target all alive players
        return alivePlayers;

      case 'random':
        // Target 1-3 random players
        const count = Math.min(SecureRNG.range(1, 3), alivePlayers.length);
        const shuffled = SecureRNG.shuffle([...alivePlayers]);
        return shuffled.slice(0, count);

      default:
        return [alivePlayers[0]];
    }
  }
}
