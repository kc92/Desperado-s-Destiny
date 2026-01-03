/**
 * AI Decisions
 * AI opponent combat logic and turn processing
 */

import { Card } from '@desperados/shared';
import { SecureRNG } from '../../base/SecureRNG';
import { GameState } from '../types';
import { getCardCombatValue } from './cardValues';
import { calculateCombatDamage, calculateCombatDefense } from './combatEngine';

/**
 * AI opponent decides how to split cards between attack and defense
 * Higher difficulty = smarter decisions
 */
export function simulateOpponentCombat(
  hand: Card[],
  difficulty: number
): { attack: number; defense: number; attackCards: Card[]; defenseCards: Card[] } {
  // Sort cards by value (highest first)
  const sortedCards = [...hand].sort((a, b) => getCardCombatValue(b) - getCardCombatValue(a));

  // Determine split based on difficulty
  // Easy (1-3): Random split
  // Medium (4-6): 3 attack, 2 defense
  // Hard (7-9): Optimal split based on situation
  // Extreme (10): All-in attack

  let attackCount: number;

  if (difficulty <= 3) {
    // Random split
    attackCount = SecureRNG.range(1, 4); // 1-4 cards for attack
  } else if (difficulty <= 6) {
    // Balanced: 3 attack, 2 defense
    attackCount = 3;
  } else if (difficulty <= 9) {
    // Aggressive: 4 attack, 1 defense
    attackCount = 4;
  } else {
    // All-out: 5 attack, 0 defense (high risk, high reward)
    attackCount = 5;
  }

  const attackCards = sortedCards.slice(0, attackCount);
  const defenseCards = sortedCards.slice(attackCount);

  const attack = calculateCombatDamage(attackCards, difficulty, 0);
  const defense = calculateCombatDefense(defenseCards, 0, 0);

  return { attack, defense, attackCards, defenseCards };
}

/**
 * Process combat turn
 * Player has already selected which cards to use for attack/defense
 */
export function processCombatTurn(state: GameState): {
  playerDamageDealt: number;
  playerDamageTaken: number;
  opponentDefeated: boolean;
  playerDefeated: boolean;
} {
  const attackIndices = state.attackCards || [];
  const defenseIndices = state.defenseCards || [];

  // Get actual cards from indices
  const attackCards = attackIndices.map(i => state.hand[i]).filter(Boolean);
  const defenseCards = defenseIndices.map(i => state.hand[i]).filter(Boolean);

  // Calculate player's attack damage
  const skillMod = Math.floor((state.characterSuitBonus || 0) * 0.3);
  const playerAttack = calculateCombatDamage(attackCards, state.weaponBonus || 0, skillMod);
  const playerDefense = calculateCombatDefense(defenseCards, state.armorBonus || 0, skillMod);

  // Get opponent's pre-calculated attack (shown to player for strategy)
  const opponentAttack = state.opponentAttackDamage || 0;
  const opponentDefense = state.opponentDefenseReduction || 0;

  // Calculate actual damage dealt
  // Player damage is reduced by opponent defense
  const playerDamageDealt = Math.max(1, playerAttack - opponentDefense);
  // Opponent damage is reduced by player defense
  const playerDamageTaken = Math.max(0, opponentAttack - playerDefense);

  // Apply damage
  state.opponentHP = Math.max(0, (state.opponentHP || 0) - playerDamageDealt);
  state.playerHP = Math.max(0, (state.playerHP || 0) - playerDamageTaken);

  // Store for UI display
  state.lastPlayerDamage = playerDamageDealt;
  state.lastOpponentDamage = playerDamageTaken;

  return {
    playerDamageDealt,
    playerDamageTaken,
    opponentDefeated: state.opponentHP <= 0,
    playerDefeated: state.playerHP <= 0
  };
}
