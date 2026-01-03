/**
 * Combat Duel Resolver
 * Resolve combat duel games
 */

import { GameState, GameResult } from '../types';

/**
 * Resolve combat duel game
 * Called when status becomes 'resolved' or 'busted'
 */
export function resolveCombatDuelGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const playerWon = state.opponentHP !== undefined && state.opponentHP <= 0;
  const playerDefeated = state.playerHP !== undefined && state.playerHP <= 0;
  const fled = state.status === 'resolved' && !playerWon && !playerDefeated;

  // Calculate score based on performance
  let score = 0;
  if (playerWon) {
    // Score based on HP remaining and rounds taken
    const hpPercent = (state.playerHP || 0) / (state.playerMaxHP || 1);
    const roundsUsed = state.combatRound || 1;
    score = Math.floor(100 + (hpPercent * 50) + (20 / roundsUsed));
  } else if (fled) {
    score = 10; // Minimal score for fleeing
  } else {
    score = 0; // Defeat
  }

  // Calculate rewards based on opponent difficulty and performance
  // PRODUCTION FIX: Round to avoid floating point precision issues (e.g., 1.2000000000000002)
  const difficultyMult = Math.round((1 + ((state.opponentDifficulty || 1) * 0.2)) * 100) / 100;
  const baseGold = playerWon ? Math.floor((30 + (state.opponentDifficulty || 1) * 15) * difficultyMult * suitBonus.multiplier) : 0;
  const baseXP = playerWon ? Math.floor((20 + (state.opponentDifficulty || 1) * 8) * suitBonus.multiplier) : fled ? 5 : 10;

  return {
    success: playerWon,
    score,
    handName: playerWon
      ? `Victory in ${state.combatRound || 1} rounds`
      : fled
        ? 'Fled from battle'
        : `Defeated after ${state.combatRound || 1} rounds`,
    suitMatches,
    suitBonus,
    mitigation: playerDefeated ? {
      damageReduction: Math.min(0.3, suitMatches * 0.1)
    } : undefined,
    rewards: {
      gold: baseGold,
      experience: baseXP
    }
  };
}
