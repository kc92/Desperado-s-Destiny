/**
 * Boss Phase Service - Phase 14, Wave 14.2
 *
 * Handles boss phase transitions, ability selection, and combat rounds
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
} from '@desperados/shared';
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
   * Process combat round
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

    // Process player action
    const playerAction = await this.processPlayerAction(
      encounter,
      characterId,
      action
    );

    // Apply damage to boss
    if (playerAction.damage && playerAction.damage > 0) {
      encounter.bossHealth = Math.max(0, encounter.bossHealth - playerAction.damage);

      // Update player damage dealt
      const playerState = encounter.playerStates.get(characterId);
      if (playerState) {
        (playerState as any).damageDealt += playerAction.damage;
      }
    }

    // Check phase transition
    this.checkPhaseTransition(encounter, boss);

    // Process boss action
    const bossAction = await this.processBossAction(
      encounter,
      boss,
      currentPhase
    );

    // Decrease cooldowns
    this.decreaseCooldowns(encounter.abilityCooldowns);

    // Build round result
    const round: BossCombatRound = {
      roundNumber: encounter.turnCount + 1,
      playerActions: [playerAction],
      bossActions: [bossAction],
      bossHealthAfter: encounter.bossHealth,
      playerHealthsAfter: new Map(
        Array.from(encounter.playerStates.entries()).map(([id, state]) => [
          id,
          (state as any).health,
        ])
      ),
      phaseChange: encounter.currentPhase !== currentPhase.phaseNumber
        ? encounter.currentPhase
        : undefined,
    };

    return round;
  }

  /**
   * Process player action
   */
  private static async processPlayerAction(
    encounter: IBossEncounter,
    characterId: string,
    action: BossAttackRequest
  ): Promise<{
    characterId: string;
    action: 'attack' | 'defend' | 'item' | 'flee';
    cards?: Card[];
    handRank?: HandRank;
    damage?: number;
    targetId?: string;
  }> {
    const playerState = encounter.playerStates.get(characterId);
    if (!playerState || !(playerState as any).isAlive) {
      return {
        characterId,
        action: 'attack',
        damage: 0,
      };
    }

    if (action.action === 'flee') {
      // TODO: Handle flee
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
      // TODO: Handle item use
      return {
        characterId,
        action: 'item',
        damage: 0,
      };
    }

    // Attack action - use card-based combat
    const deck = shuffleDeck();
    const { drawn } = drawCards(deck, 5);
    const evaluation = evaluateHand(drawn);

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

    const damage = baseDamageByRank[evaluation.rank] || 40;

    return {
      characterId,
      action: 'attack',
      cards: drawn,
      handRank: evaluation.rank,
      damage,
      targetId: action.targetId,
    };
  }

  /**
   * Process boss action
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
    // Select ability
    const ability = this.selectBossAbility(boss, currentPhase, encounter.abilityCooldowns);

    // Calculate damage
    const damage = this.calculateBossDamage(ability, currentPhase, boss.damage);

    // Select targets
    const targetIds = this.selectTargets(encounter, ability);

    // Apply damage
    for (const targetId of targetIds) {
      const playerState = encounter.playerStates.get(targetId);
      if (playerState) {
        (playerState as any).health = Math.max(0, (playerState as any).health - damage);
        (playerState as any).damageTaken += damage;

        if ((playerState as any).health <= 0) {
          (playerState as any).isAlive = false;
        }
      }
    }

    // Apply cooldown
    if (ability.cooldown > 0) {
      this.applyCooldown(encounter.abilityCooldowns, ability.id, ability.cooldown);
    }

    return {
      abilityId: ability.id,
      abilityName: ability.name,
      targetIds,
      damage,
      effectsApplied: [],
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
